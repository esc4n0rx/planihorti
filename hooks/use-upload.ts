"use client"

import { useState, useCallback, useRef } from 'react'
import { DetectedSchema, ColumnSchema} from '@/types/upload'
import { Collection } from '@/types/collection'
import { UploadService } from '@/lib/upload-service'

export interface UploadState {
  // Dados do upload
  file: File | null
  collection: Collection | null
  detectedSchema: DetectedSchema | null
  configuredSchema: ColumnSchema[] | null
  
  // Estados de carregamento
  isAnalyzing: boolean
  isImporting: boolean
  
  // Estados de resultado
  error: string | null
  success: boolean
  folderId: string | null
  
  // Fluxo
  currentView: 'file' | 'schema' | 'collection' | 'import' | 'success'
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    file: null,
    collection: null,
    detectedSchema: null,
    configuredSchema: null,
    isAnalyzing: false,
    isImporting: false,
    error: null,
    success: false,
    folderId: null,
    currentView: 'file'
  })

  // Use ref to track state updates
  const stateRef = useRef(state)
  stateRef.current = state

  const updateState = useCallback((updates: Partial<UploadState>) => {
    console.log(`[useUpload] updateState called with:`, updates)
    setState(prev => {
      const newState = { ...prev, ...updates }
      console.log(`[useUpload] State updated from:`, prev.currentView, 'to:', newState.currentView)
      return newState
    })
  }, [])

  const setError = useCallback((error: string) => {
    console.log(`[useUpload] Setting error:`, error)
    updateState({ error })
  }, [updateState])

  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  const setFile = useCallback(async (file: File | null) => {
    console.log(`[useUpload] setFile called with:`, file?.name)
    
    if (!file) {
      console.log(`[useUpload] Clearing file and resetting state`)
      updateState({ 
        file: null,
        detectedSchema: null,
        configuredSchema: null,
        currentView: 'file',
        error: null,
        isAnalyzing: false
      })
      return
    }

    // Definir arquivo e iniciar análise
    console.log(`[useUpload] Setting file and starting analysis`)
    updateState({ 
      file,
      isAnalyzing: true,
      error: null,
      currentView: 'file',
      detectedSchema: null,
      configuredSchema: null
    })

    try {
      console.log(`[useUpload] Starting file analysis for:`, file.name)
      const schema = await UploadService.analyzeFile(file)
      console.log(`[useUpload] File analysis completed, schema:`, schema)
      
      console.log(`[useUpload] Updating state with schema and changing view to 'schema'`)
      
      // Force state update with setTimeout to ensure it's processed
      setTimeout(() => {
        updateState({ 
          detectedSchema: schema,
          configuredSchema: schema.columns,
          isAnalyzing: false,
          currentView: 'schema'
        })
      }, 100)
      
    } catch (error) {
      console.error(`[useUpload] File analysis error:`, error)
      updateState({ 
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Erro na análise do arquivo',
        currentView: 'file'
      })
    }
  }, [updateState])

  const updateSchema = useCallback((schema: ColumnSchema[]) => {
    console.log(`[useUpload] Updating schema:`, schema.length, 'columns')
    updateState({ 
      configuredSchema: schema,
      error: null
    })
  }, [updateState])

  const goToCollectionSelection = useCallback(() => {
    console.log(`[useUpload] Going to collection selection`)
    updateState({ 
      currentView: 'collection',
      error: null
    })
  }, [updateState])

  const setCollection = useCallback((collection: Collection) => {
    console.log(`[useUpload] Setting collection:`, collection.name)
    updateState({ 
      collection,
      currentView: 'import',
      error: null
    })
  }, [updateState])

  const goBackToSchema = useCallback(() => {
    console.log(`[useUpload] Going back to schema`)
    updateState({ 
      currentView: 'schema',
      error: null
    })
  }, [updateState])

  const goBackToFile = useCallback(() => {
    console.log(`[useUpload] Going back to file`)
    updateState({ 
      currentView: 'file',
      error: null,
      detectedSchema: null,
      configuredSchema: null,
      isAnalyzing: false
    })
  }, [updateState])

  const importData = useCallback(async () => {
    console.log(`[useUpload] Starting import process`)
    
    if (!stateRef.current.file || !stateRef.current.configuredSchema || !stateRef.current.collection) {
      const missingData = {
        file: !stateRef.current.file,
        schema: !stateRef.current.configuredSchema,
        collection: !stateRef.current.collection
      }
      console.error(`[useUpload] Missing data for import:`, missingData)
      setError('Dados incompletos para importação')
      return null
    }

    updateState({ isImporting: true, error: null })

    try {
      const response = await fetch('/api/upload/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_data: await fileToBase64(stateRef.current.file),
          file_name: stateRef.current.file.name,
          file_size: stateRef.current.file.size,
          collection_id: stateRef.current.collection.id,
          schema: stateRef.current.configuredSchema,
          folder_name: stateRef.current.file.name.replace(/\.[^/.]+$/, '') // Remove extensão
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro na importação')
      }

      console.log(`[useUpload] Import completed successfully`)
      updateState({ 
        isImporting: false,
        success: true,
        folderId: result.folder_id,
        currentView: 'success'
      })
      
      return result.folder_id

    } catch (error) {
      console.error(`[useUpload] Import error:`, error)
      updateState({ 
        isImporting: false,
        error: error instanceof Error ? error.message : 'Erro na importação'
      })
      return null
    }
  }, [updateState, setError])

  const reset = useCallback(() => {
    console.log(`[useUpload] Resetting state`)
    updateState({
      file: null,
      collection: null,
      detectedSchema: null,
      configuredSchema: null,
      isAnalyzing: false,
      isImporting: false,
      error: null,
      success: false,
      folderId: null,
      currentView: 'file'
    })
  }, [updateState])

  return {
    state,
    setFile,
    updateSchema,
    setCollection,
    importData,
    goToCollectionSelection,
    goBackToSchema,
    goBackToFile,
    setError,
    clearError,
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