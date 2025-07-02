"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Folder, Calendar } from "lucide-react"
import Link from "next/link"

// Dados simulados - Coleções
const mockCollections = [
  {
    id: "1",
    name: "Cortes Mercearia",
    description: "Dados de cortes e vendas da mercearia",
    lastUpdated: "2024-01-15",
    foldersCount: 12,
    status: "active",
  },
  {
    id: "2",
    name: "Produção Hortifruti",
    description: "Controle de produção de frutas e verduras",
    lastUpdated: "2024-01-14",
    foldersCount: 8,
    status: "active",
  },
  {
    id: "3",
    name: "Estoque Sementes",
    description: "Inventário e controle de sementes",
    lastUpdated: "2024-01-12",
    foldersCount: 15,
    status: "processing",
  },
  {
    id: "4",
    name: "Vendas Diretas",
    description: "Vendas diretas ao consumidor",
    lastUpdated: "2024-01-10",
    foldersCount: 6,
    status: "active",
  },
]

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCollections = mockCollections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
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
                        <p className="text-sm text-planilhorti-brown/60 mt-1">{collection.description}</p>
                      </div>
                    </div>
                    <Badge
                      variant={collection.status === "active" ? "default" : "secondary"}
                      className={
                        collection.status === "active" ? "bg-primary text-white" : "bg-secondary text-planilhorti-brown"
                      }
                    >
                      {collection.status === "active" ? "Ativo" : "Processando"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-planilhorti-brown/70">
                    <div className="flex items-center justify-between">
                      <span>Pastas:</span>
                      <span className="font-medium text-planilhorti-brown">{collection.foldersCount}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Atualizado em {formatDate(collection.lastUpdated)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredCollections.length === 0 && (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 text-planilhorti-brown/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-planilhorti-brown mb-2">Nenhuma coleção encontrada</h3>
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
