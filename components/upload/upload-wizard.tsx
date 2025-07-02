"use client"

import React from 'react'
import { useUpload } from '@/hooks/use-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Circle, AlertCircle } from 'lucide-react'
import { FileSelector } from './file-selector'
import { CollectionSelector } from './collection-selector'
import { SchemaConfigurator } from './schema-configurator'
import { ImportProgress } from './import-progress'

export function UploadWizard() {
  const { state, steps } = useUpload()

  const currentStepProgress = (state.currentStep / steps.length) * 100

  // Debug info no console
  React.useEffect(() => {
    console.log(`[UploadWizard] State updated:`, {
      currentStep: state.currentStep,
      hasFile: !!state.file,
      hasCollection: !!state.collection,
      hasSchema: !!state.detectedSchema,
      error: state.error
    })
  }, [state])

  // Função para renderizar o conteúdo do step atual
  const renderStepContent = () => {
    console.log(`[UploadWizard] Rendering step ${state.currentStep}`)
    
    switch (state.currentStep) {
      case 1:
        return <FileSelector />
      case 2:
        return <CollectionSelector />
      case 3:
        if (!state.detectedSchema) {
          return (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro: Schema não detectado. Volte ao step anterior.
              </AlertDescription>
            </Alert>
          )
        }
        return <SchemaConfigurator />
      case 4:
        return <ImportProgress />
      default:
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro: Step inválido ({state.currentStep})
            </AlertDescription>
          </Alert>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-planilhorti-brown">Novo Upload</CardTitle>
          <div className="space-y-4">
            <Progress value={currentStepProgress} className="w-full" />
            
            <div className="flex justify-between">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center space-x-2 flex-1"
                >
                  <div className="flex items-center space-x-2">
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : step.current ? (
                      <Circle className="h-5 w-5 text-primary fill-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-planilhorti-brown/30" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${
                        step.current || step.completed 
                          ? 'text-planilhorti-brown' 
                          : 'text-planilhorti-brown/50'
                      }`}>
                        {step.title}
                      </p>
                      <p className={`text-xs hidden sm:block ${
                        step.current || step.completed 
                          ? 'text-planilhorti-brown/70' 
                          : 'text-planilhorti-brown/40'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Debug Alert - apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Debug:</strong> Step {state.currentStep} | 
            File: {state.file?.name || 'None'} | 
            Collection: {state.collection?.name || 'None'} | 
            Analyzing: {state.isAnalyzing ? 'Yes' : 'No'} |
            Current Step from Steps Array: {steps.find(s => s.current)?.id || 'None'}
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  )
}