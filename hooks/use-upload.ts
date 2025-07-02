// hooks/use-uploads.ts
"use client"

import { useState, useEffect, useCallback } from 'react'
import { UploadedFile } from '@/types/upload-simple'

export function useUploads() {
  const [uploads, setUploads] = useState<UploadedFile[]>([])
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

  useEffect(() => {
    fetchUploads()
  }, [fetchUploads])

  return {
    uploads,
    loading,
    error,
    refreshUploads
  }
}