// app/collection/[id]/folder/[folderId]/page.tsx
"use client"

import { useState, useMemo, use } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, Download, Edit, Trash2, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

// Dados simulados - Dados da pasta "Corte Janeiro 2025"
const mockData = [
  {
    id: 1,
    produto: "Alface Crespa",
    categoria: "Folhosos",
    quantidade: 150,
    preco_kg: 4.5,
    fornecedor: "Sítio Verde",
    data_corte: "2025-01-15",
    status: "Vendido",
  },
  {
    id: 2,
    produto: "Tomate Cereja",
    categoria: "Frutos",
    quantidade: 80,
    preco_kg: 8.9,
    fornecedor: "Fazenda Sol",
    data_corte: "2025-01-15",
    status: "Disponível",
  },
  {
    id: 3,
    produto: "Cenoura Baby",
    categoria: "Raízes",
    quantidade: 120,
    preco_kg: 6.2,
    fornecedor: "Horta Orgânica",
    data_corte: "2025-01-14",
    status: "Vendido",
  },
  {
    id: 4,
    produto: "Rúcula",
    categoria: "Folhosos",
    quantidade: 90,
    preco_kg: 5.8,
    fornecedor: "Sítio Verde",
    data_corte: "2025-01-14",
    status: "Disponível",
  },
  {
    id: 5,
    produto: "Pimentão Vermelho",
    categoria: "Frutos",
    quantidade: 60,
    preco_kg: 7.5,
    fornecedor: "Fazenda Sol",
    data_corte: "2025-01-13",
    status: "Vendido",
  },
  {
    id: 6,
    produto: "Beterraba",
    categoria: "Raízes",
    quantidade: 100,
    preco_kg: 4.8,
    fornecedor: "Horta Orgânica",
    data_corte: "2025-01-13",
    status: "Disponível",
  },
  {
    id: 7,
    produto: "Espinafre",
    categoria: "Folhosos",
    quantidade: 75,
    preco_kg: 6.9,
    fornecedor: "Sítio Verde",
    data_corte: "2025-01-12",
    status: "Vendido",
  },
  {
    id: 8,
    produto: "Abobrinha",
    categoria: "Frutos",
    quantidade: 110,
    preco_kg: 3.2,
    fornecedor: "Fazenda Sol",
    data_corte: "2025-01-12",
    status: "Disponível",
  },
]

const ITEMS_PER_PAGE = 5

interface PageProps {
  params: Promise<{ id: string; folderId: string }>
}

export default function FolderDataPage({ params }: PageProps) {
  const { id, folderId } = use(params)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = useMemo(() => {
    return mockData.filter((item) => {
      const matchesSearch =
        item.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fornecedor.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || item.categoria === categoryFilter
      const matchesStatus = statusFilter === "all" || item.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [searchTerm, categoryFilter, statusFilter])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const categories = [...new Set(mockData.map((item) => item.categoria))]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Link href={`/collection/${id}`}>
              <Button variant="ghost" size="sm" className="text-planilhorti-brown hover:bg-planilhorti-brown/10">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar às Pastas
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-planilhorti-brown mb-2">Corte Janeiro 2025</h1>
          <div className="flex items-center space-x-4 text-sm text-planilhorti-brown/70">
            <span>{filteredData.length} registros</span>
            <Badge className="bg-primary text-white">Ativo</Badge>
            <span>Última atualização: 15/01/2025</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-planilhorti-brown/10">
          <div className="p-6 border-b border-planilhorti-brown/10">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-planilhorti-brown/50 h-4 w-4" />
                <Input
                  placeholder="Buscar por produto ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-planilhorti-brown/20"
                />
              </div>

              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40 border-planilhorti-brown/20">
                    <Filter className="h-4 w-4 mr-2 text-planilhorti-brown/50" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 border-planilhorti-brown/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Disponível">Disponível</SelectItem>
                    <SelectItem value="Vendido">Vendido</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="border-planilhorti-brown/20 text-planilhorti-brown hover:bg-planilhorti-brown/5 bg-transparent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-planilhorti-brown/10">
                  <TableHead className="text-planilhorti-brown">Produto</TableHead>
                  <TableHead className="text-planilhorti-brown">Categoria</TableHead>
                  <TableHead className="text-planilhorti-brown">Quantidade (kg)</TableHead>
                  <TableHead className="text-planilhorti-brown">Preço/kg</TableHead>
                  <TableHead className="text-planilhorti-brown">Fornecedor</TableHead>
                  <TableHead className="text-planilhorti-brown">Data Corte</TableHead>
                  <TableHead className="text-planilhorti-brown">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id} className="border-planilhorti-brown/5">
                    <TableCell className="font-medium text-planilhorti-brown">{item.produto}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-secondary text-secondary-foreground bg-secondary/10">
                        {item.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-planilhorti-brown/70">{item.quantidade}</TableCell>
                    <TableCell className="text-planilhorti-brown/70">{formatCurrency(item.preco_kg)}</TableCell>
                    <TableCell className="text-planilhorti-brown/70">{item.fornecedor}</TableCell>
                    <TableCell className="text-planilhorti-brown/70">{formatDate(item.data_corte)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === "Disponível" ? "default" : "secondary"}
                        className={
                          item.status === "Disponível"
                            ? "bg-primary text-white"
                            : "bg-planilhorti-yellow text-planilhorti-brown"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-planilhorti-brown/50 hover:text-planilhorti-brown"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="p-6 border-t border-planilhorti-brown/10 flex items-center justify-between">
              <div className="text-sm text-planilhorti-brown/70">
                Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)} de{" "}
                {filteredData.length} registros
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-planilhorti-brown/20 text-planilhorti-brown"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-planilhorti-brown/70">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="border-planilhorti-brown/20 text-planilhorti-brown"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}