"use client"

import { useState, useEffect, use } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FolderOpen, Calendar, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Collection, Folder } from "@/types/collection"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CollectionPage({ params }: PageProps) {
  const { id } = use(params)
  const [searchTerm, setSearchTerm] = useState("")
  const [collection, setCollection] = useState<Collection | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCollectionData()
  }, [id])

  const fetchCollectionData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar dados da coleção
      const collectionResponse = await fetch(`/api/collections/${id}`, {
        credentials: 'include'
      })

      if (!collectionResponse.ok) {
        throw new Error('Coleção não encontrada')
      }

      const collectionData = await collectionResponse.json()
      setCollection(collectionData)

      // Buscar folders da coleção
      const foldersResponse = await fetch(`/api/collections/${id}/folders`, {
        credentials: 'include'
      })

      if (!foldersResponse.ok) {
        throw new Error('Erro ao carregar pastas')
      }

      const foldersData = await foldersResponse.json()
      setFolders(foldersData)

    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      setError(error instanceof Error ? error.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const filteredFolders = folders.filter(
    (folder) =>
      folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return ''
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary text-white'
      case 'processing':
        return 'bg-planilhorti-yellow text-planilhorti-brown'
      case 'error':
        return 'bg-destructive text-white'
      default:
        return 'bg-planilhorti-brown/20 text-planilhorti-brown'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'processing':
        return 'Processando'
      case 'error':
        return 'Erro'
      default:
        return 'Arquivado'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-planilhorti-brown hover:bg-planilhorti-brown/10">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Voltar às Coleções
                </Button>
              </Link>
            </div>
            <div className="animate-pulse">
              <div className="h-8 bg-planilhorti-brown/20 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-planilhorti-brown/10 rounded w-1/2"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-planilhorti-brown/10 bg-white">
                <CardHeader className="pb-3">
                  <div className="animate-pulse">
                    <div className="h-4 bg-planilhorti-brown/20 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-planilhorti-brown/10 rounded w-1/2"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="animate-pulse space-y-2">
                    <div className="h-3 bg-planilhorti-brown/10 rounded w-1/4"></div>
                    <div className="h-3 bg-planilhorti-brown/10 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-planilhorti-brown hover:bg-planilhorti-brown/10">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar às Coleções
              </Button>
            </Link>
          </div>
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <FolderOpen className="h-12 w-12 mx-auto mb-2" />
              <p>{error}</p>
            </div>
            <Button onClick={fetchCollectionData} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-planilhorti-brown hover:bg-planilhorti-brown/10">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar às Coleções
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-planilhorti-brown mb-2">
            {collection?.name || 'Carregando...'}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-planilhorti-brown/70">
            <span>{filteredFolders.length} pastas</span>
            <Badge className="bg-primary text-white">Ativo</Badge>
            {collection && (
              <span>Coleção criada em {formatDate(collection.created_at)}</span>
            )}
          </div>
          {collection?.description && (
            <p className="text-planilhorti-brown/60 mt-2">{collection.description}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-planilhorti-brown/50 h-4 w-4" />
            <Input
              placeholder="Buscar pastas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-planilhorti-brown/20"
            />
          </div>
          <Button className="flex items-center space-x-2 bg-accent hover:bg-accent/90">
            <Plus className="h-4 w-4" />
            <span>Nova Pasta</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFolders.map((folder) => (
            <Link key={folder.id} href={`/collection/${id}/folder/${folder.id}`}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-planilhorti-brown/10 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <FolderOpen className="h-5 w-5 text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg text-planilhorti-brown truncate">
                          {folder.name}
                        </CardTitle>
                        {folder.file_name && (
                          <p className="text-sm text-planilhorti-brown/60 mt-1 truncate">
                            Arquivo: {folder.file_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(folder.status)}>
                      {getStatusText(folder.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-planilhorti-brown/70">
                    <div className="flex items-center justify-between">
                      <span>Registros:</span>
                      <span className="font-medium text-planilhorti-brown">
                        {folder.records_count?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Colunas:</span>
                      <span className="font-medium text-planilhorti-brown">
                        {folder.schema?.length || 0}
                      </span>
                    </div>
                    {folder.file_size && (
                      <div className="flex items-center justify-between">
                        <span>Tamanho:</span>
                        <span className="font-medium text-planilhorti-brown">
                          {formatFileSize(folder.file_size)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Criado em {formatDate(folder.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredFolders.length === 0 && !loading && (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-planilhorti-brown/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-planilhorti-brown mb-2">
              {searchTerm ? "Nenhuma pasta encontrada" : "Nenhuma pasta criada"}
            </h3>
            <p className="text-planilhorti-brown/60 mb-4">
              {searchTerm ? "Tente ajustar sua busca" : "Comece fazendo upload de um arquivo ou criando uma pasta manualmente"}
            </p>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova Pasta
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}