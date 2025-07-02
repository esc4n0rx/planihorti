// lib/upload-service.ts
import { FileParser } from './file-parser'
import { SchemaDetector } from './schema-detector'
import { DetectedSchema } from '@/types/upload'

export class UploadService {
  static async analyzeFile(file: File): Promise<DetectedSchema> {
    try {
      console.log(`[UploadService] Starting file analysis for:`, file.name)
      
      // Validar arquivo
      this.validateFile(file)
      console.log(`[UploadService] File validation passed`)
      
      // Parse do arquivo
      console.log(`[UploadService] Parsing file...`)
      const parsedData = await FileParser.parseFile(file)
      console.log(`[UploadService] File parsed successfully:`, {
        headers: parsedData.headers.length,
        rows: parsedData.totalRows
      })
      
      // Detectar schema
      console.log(`[UploadService] Detecting schema...`)
      const schema = SchemaDetector.detectSchema(
        parsedData.headers,
        parsedData.rows,
        file.name,
        file.size
      )
      console.log(`[UploadService] Schema detection completed:`, {
        columns: schema.columns.length,
        sampleData: schema.sampleData.length
      })
      
      return schema
    } catch (error) {
      console.error(`[UploadService] Analysis error:`, error)
      throw new Error(`Erro na análise do arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  private static validateFile(file: File): void {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ]
    
    const allowedExtensions = ['xlsx', 'xls', 'csv']
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    console.log(`[UploadService] Validating file:`, {
      name: file.name,
      size: file.size,
      type: file.type,
      extension: fileExtension
    })
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new Error('Formato de arquivo não suportado. Use .xlsx, .xls ou .csv')
    }
    
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 10MB')
    }
    
    if (file.size === 0) {
      throw new Error('Arquivo está vazio')
    }
    
    console.log(`[UploadService] File validation completed successfully`)
  }
}