import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export interface ParsedData {
  headers: string[]
  rows: any[][]
  totalRows: number
}

export class FileParser {
  static async parseFile(file: File): Promise<ParsedData> {
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return this.parseExcel(file)
      case 'csv':
        return this.parseCSV(file)
      default:
        throw new Error('Formato de arquivo não suportado. Use .xlsx, .xls ou .csv')
    }
  }

  private static async parseExcel(file: File): Promise<ParsedData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          
          // Pegar a primeira planilha
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          
          // Converter para JSON preservando a estrutura
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: null,
            blankrows: false
          }) as any[][]
          
          if (jsonData.length === 0) {
            throw new Error('Planilha está vazia')
          }
          
          const headers = jsonData[0]?.map(h => String(h || '').trim()).filter(Boolean) || []
          const rows = jsonData.slice(1).filter(row => 
            row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
          )
          
          if (headers.length === 0) {
            throw new Error('Não foi possível identificar cabeçalhos na planilha')
          }
          
          resolve({
            headers,
            rows,
            totalRows: rows.length
          })
        } catch (error) {
          reject(new Error(`Erro ao processar arquivo Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`))
        }
      }
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      reader.readAsArrayBuffer(file)
    })
  }

  private static async parseCSV(file: File): Promise<ParsedData> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: 'greedy',
        transformHeader: (header: string) => header.trim(),
        complete: (results) => {
          try {
            if (results.errors.length > 0) {
              throw new Error(`Erro no CSV: ${results.errors[0].message}`)
            }
            
            const data = results.data as any[][]
            
            if (data.length === 0) {
              throw new Error('Arquivo CSV está vazio')
            }
            
            const headers = data[0]?.map(h => String(h || '').trim()).filter(Boolean) || []
            const rows = data.slice(1).filter(row => 
              row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
            )
            
            if (headers.length === 0) {
              throw new Error('Não foi possível identificar cabeçalhos no CSV')
            }
            
            resolve({
              headers,
              rows,
              totalRows: rows.length
            })
          } catch (error) {
            reject(error)
          }
        },
        error: (error) => {
          reject(new Error(`Erro ao processar CSV: ${error.message}`))
        }
      })
    })
  }
}