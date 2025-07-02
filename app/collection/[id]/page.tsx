"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FolderOpen, Calendar, ChevronLeft } from "lucide-react"
import Link from "next/link"

// Dados simulados - Pastas dentro da coleção
const mockFolders = [
  {
    id: "1",
    name: "Corte Janeiro 2025",
    description: "Dados de cortes do mês de janeiro",
    lastUpdated: "2024-01-15",
    recordsCount: 1250,
    status: "active",
  },
  {
    id: "2",
    name: "Corte Dezembro 2024",
    description: "Dados de cortes do mês de dezembro",
    lastUpdated: "2024-12-31",
    recordsCount: 1180,
    status: "active",
  },
  {
    id: "3",
    name: "Corte Novembro 2024",
    description: "Dados de cortes do mês de novembro",
    lastUpdated: "2024-11-30",
    recordsCount: 1095,
    status: "active",
  },
  {
    id: "4",
    name: "Corte Outubro 2024",
    description: "Dados de cortes do mês de outubro",
    lastUpdated: "2024-10-31",
    recordsCount: 1320,
    status: "archived",
  },
]

export default function CollectionPage({ params }: { params: { id: string } }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredFolders = mockFolders.filter(
    (folder) =>
      folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      folder.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
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
          <h1 className="text-3xl font-bold text-planilhorti-brown mb-2">Cortes Mercearia</h1>
          <div className="flex items-center space-x-4 text-sm text-planilhorti-brown/70">
            <span>{filteredFolders.length} pastas</span>
            <Badge className="bg-primary text-white">Ativo</Badge>
            <span>Coleção criada em 10/12/2024</span>
          </div>
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
            <Link key={folder.id} href={`/collection/${params.id}/folder/${folder.id}`}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-planilhorti-brown/10 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <FolderOpen className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-planilhorti-brown">{folder.name}</CardTitle>
                        <p className="text-sm text-planilhorti-brown/60 mt-1">{folder.description}</p>
                      </div>
                    </div>
                    <Badge
                      variant={folder.status === "active" ? "default" : "secondary"}
                      className={
                        folder.status === "active"
                          ? "bg-primary text-white"
                          : "bg-planilhorti-brown/20 text-planilhorti-brown"
                      }
                    >
                      {folder.status === "active" ? "Ativo" : "Arquivado"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-planilhorti-brown/70">
                    <div className="flex items-center justify-between">
                      <span>Registros:</span>
                      <span className="font-medium text-planilhorti-brown">{folder.recordsCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Atualizado em {formatDate(folder.lastUpdated)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredFolders.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-planilhorti-brown/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-planilhorti-brown mb-2">Nenhuma pasta encontrada</h3>
            <p className="text-planilhorti-brown/60 mb-4">
              {searchTerm ? "Tente ajustar sua busca" : "Comece criando sua primeira pasta de dados"}
            </p>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              Criar Nova Pasta
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
