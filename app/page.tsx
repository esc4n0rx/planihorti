"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Folder, Calendar } from "lucide-react"
import Link from "next/link"
import { Collection } from "@/types/collection"

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/collections', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar coleções')
      }

      const data = await response.json()
      setCollections(data)
    } catch (error) {
      console.error('Erro ao buscar coleções:', error)
      setError('Erro ao carregar suas coleções')
    } finally {
      setLoading(false)
    }
  }

  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (collection.description && collection.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-planilhorti-brown mb-2">Suas Coleções</h1>
            <p className="text-planilhorti-brown/70">Gerencie suas coleções de dados agrícolas de forma organizada</p>
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
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Folder className="h-12 w-12 mx-auto mb-2" />
              <p>{error}</p>
            </div>
            <Button onClick={fetchCollections} variant="outline">
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
          <h1 className="text-3xl font-bold text-planilhorti-brown mb-2">Suas Coleções</h1>
          <p className="text-planilhorti-brown/70">Gerencie suas coleções de dados agrícolas de forma organizada</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-planilhorti-brown/50 h-4 w-4" />
            <Input
              placeholder="Buscar coleções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-planilhorti-brown/20"
            />
          </div>
          <Link href="/upload">
            <Button className="flex items-center space-x-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              <span>Nova Coleção</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
            <Link key={collection.id} href={`/collection/${collection.id}`}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-planilhorti-brown/10 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Folder className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-planilhorti-brown">{collection.name}</CardTitle>
                        {collection.description && (
                          <p className="text-sm text-planilhorti-brown/60 mt-1">{collection.description}</p>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-primary text-white">
                      Ativo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-planilhorti-brown/70">
                    <div className="flex items-center justify-between">
                      <span>Pastas:</span>
                      <span className="font-medium text-planilhorti-brown">
                        {collection.folders_count || 0}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Criado em {formatDate(collection.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredCollections.length === 0 && !loading && (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 text-planilhorti-brown/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-planilhorti-brown mb-2">
              {searchTerm ? "Nenhuma coleção encontrada" : "Nenhuma coleção criada"}
            </h3>
            <p className="text-planilhorti-brown/60 mb-4">
              {searchTerm ? "Tente ajustar sua busca" : "Comece criando sua primeira coleção de dados"}
            </p>
            <Link href="/upload">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Criar Nova Coleção
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}