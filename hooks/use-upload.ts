"use client"

import { useState, useCallback } from 'react'
import { UploadState, UploadStep, DetectedSchema, ColumnSchema} from '@/types/upload'
import { Collection } from '@/types/collection'
import { UploadService } from '@/lib/upload-service'

const UPLOAD_STEPS: UploadStep[] = [
  {
    id: 1,
    title: 'Seleção do Arquivo',
    description: 'Escolha o arquivo para upload',
    completed: false,
    current: true
  },
  {
    id: 2,
    title: 'Análise do Arquivo',
    description: 'Detectando estrutura e tipos de dados',
    completed: false,
    current: false
  },
  {
    id: 3,
    title: 'Configuração do Schema',
    description: 'Revise e ajuste as configurações das colunas',
    completed: false,
    current: false
  },
  {
    id: 4,
    title: 'Importação',
    description: 'Importando dados para sua coleção',
    completed: false,
    current: false
  }
]

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    currentStep: 1,
    file: null,
    collection: null,
    detectedSchema: null,
    configuredSchema: null,
    isAnalyzing: false,
    isImporting: false,
    error: null,
    success: false
  })

  const [steps, setSteps] = useState<UploadStep[]>(UPLOAD_STEPS)

  const updateStep = useCallback((stepId: number, updates: Partial<UploadStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }, [])

  const goToStep = useCallback((stepNumber: number) => {
    setState(prev => ({ ...prev, currentStep: stepNumber, error: null }))
    setSteps(prev => prev.map(step => ({
      ...step,
      current: step.id === stepNumber
    })))
  }, [])

  const setFile = useCallback((file: File | null) => {
    setState(prev => ({ 
      ...prev, 
      file,
      detectedSchema: null,
      configuredSchema: null,
      error: null
    }))
    
    if (file) {
      updateStep(1, { completed: true })
    }
  }, [updateStep])

  const analyzeFile = useCallback(async () => {
    if (!state.file) return

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }))
    updateStep(2, { current: true })

    try {
      const schema = await UploadService.analyzeFile(state.file)
      
      setState(prev => ({ 
        ...prev, 
        detectedSchema: schema,
        configuredSchema: schema.columns,
        isAnalyzing: false
      }))
      
      updateStep(2, { completed: true })
      goToStep(3)
      
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Erro na análise do arquivo'
      }))
    }
  }, [state.file, updateStep, goToStep])

  const updateSchema = useCallback((schema: ColumnSchema[]) => {
    setState(prev => ({ ...prev, configuredSchema: schema, error: null }))
  }, [])

  const setCollection = useCallback((collection: Collection) => {
    setState(prev => ({ ...prev, collection, error: null }))
  }, [])

  const importData = useCallback(async (): Promise<string | null> => {
    if (!state.file || !state.configuredSchema || !state.collection) return null

    setState(prev => ({ ...prev, isImporting: true, error: null }))
    updateStep(4, { current: true })

    try {
      const response = await fetch('/api/upload/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_data: await fileToBase64(state.file),
          file_name: state.file.name,
          file_size: state.file.size,
          collection_id: state.collection.id,
          schema: state.configuredSchema,
          folder_name: state.file.name.replace(/\.[^/.]+$/, '') // Remove extensão
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro na importação')
      }

      setState(prev => ({ 
        ...prev, 
        isImporting: false,
        success: true
      }))
      
      updateStep(4, { completed: true })
      
      return result.folder_id

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isImporting: false,
        error: error instanceof Error ? error.message : 'Erro na importação'
      }))
      return null
    }
  }, [state.file, state.configuredSchema, state.collection, updateStep])

  const reset = useCallback(() => {
    setState({
      currentStep: 1,
      file: null,
      collection: null,
      detectedSchema: null,
      configuredSchema: null,
      isAnalyzing: false,
      isImporting: false,
      error: null,
      success: false
    })
    setSteps(UPLOAD_STEPS)
  }, [])

  return {
    state,
    steps,
    setFile,
    analyzeFile,
    updateSchema,
    setCollection,
    importData,
    goToStep,
    reset
  }
}

// Utility function para converter file para base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1]) // Remove o prefixo data:type;base64,
    }
    reader.onerror = error => reject(error)
  })
}