// components/collections/create-collection-modal.tsx
"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { useUploads } from '@/hooks/use-upload'
import { UploadedFile } from '@/types/upload-simple'

interface CreateCollectionModalProps {
  children: React.ReactNode
  onCollectionCreated?: () => void
}

export function CreateCollectionModal({ children, onCollectionCreated }: CreateCollectionModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedUploads, setSelectedUploads] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [folderResults, setFolderResults] = useState<{success: string[], failed: string[]}>({success: [], failed: []})
  
  const { uploads, loading: uploadsLoading } = useUploads()

  const reset = () => {
    setName('')
    setDescription('')
    setSelectedUploads([])
    setError(null)
    setCreating(false)
    setFolderResults({success: [], failed: []})
  }

  const handleUploadToggle = (uploadId: string, checked: boolean) => {
    if (checked) {
      setSelectedUploads(prev => [...prev, uploadId])
    } else {
      setSelectedUploads(prev => prev.filter(id => id !== uploadId))
    }
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Nome da coleção é obrigatório')
      return
    }

    setCreating(true)
    setError(null)

    try {
      // Criar coleção
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar coleção')
      }

      const collection = result

      // Se há uploads selecionados, criar folders para cada um
      if (selectedUploads.length > 0) {
        const folderPromises = selectedUploads.map(async (uploadId) => {
          const upload = uploads.find((u: { id: string }) => u.id === uploadId)
          if (!upload) return { success: false, name: 'Upload não encontrado' }

          try {
            const folderResponse = await fetch(`/api/collections/${collection.id}/folders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: upload.file_name.replace(/\.[^/.]+$/, ''), // Remove extensão
                schema: upload.schema,
                file_name: upload.file_name,
                file_size: upload.file_size,
                upload_id: upload.id
              }),
            })

            if (!folderResponse.ok) {
              const errorData = await folderResponse.json()
              throw new Error(errorData.error || 'Erro ao criar folder')
            }

            return { success: true, name: upload.file_name }
          } catch (error) {
            console.error('Erro ao criar folder para upload:', upload.file_name, error)
            return { success: false, name: upload.file_name }
          }
        })

        const results = await Promise.all(folderPromises)
        const success = results.filter(r => r.success).map(r => r.name)
        const failed = results.filter(r => !r.success).map(r => r.name)
        
        setFolderResults({ success, failed })

        if (failed.length > 0) {
          setError(`Coleção criada, mas ${failed.length} folder(s) falharam: ${failed.join(', ')}`)
        }
      }

      onCollectionCreated?.()
      
      // Se não houve erros ou só erros menores, fechar modal
      if (folderResults.failed.length === 0) {
        setOpen(false)
        reset()
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar coleção')
    } finally {
      setCreating(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) reset()
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Nova Coleção</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {folderResults.success.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {folderResults.success.length} folder(s) criado(s) com sucesso: {folderResults.success.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {/* Informações da Coleção */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collection-name">Nome da Coleção</Label>
              <Input
                id="collection-name"
                placeholder="Ex: Vendas Q1 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collection-description">Descrição (opcional)</Label>
              <Textarea
                id="collection-description"
                placeholder="Descrição da coleção..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={creating}
                rows={3}
              />
            </div>
          </div>

          {/* Uploads Disponíveis */}
          <div className="space-y-4">
            <div>
              <Label>Arquivos para Incluir (opcional)</Label>
              <p className="text-sm text-planilhorti-brown/70 mt-1">
                Selecione os uploads que deseja incluir nesta coleção
              </p>
            </div>

            {uploadsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-planilhorti-brown/10 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : uploads.length === 0 ? (
              <div className="text-center py-8 text-planilhorti-brown/50">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhum upload encontrado</p>
                <p className="text-xs mt-1">Faça upload de arquivos primeiro</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploads.map((upload: { id: React.Key | null | undefined; file_name: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; schema: string | any[]; file_size: number; total_rows: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; created_at: string }) => (
                  <Card key={upload.id} className="border-planilhorti-brown/10">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedUploads.includes(String(upload.id))}
                          onCheckedChange={(checked) => handleUploadToggle(String(upload.id), Boolean(checked))}
                          disabled={creating}
                        />
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-planilhorti-brown text-sm truncate">
                              {upload.file_name}
                            </p>
                            <Badge variant="secondary" className="ml-2 flex-shrink-0">
                              {upload.schema.length} cols
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-planilhorti-brown/70 mt-1">
                            <span>{formatFileSize(upload.file_size)}</span>
                            <span>{upload.total_rows} linhas</span>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(upload.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Resumo */}
          {selectedUploads.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900">
                {selectedUploads.length} arquivo(s) selecionado(s)
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Serão criadas {selectedUploads.length} pasta(s) dentro desta coleção
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={creating}
              className="flex-1"
            >
              {folderResults.success.length > 0 ? 'Fechar' : 'Cancelar'}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || creating}
              className="flex-1"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                'Criar Coleção'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}