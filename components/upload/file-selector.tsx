"use client"

import React, { useCallback } from 'react'
import { useUpload } from '@/hooks/use-upload'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X } from 'lucide-react'

export function FileSelector() {
  const { state, setFile } = useUpload()

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log(`[FileSelector] File selected:`, file?.name, file?.size)
    
    if (file) {
      // Validação básica do arquivo
      const allowedExtensions = ['xlsx', 'xls', 'csv']
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        console.error(`[FileSelector] Invalid file type:`, fileExtension)
        alert('Formato de arquivo não suportado. Use .xlsx, .xls ou .csv')
        return
      }
      
      if (file.size > maxSize) {
        console.error(`[FileSelector] File too large:`, file.size)
        alert('Arquivo muito grande. Tamanho máximo: 10MB')
        return
      }
      
      if (file.size === 0) {
        console.error(`[FileSelector] Empty file`)
        alert('Arquivo está vazio')
        return
      }
      
      console.log(`[FileSelector] File validation passed, calling setFile`)
      setFile(file)
    }
    
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = ''
  }, [setFile])

  const handleRemoveFile = useCallback(() => {
    console.log(`[FileSelector] Removing file`)
    setFile(null)
  }, [setFile])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (state.isAnalyzing) {
    return (
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
        <div>
          <h3 className="text-lg font-medium text-planilhorti-brown">
            Analisando Arquivo
          </h3>
          <p className="text-planilhorti-brown/70 mt-1">
            Detectando estrutura e tipos de dados...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
        {/* BOTÃO DE TESTE - REMOVER DEPOIS */}
          {process.env.NODE_ENV === 'development' && state.file && !state.isAnalyzing && (
            <Button 
              onClick={() => {
                console.log('Forcing view change to schema')
                // Force view change for testing
                window.dispatchEvent(new CustomEvent('force-schema-view'))
              }}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              TESTE: Forçar ir para Schema
            </Button>
          )}
        </div>
      )}

      {/* Dicas */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Dicas para upload:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Certifique-se de que a primeira linha contém os cabeçalhos das colunas</li>
          <li>• Remova linhas vazias desnecessárias antes do upload</li>
          <li>• Arquivos grandes podem levar alguns minutos para processar</li>
          <li>• Use formatos .xlsx, .xls ou .csv para melhor compatibilidade</li>
        </ul>
      </div>
    </div>
  )
}