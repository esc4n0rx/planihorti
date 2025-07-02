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

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {state.currentStep === 1 && <FileSelector />}
          {state.currentStep === 2 && <CollectionSelector />}
          {state.currentStep === 3 && state.detectedSchema && <SchemaConfigurator />}
          {state.currentStep === 4 && <ImportProgress />}
        </CardContent>
      </Card>
    </div>
  )
}