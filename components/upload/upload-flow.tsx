"use client"

import React, { useEffect, useState } from 'react'
import { useUpload } from '@/hooks/use-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, FileSpreadsheet, ArrowRight } from 'lucide-react'
import { FileSelector } from './file-selector'
import { SchemaConfigurator } from './schema-configurator'
import { CollectionSelector } from './collection-selector'
import { ImportProgress } from './import-progress'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function UploadFlow() {
  const { state, reset } = useUpload()
  const router = useRouter()
  const [renderKey, setRenderKey] = useState(0)

  // Force re-render when currentView changes
  useEffect(() => {
    console.log(`[UploadFlow] currentView changed to:`, state.currentView)
    setRenderKey(prev => prev + 1)
  }, [state.currentView])

  useEffect(() => {
    const handleForceSchemaView = () => {
      console.log('Forced schema view triggered')
      setRenderKey(prev => prev + 1)
    }

    window.addEventListener('force-schema-view', handleForceSchemaView)
    return () => window.removeEventListener('force-schema-view', handleForceSchemaView)
  }, [])

  // Debug: Log state changes
  useEffect(() => {
    console.log(`[UploadFlow] State updated (render ${renderKey}):`, {
      currentView: state.currentView,
      hasFile: !!state.file,
      fileName: state.file?.name,
      hasSchema: !!state.detectedSchema,
      hasConfiguredSchema: !!state.configuredSchema,
      schemaColumns: state.configuredSchema?.length,
      hasCollection: !!state.collection,
      isAnalyzing: state.isAnalyzing,
      isImporting: state.isImporting,
      error: state.error,
      success: state.success
    })
  }, [state, renderKey])

  const getTitle = () => {
    switch (state.currentView) {
      case 'file':
        return 'Selecionar Arquivo'
      case 'schema':
        return 'Configurar Dados'
      case 'collection':
        return 'Escolher Coleção'
      case 'import':
        return 'Importando Dados'
      case 'success':
        return 'Upload Concluído'
      default:
        return 'Upload de Dados'
    }
  }

  const getDescription = () => {
    switch (state.currentView) {
      case 'file':
        return state.isAnalyzing ? 'Analisando arquivo...' : 'Faça upload de uma planilha Excel ou CSV'
      case 'schema':
        return 'Revise e ajuste as configurações das colunas detectadas'
      case 'collection':
        return 'Selecione uma coleção existente ou crie uma nova'
      case 'import':
        return 'Seus dados estão sendo processados e importados'
      case 'success':
        return 'Dados importados com sucesso!'
      default:
        return 'Gerencie seus dados agricolas'
    }
  }

  const renderContent = () => {
    console.log(`[UploadFlow] renderContent called for view:`, state.currentView)
    
    // Force different content based on view
    if (state.currentView === 'file') {
      console.log(`[UploadFlow] Rendering FileSelector`)
      return <FileSelector key="file-selector" />
    }
    
    if (state.currentView === 'schema') {
      console.log(`[UploadFlow] Rendering SchemaConfigurator with:`, {
        hasDetectedSchema: !!state.detectedSchema,
        hasConfiguredSchema: !!state.configuredSchema,
        columnsCount: state.configuredSchema?.length
      })
      return <SchemaConfigurator key="schema-configurator" />
    }
    
    if (state.currentView === 'collection') {
      console.log(`[UploadFlow] Rendering CollectionSelector`)
      return <CollectionSelector key="collection-selector" />
    }
    
    if (state.currentView === 'import' || state.currentView === 'success') {
      console.log(`[UploadFlow] Rendering ImportProgress`)
      return <ImportProgress key="import-progress" />
    }
    
    console.log(`[UploadFlow] Rendering error state for unknown view:`, state.currentView)
    return (
      <Alert variant="destructive" key="error-alert">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Estado inválido da aplicação: {state.currentView}
        </AlertDescription>
      </Alert>
    )
  }

  const handleViewCollection = () => {
    if (state.collection) {
      router.push(`/collection/${state.collection.id}`)
    }
  }

  console.log(`[UploadFlow] Rendering component with view: ${state.currentView}, renderKey: ${renderKey}`)

  return (
    <div className="max-w-4xl mx-auto space-y-6" key={`upload-flow-${renderKey}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl text-planilhorti-brown">
                {getTitle()}
              </CardTitle>
              <p className="text-planilhorti-brown/70 mt-1">
                {getDescription()}
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          {state.currentView !== 'file' && (
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm text-planilhorti-brown/70">
                <span>📁 {state.file?.name}</span>
                {state.detectedSchema && (
                  <>
                    <ArrowRight className="h-3 w-3" />
                    <span>📊 {state.configuredSchema?.length} colunas</span>
                  </>
                )}
                {state.collection && (
                  <>
                    <ArrowRight className="h-3 w-3" />
                    <span>📂 {state.collection.name}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Debug Info - apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Debug:</strong> View: {state.currentView} | 
            File: {state.file?.name || 'None'} | 
            Schema: {state.detectedSchema ? `${state.detectedSchema.columns.length} cols` : 'None'} | 
            Analyzing: {state.isAnalyzing ? 'Yes' : 'No'} |
            RenderKey: {renderKey}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <CardContent className="pt-6">
          {renderContent()}
        </CardContent>
      </Card>

      {/* Success Actions */}
      {state.currentView === 'success' && (
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={reset}>
            Novo Upload
          </Button>
          <Button onClick={handleViewCollection}>
            Ver Coleção
          </Button>
        </div>
      )}
    </div>
  )
}