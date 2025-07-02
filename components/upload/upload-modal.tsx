// components/upload/upload-modal.tsx
"use client"

import React, { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'
import { UploadService } from '@/lib/upload-service'
import { DetectedSchema } from '@/types/upload-simple'

interface UploadModalProps {
  children: React.ReactNode
  onUploadComplete?: () => void
}

export function UploadModal({ children, onUploadComplete }: UploadModalProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [schema, setSchema] = useState<DetectedSchema | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const reset = useCallback(() => {
    setFile(null)
    setSchema(null)
    setError(null)
    setSuccess(false)
    setIsAnalyzing(false)
    setIsUploading(false)
  }, [])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    
    if (!selectedFile) return

    // Validação básica
    const allowedExtensions = ['xlsx', 'xls', 'csv']
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setError('Formato de arquivo não suportado. Use .xlsx, .xls ou .csv')
      return
    }
    
    if (selectedFile.size > maxSize) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB')
      return
    }
    
    if (selectedFile.size === 0) {
      setError('Arquivo está vazio')
      return
    }

    setFile(selectedFile)
    setError(null)
    
    // Analisar arquivo automaticamente
    try {
      setIsAnalyzing(true)
      const detectedSchema = await UploadService.analyzeFile(selectedFile)
      setSchema(detectedSchema)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro na análise do arquivo')
    } finally {
      setIsAnalyzing(false)
    }

    // Limpar input
    e.target.value = ''
  }, [])

  const handleUpload = useCallback(async () => {
    if (!file || !schema) return

    setIsUploading(true)
    setError(null)

    try {
      // Converter arquivo para base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1]) // Remove prefixo data:type;base64,
        }
        reader.onerror = error => reject(error)
      })

      // Fazer upload
      const response = await fetch('/api/uploads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_data: fileData,
          file_name: file.name,
          file_size: file.size,
          schema: schema.columns,
          sample_data: schema.sampleData,
          total_rows: schema.totalRows
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro no upload')
      }

      setSuccess(true)
      onUploadComplete?.()
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        setOpen(false)
        reset()
      }, 2000)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro no upload')
    } finally {
      setIsUploading(false)
    }
  }, [file, schema, onUploadComplete, reset])

  const handleRemoveFile = useCallback(() => {
    setFile(null)
    setSchema(null)
    setError(null)
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getProgress = () => {
    if (success) return 100
    if (isUploading) return 75
    if (schema) return 50
    if (file) return 25
    return 0
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) reset()
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-primary" />
            <span>Upload de Arquivo</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Progress value={getProgress()} className="w-full" />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-primary mx-auto" />
              <div>
                <h3 className="font-medium text-planilhorti-brown">Upload Concluído!</h3>
                <p className="text-sm text-planilhorti-brown/70 mt-1">
                  Arquivo processado e salvo com sucesso
                </p>
              </div>
            </div>
          ) : !file ? (
            <div className="border-2 border-dashed border-planilhorti-brown/20 rounded-lg p-6 text-center hover:border-planilhorti-brown/40 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
                id="upload-file"
                disabled={isAnalyzing || isUploading}
              />
              <label htmlFor="upload-file" className="cursor-pointer">
                <Upload className="h-8 w-8 text-planilhorti-brown/50 mx-auto mb-2" />
                <div>
                  <p className="font-medium text-planilhorti-brown text-sm">
                    Clique para selecionar
                  </p>
                  <p className="text-xs text-planilhorti-brown/60 mt-1">
                    .xlsx, .xls, .csv (máx 10MB)
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Arquivo Selecionado */}
              <div className="border border-planilhorti-brown/20 rounded-lg p-3 bg-planilhorti-cream/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-planilhorti-brown text-sm">{file.name}</p>
                      <p className="text-xs text-planilhorti-brown/70">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={isAnalyzing || isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Status da Análise */}
              {isAnalyzing && (
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary mx-auto"></div>
                  <p className="text-sm text-planilhorti-brown/70">
                    Analisando estrutura do arquivo...
                  </p>
                </div>
              )}

              {/* Schema Detectado */}
              {schema && !isAnalyzing && (
                <div className="bg-green-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Arquivo Analisado
                    </span>
                  </div>
                  <div className="text-xs text-green-700 space-y-1">
                    <div>• {schema.columns.length} colunas detectadas</div>
                    <div>• {schema.totalRows} linhas de dados</div>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isAnalyzing || isUploading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!schema || isAnalyzing || isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    'Fazer Upload'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}