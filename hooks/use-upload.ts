// hooks/use-upload.ts
"use client"

import { useState, useCallback } from 'react'
import { UploadState, ColumnSchema, DetectedSchema } from '@/types/upload'
import { Collection } from '@/types/collection'
import React from 'react'

const initialState: UploadState = {
  currentStep: 1,
  file: null,
  collection: null,
  detectedSchema: null,
  configuredSchema: null,
  isAnalyzing: false,
  isImporting: false,
  error: null,
  success: false
}

export function useUpload() {
  const [state, setState] = useState<UploadState>(initialState)

  const setFile = useCallback((file: File | null) => {
    setState(prev => ({ ...prev, file, currentStep: file ? 2 : 1 }))
  }, [])

  const setDetectedSchema = useCallback((schema: DetectedSchema) => {
    setState(prev => ({ 
      ...prev, 
      detectedSchema: schema,
      configuredSchema: schema.columns,
      currentStep: 3
    }))
  }, [])

  const updateSchema = useCallback((schema: ColumnSchema[]) => {
    setState(prev => ({ ...prev, configuredSchema: schema }))
  }, [])

  const setCollection = useCallback((collection: Collection) => {
    setState(prev => ({ ...prev, collection, currentStep: 5 }))
  }, [])

  const goToCollectionSelection = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: 4 }))
  }, [])

  const goBackToSchema = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: 3 }))
  }, [])

  const goBackToFile = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: 2 }))
  }, [])

  const setAnalyzing = useCallback((isAnalyzing: boolean) => {
    setState(prev => ({ ...prev, isAnalyzing }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const importData = useCallback(async () => {
    if (!state.file || !state.configuredSchema || !state.collection) {
      setError('Dados incompletos para importação')
      return
    }

    setState(prev => ({ ...prev, isImporting: true, error: null }))

    try {
      // Converter arquivo para base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(state.file!)
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1]) // Remove prefixo data:type;base64,
        }
        reader.onerror = error => reject(error)
      })

      // Gerar nome da pasta baseado no arquivo
      const folderName = state.file.name.replace(/\.[^/.]+$/, '') + ' - ' + new Date().toLocaleDateString('pt-BR')

      // Fazer importação
      const response = await fetch('/api/upload/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_data: fileData,
          file_name: state.file.name,
          file_size: state.file.size,
          collection_id: state.collection.id,
          schema: state.configuredSchema,
          folder_name: folderName
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro na importação')
      }

      setState(prev => ({ 
        ...prev, 
        isImporting: false, 
        success: true,
        currentStep: 5
      }))

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isImporting: false, 
        error: error instanceof Error ? error.message : 'Erro na importação'
      }))
    }
  }, [state.file, state.configuredSchema, state.collection])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  return {
    state,
    setFile,
    setDetectedSchema,
    updateSchema,
    setCollection,
    goToCollectionSelection,
    goBackToSchema,
    goBackToFile,
    setAnalyzing,
    setError,
    importData,
    reset
  }
}

// Hook para buscar uploads
export function useUploads() {
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUploads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/uploads', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar uploads')
      }

      const data = await response.json()
      setUploads(data)
    } catch (error) {
      console.error('Erro ao buscar uploads:', error)
      setError('Erro ao carregar uploads')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshUploads = useCallback(() => {
    fetchUploads()
  }, [fetchUploads])

  // Auto-fetch na inicialização
  React.useEffect(() => {
    fetchUploads()
  }, [fetchUploads])

  return {
    uploads,
    loading,
    error,
    refreshUploads
  }
}