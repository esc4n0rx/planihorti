"use client"

import React, { useCallback } from 'react'
import { useUpload } from '@/hooks/use-upload'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X, ArrowRight } from 'lucide-react'

export function FileSelector() {
  const { state, setFile, goToStep, canProceed } = useUpload()

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }, [setFile])

  const handleRemoveFile = useCallback(() => {
    setFile(null)
  }, [setFile])

  const handleNext = useCallback(() => {
    if (canProceed(1)) {
      goToStep(2)
    }
  }, [canProceed, goToStep])

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