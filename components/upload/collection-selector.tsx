// components/upload/collection-selector.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { useUpload } from '@/hooks/use-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Folder } from 'lucide-react'
import { Collection } from '@/types/collection'

export function CollectionSelector() {
  const { state, setCollection, analyzeFile } = useUpload()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewCollection, setShowNewCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDescription, setNewCollectionDescription] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      if (response.ok) {
        const data = await response.json()
        setCollections(data)
      }
    } catch (error) {
      console.error('Erro ao buscar coleções:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return

    setCreating(true)
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCollectionName.trim(),
          description: newCollectionDescription.trim() || undefined
        }),
      })

      if (response.ok) {
        const newCollection = await response.json()
        setCollections(prev => [newCollection, ...prev])
        setCollection(newCollection)
        setShowNewCollection(false)
        setNewCollectionName('')
        setNewCollectionDescription('')
      }
    } catch (error) {
      console.error('Erro ao criar coleção:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleSelectCollection = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId)
    if (collection) {
      setCollection(collection)
    }
  }

  const handleProceedToAnalysis = () => {
    if (state.file && state.collection) {
      analyzeFile()
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-planilhorti-brown/20 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-planilhorti-brown/10 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-planilhorti-brown mb-2">
          Selecione a Coleção
        </h3>
        <p className="text-sm text-planilhorti-brown/70 mb-4">
          Escolha uma coleção existente ou crie uma nova para organizar seus dados
        </p>
      </div>

      {!showNewCollection ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collection">Coleção</Label>
            <Select onValueChange={handleSelectCollection} value={state.collection?.id || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma coleção..." />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    <div className="flex items-center space-x-2">
                      <Folder className="h-4 w-4" />
                      <span>{collection.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowNewCollection(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Nova Coleção
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nova Coleção</CardTitle>
            <CardDescription>
              Crie uma nova coleção para organizar seus dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Coleção</Label>
              <Input
                id="name"
                placeholder="Ex: Vendas Q1 2024"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                placeholder="Descrição da coleção..."
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
              />
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowNewCollection(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim() || creating}
                className="flex-1"
              >
                {creating ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {state.collection && (
        <div className="space-y-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Folder className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-planilhorti-brown">
                  {state.collection.name}
                </p>
                {state.collection.description && (
                  <p className="text-sm text-planilhorti-brown/70">
                    {state.collection.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botão para continuar */}
          <div className="flex justify-end">
            <Button 
              onClick={handleProceedToAnalysis}
              className="bg-primary hover:bg-primary/90"
            >
              Analisar Arquivo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}