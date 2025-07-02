// lib/upload-service.ts
import { FileParser } from './file-parser'
import { SchemaDetector } from './schema-detector'
import { DetectedSchema } from '@/types/upload'

export class UploadService {
  static async analyzeFile(file: File): Promise<DetectedSchema> {
    try {
      // Validar arquivo
      this.validateFile(file)
      
      // Parse do arquivo
      const parsedData = await FileParser.parseFile(file)
      
      // Detectar schema
      const schema = SchemaDetector.detectSchema(
        parsedData.headers,
        parsedData.rows,
        file.name,
        file.size
      )
      
      return schema
    } catch (error) {
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
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new Error('Formato de arquivo não suportado. Use .xlsx, .xls ou .csv')
    }
    
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 10MB')
    }
    
    if (file.size === 0) {
      throw new Error('Arquivo está vazio')
    }
  }
}