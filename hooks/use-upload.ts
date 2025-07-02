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
    title: 'Seleção da Coleção',
    description: 'Escolha ou crie uma coleção',
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
    console.log(`[useUpload] Updating step ${stepId}:`, updates)
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }, [])

  const goToStep = useCallback((stepNumber: number) => {
    console.log(`[useUpload] Transitioning to step ${stepNumber}`)
    
    // Atualizar o estado primeiro
    setState(prev => ({ 
      ...prev, 
      currentStep: stepNumber, 
      error: null 
    }))
    
    // Depois atualizar os steps
    setSteps(prev => prev.map(step => ({
      ...step,
      current: step.id === stepNumber,
      completed: step.id < stepNumber
    })))
    
    console.log(`[useUpload] Step transition completed to ${stepNumber}`)
  }, [])

  const setFile = useCallback((file: File | null) => {
    console.log(`[useUpload] Setting file:`, file?.name, file?.size)
    setState(prev => ({ 
      ...prev, 
      file,
      detectedSchema: null,
      configuredSchema: null,
      error: null
    }))
    
    if (file) {
      updateStep(1, { completed: true })
    } else {
      updateStep(1, { completed: false })
      // Resetar steps subsequentes se arquivo for removido
      setSteps(prev => prev.map(step => ({
        ...step,
        completed: step.id === 1 ? false : step.completed,
        current: step.id === 1
      })))
      setState(prev => ({ ...prev, currentStep: 1 }))
    }
  }, [updateStep])

  const setCollection = useCallback((collection: Collection) => {
    console.log(`[useUpload] Setting collection:`, collection.name)
    setState(prev => ({ ...prev, collection, error: null }))
    updateStep(2, { completed: true })
  }, [updateStep])

  const analyzeFile = useCallback(async () => {
    console.log(`[useUpload] Starting file analysis...`)
    if (!state.file || !state.collection) {
      console.error(`[useUpload] Missing file or collection`, { file: !!state.file, collection: !!state.collection })
      setState(prev => ({ ...prev, error: 'Arquivo ou coleção não selecionados' }))
      return
    }

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }))

    try {
      console.log(`[useUpload] Analyzing file: ${state.file.name}`)
      const schema = await UploadService.analyzeFile(state.file)
      console.log(`[useUpload] File analysis completed:`, schema)
      
      setState(prev => ({ 
        ...prev, 
        detectedSchema: schema,
        configuredSchema: schema.columns,
        isAnalyzing: false
      }))
      
      updateStep(3, { completed: true })
      goToStep(3)
      
    } catch (error) {
      console.error(`[useUpload] File analysis error:`, error)
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Erro na análise do arquivo'
      }))
    }
  }, [state.file, state.collection, updateStep, goToStep])

  const updateSchema = useCallback((schema: ColumnSchema[]) => {
    console.log(`[useUpload] Updating schema:`, schema.length, 'columns')
    setState(prev => ({ ...prev, configuredSchema: schema, error: null }))
  }, [])

  const importData = useCallback(async (): Promise<string | null> => {
    console.log(`[useUpload] Starting data import...`)
    if (!state.file || !state.configuredSchema || !state.collection) {
      console.error(`[useUpload] Missing data for import`, {
        file: !!state.file,
        schema: !!state.configuredSchema,
        collection: !!state.collection
      })
      return null
    }

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

      console.log(`[useUpload] Import completed successfully`)
      setState(prev => ({ 
        ...prev, 
        isImporting: false,
        success: true
      }))
      
      updateStep(4, { completed: true })
      
      return result.folder_id

    } catch (error) {
      console.error(`[useUpload] Import error:`, error)
      setState(prev => ({ 
        ...prev, 
        isImporting: false,
        error: error instanceof Error ? error.message : 'Erro na importação'
      }))
      return null
    }
  }, [state.file, state.configuredSchema, state.collection, updateStep])

  const reset = useCallback(() => {
    console.log(`[useUpload] Resetting upload state`)
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
    setSteps(UPLOAD_STEPS.map(step => ({ ...step }))) // Criar nova instância
  }, [])

  // Função para verificar se pode avançar para o próximo step
  const canProceed = useCallback((stepNumber: number) => {
    const result = (() => {
      switch (stepNumber) {
        case 1:
          return !!state.file && state.file.size > 0
        case 2:
          return !!state.collection && !!state.file
        case 3:
          return !!state.configuredSchema && state.configuredSchema.length > 0
        default:
          return false
      }
    })()
    
    console.log(`[useUpload] canProceed(${stepNumber}):`, result, {
      file: !!state.file,
      fileSize: state.file?.size,
      collection: !!state.collection,
      schema: state.configuredSchema?.length
    })
    
    return result
  }, [state.file, state.collection, state.configuredSchema])

  return {
    state,
    steps,
    setFile,
    analyzeFile,
    updateSchema,
    setCollection,
    importData,
    goToStep,
    reset,
    canProceed
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