// components/upload/import-progress.tsx
"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUpload } from '@/hooks/use-upload'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Upload, FileText } from 'lucide-react'

export function ImportProgress() {
  const router = useRouter()
  const { state, importData, reset } = useUpload()

  useEffect(() => {
    if (!state.isImporting && !state.success && !state.error) {
      importData()
    }
  }, [state.isImporting, state.success, state.error, importData])

  const handleViewCollection = () => {
    if (state.collection) {
      router.push(`/collection/${state.collection.id}`)
    }
  }

  const handleNewUpload = () => {
    reset()
  }

  if (state.success) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <CheckCircle className="h-16 w-16 text-primary mx-auto" />
          <div>
            <h3 className="text-xl font-semibold text-planilhorti-brown">
              Importação Concluída!
            </h3>
            <p className="text-planilhorti-brown/70 mt-2">
              Seus dados foram importados com sucesso para a coleção "{state.collection?.name}"
            </p>
          </div>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Arquivo:</span>
                <span className="font-medium">{state.file?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Colunas processadas:</span>
                <span className="font-medium">{state.configuredSchema?.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total de linhas:</span>
                <span className="font-medium">{state.detectedSchema?.totalRows}</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex space-x-4 justify-center">
          <Button
            variant="outline"
            onClick={handleNewUpload}
          >
            <Upload className="h-4 w-4 mr-2" />
            Novo Upload
          </Button>
          <Button
            onClick={handleViewCollection}
            className="bg-primary hover:bg-primary/90"
          >
            <FileText className="h-4 w-4 mr-2" />
            Ver Coleção
          </Button>
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <div>
            <h3 className="text-xl font-semibold text-planilhorti-brown">
              Erro na Importação
            </h3>
            <p className="text-planilhorti-brown/70 mt-2">
              Ocorreu um erro durante a importação dos seus dados
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {state.error}
          </AlertDescription>
        </Alert>

        <div className="flex space-x-4 justify-center">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Tentar Novamente
          </Button>
          <Button
            onClick={handleNewUpload}
          >
            Novo Upload
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
        <div>
          <h3 className="text-xl font-semibold text-planilhorti-brown">
            Importando Dados
          </h3>
          <p className="text-planilhorti-brown/70 mt-2">
            Processando e importando seus dados... Isso pode levar alguns minutos.
          </p>
        </div>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <Progress value={65} className="w-full" />
        
        <div className="space-y-2 text-sm text-planilhorti-brown/70">
          <div className="flex items-center justify-between">
            <span>✓ Arquivo validado</span>
          </div>
          <div className="flex items-center justify-between">
            <span>✓ Schema configurado</span>
          </div>
          <div className="flex items-center justify-between">
            <span>⏳ Importando dados...</span>
          </div>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Não feche esta página</strong> enquanto a importação estiver em andamento.
          Arquivos grandes podem levar alguns minutos para processar.
        </AlertDescription>
      </Alert>
    </div>
  )
}