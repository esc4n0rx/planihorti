"use client"

import React, { useState, useEffect } from 'react'
import { useUpload } from '@/hooks/use-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Folder, ArrowLeft, Upload } from 'lucide-react'
import { Collection } from '@/types/collection'

export function CollectionSelector() {
  const { state, setCollection, goBackToSchema, importData } = useUpload()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewCollection, setShowNewCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDescription, setNewCollectionDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('')

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
        // Iniciar importação automaticamente
        await importData()
      }
    } catch (error) {
      console.error('Erro ao criar coleção:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleSelectCollection = async (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId)
    if (collection) {
      setCollection(collection)
      // Iniciar importação automaticamente
      await importData()
    }
  }

  const handleImportToSelected = async () => {
    if (selectedCollectionId) {
      await handleSelectCollection(selectedCollectionId)
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
    <div className="space-y-6">
      {!showNewCollection ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collection">Selecionar Coleção</Label>
            <Select onValueChange={setSelectedCollectionId} value={selectedCollectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma coleção..." />
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

          {selectedCollectionId && (
            <Button
              onClick={handleImportToSelected}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={state.isImporting}
            >
              {state.isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Dados
                </>
              )}
            </Button>
          )}
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
                {creating ? 'Criando...' : 'Criar e Importar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão Voltar */}
      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={goBackToSchema}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Schema</span>
        </Button>
      </div>
    </div>
  )
}