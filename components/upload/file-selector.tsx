"use client"

import React, { useCallback } from 'react'
import { useUpload } from '@/hooks/use-upload'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X, ArrowRight, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function FileSelector() {
  const { state, setFile, goToStep, canProceed } = useUpload()

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log(`[FileSelector] File selected:`, file?.name, file?.size)
    
    if (file) {
      // Validação básica do arquivo
      const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv']
      const allowedExtensions = ['xlsx', 'xls', 'csv']
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        console.error(`[FileSelector] Invalid file type:`, fileExtension)
        return
      }
      
      if (file.size > maxSize) {
        console.error(`[FileSelector] File too large:`, file.size)
        return
      }
      
      if (file.size === 0) {
        console.error(`[FileSelector] Empty file`)
        return
      }
      
      setFile(file)
    }
    
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = ''
  }, [setFile])

  const handleRemoveFile = useCallback(() => {
    console.log(`[FileSelector] Removing file`)
    setFile(null)
  }, [setFile])

  const handleNext = useCallback(() => {
    console.log(`[FileSelector] Next button clicked`)
    console.log(`[FileSelector] Can proceed:`, canProceed(1))
    console.log(`[FileSelector] Current state:`, {
      hasFile: !!state.file,
      fileName: state.file?.name,
      fileSize: state.file?.size
    })
    
    if (canProceed(1)) {
      console.log(`[FileSelector] Proceeding to step 2`)
      goToStep(2)
    } else {
      console.warn(`[FileSelector] Cannot proceed - validation failed`)
    }
  }, [canProceed, goToStep, state.file])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-planilhorti-brown mb-2">
          Selecione o Arquivo
        </h3>
        <p className="text-sm text-planilhorti-brown/70 mb-4">
          Faça upload de uma planilha Excel (.xlsx, .xls) ou CSV (.csv) para começar
        </p>
      </div>

      {!state.file ? (
        <div className="border-2 border-dashed border-planilhorti-brown/20 rounded-lg p-8 text-center hover:border-planilhorti-brown/40 transition-colors">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 text-planilhorti-brown/50 mx-auto mb-4" />
            <div>
              <p className="font-medium text-planilhorti-brown">
                Clique para selecionar um arquivo
              </p>
              <p className="text-sm text-planilhorti-brown/60 mt-1">
                Suporta arquivos .xlsx, .xls e .csv até 10MB
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-planilhorti-brown/20 rounded-lg p-4 bg-planilhorti-cream/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-planilhorti-brown">{state.file.name}</p>
                  <p className="text-sm text-planilhorti-brown/70">
                    {formatFileSize(state.file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-planilhorti-brown/50 hover:text-planilhorti-brown"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Debug Info - remover em produção */}
          {process.env.NODE_ENV === 'development' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Debug:</strong> Arquivo válido: {canProceed(1) ? 'Sim' : 'Não'} | 
                Tamanho: {state.file.size} bytes | 
                Extensão: {state.file.name.split('.').pop()}
              </AlertDescription>
            </Alert>
          )}

          {/* Botão Próximo */}
          <div className="flex justify-end">
            <Button 
              onClick={handleNext}
              disabled={!canProceed(1)}
              className="bg-primary hover:bg-primary/90"
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}