// lib/schema-detector.ts
import { ColumnSchema } from '@/types/upload'

export class SchemaDetector {
  static detectSchema(headers: string[], rows: any[][], fileName: string, fileSize: number) {
    const columns: ColumnSchema[] = headers.map((header, index) => {
      const columnData = rows.map(row => row[index]).filter(val => 
        val !== null && val !== undefined && String(val).trim() !== ''
      )
      
      const sampleValues = columnData.slice(0, 5) // Primeiros 5 valores para amostra
      const type = this.detectColumnType(columnData)
      const required = columnData.length > 0 && (columnData.length / rows.length) > 0.8
      
      return {
        name: this.sanitizeColumnName(header),
        originalName: header,
        type,
        required,
        position: index,
        sample_values: sampleValues
      }
    })
    
    // Preparar dados de amostra (primeiras 10 linhas)
    const sampleData = rows.slice(0, 10).map(row => {
      const record: Record<string, any> = {}
      headers.forEach((header, index) => {
        const columnName = this.sanitizeColumnName(header)
        record[columnName] = row[index]
      })
      return record
    })
    
    return {
      columns,
      totalRows: rows.length,
      sampleData,
      fileName,
      fileSize
    }
  }

  private static detectColumnType(values: any[]): 'text' | 'number' | 'date' | 'boolean' {
    if (values.length === 0) return 'text'
    
    const nonEmptyValues = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '')
    
    if (nonEmptyValues.length === 0) return 'text'
    
    // Detectar boolean
    const booleanCount = nonEmptyValues.filter(v => 
      typeof v === 'boolean' || 
      ['true', 'false', 'sim', 'não', 'yes', 'no', '1', '0'].includes(String(v).toLowerCase())
    ).length
    
    if (booleanCount / nonEmptyValues.length > 0.8) return 'boolean'
    
    // Detectar number
    const numberCount = nonEmptyValues.filter(v => {
      const num = Number(v)
      return !isNaN(num) && isFinite(num)
    }).length
    
    if (numberCount / nonEmptyValues.length > 0.8) return 'number'
    
    // Detectar date
    const dateCount = nonEmptyValues.filter(v => {
      const dateStr = String(v)
      // Padrões comuns de data
      const datePatterns = [
        /^\d{1,2}\/\d{1,2}\/\d{4}$/, // DD/MM/YYYY
        /^\d{4}-\d{1,2}-\d{1,2}$/, // YYYY-MM-DD
        /^\d{1,2}-\d{1,2}-\d{4}$/, // DD-MM-YYYY
      ]
      
      return datePatterns.some(pattern => pattern.test(dateStr)) || !isNaN(Date.parse(dateStr))
    }).length
    
    if (dateCount / nonEmptyValues.length > 0.8) return 'date'
    
    return 'text'
  }

  private static sanitizeColumnName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '_') // Substitui espaços por underscore
      .replace(/_{2,}/g, '_') // Remove underscores duplos
      .replace(/^_|_$/g, '') // Remove underscores do início e fim
      || 'coluna_sem_nome'
  }
}