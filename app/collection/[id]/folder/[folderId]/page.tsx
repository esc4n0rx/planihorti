"use client"

import { useState, useEffect, useMemo, use } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, Download, Edit, Trash2, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Folder } from "@/types/collection"
import { DataRecord } from "@/types/upload"

const ITEMS_PER_PAGE = 20

interface PageProps {
  params: Promise<{ id: string; folderId: string }>
}

interface FolderData {
  folder: Folder
  records: DataRecord[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function FolderDataPage({ params }: PageProps) {
  const { id, folderId } = use(params)
  const [searchTerm, setSearchTerm] = useState("")
  const [folderData, setFolderData] = useState<FolderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchFolderData(currentPage)
  }, [id, folderId, currentPage])

  const fetchFolderData = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/collections/${id}/folders/${folderId}/data?page=${page}&limit=${ITEMS_PER_PAGE}`,
        { credentials: 'include' }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar dados')
      }

      const data = await response.json()
      setFolderData(data)

    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      setError(error instanceof Error ? error.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = useMemo(() => {
    if (!folderData?.records || !searchTerm) {
      return folderData?.records || []
    }

    return folderData.records.filter((record) => {
      const searchableValues = Object.values(record.data).map(value => 
        String(value || '').toLowerCase()
      )
      return searchableValues.some(value => 
        value.includes(searchTerm.toLowerCase())
      )
    })
  }, [folderData?.records, searchTerm])

  const formatValue = (value: any, columnType?: string) => {
    if (value === null || value === undefined || String(value).trim() === '') {
      return <span className="text-gray-400 italic">-</span>
    }

    switch (columnType) {
      case 'number':
        const num = Number(value)
        return isNaN(num) ? (
          <span className="text-red-500">inválido</span>
        ) : (
          <span className="font-mono">{num.toLocaleString('pt-BR')}</span>
        )

      case 'boolean':
        const boolValue = Boolean(value)
        return (
          <Badge variant={boolValue ? "default" : "secondary"} className="text-xs">
            {boolValue ? 'Verdadeiro' : 'Falso'}
          </Badge>
        )

      case 'date':
        const date = new Date(value)
        return isNaN(date.getTime()) ? (
          <span className="text-red-500">data inválida</span>
        ) : (
          <span className="font-mono">{date.toLocaleDateString('pt-BR')}</span>
        )

      default:
        return <span>{String(value)}</span>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const handleExport = () => {
    // Implementar exportação futuramente
    console.log('Exportar dados')
  }

  if (loading) {
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
            <div className="animate-pulse">
              <div className="h-8 bg-planilhorti-brown/20 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-planilhorti-brown/10 rounded w-1/2"></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-planilhorti-brown/10 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-planilhorti-brown/10 rounded"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-planilhorti-brown/5 rounded"></div>
                ))}
              </div>
            </div>
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
            <Link href={`/collection/${id}`}>
              <Button variant="ghost" size="sm" className="text-planilhorti-brown hover:bg-planilhorti-brown/10">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar às Pastas
              </Button>
            </Link>
          </div>
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <p>{error}</p>
            </div>
            <Button onClick={() => fetchFolderData(currentPage)} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!folderData) {
    return null
  }

  const { folder, records, pagination } = folderData

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
          <h1 className="text-3xl font-bold text-planilhorti-brown mb-2">
            {folder.name}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-planilhorti-brown/70">
            <span>{pagination.total} registros</span>
            <Badge className={
              folder.status === 'active' ? 'bg-primary text-white' :
              folder.status === 'processing' ? 'bg-planilhorti-yellow text-planilhorti-brown' :
              'bg-planilhorti-brown/20 text-planilhorti-brown'
            }>
              {folder.status === 'active' ? 'Ativo' : 
               folder.status === 'processing' ? 'Processando' : 'Erro'}
            </Badge>
            <span>Última atualização: {formatDate(folder.updated_at)}</span>
          </div>
          {folder.file_name && (
            <p className="text-planilhorti-brown/60 mt-2">
              Arquivo fonte: {folder.file_name}
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-planilhorti-brown/10">
          <div className="p-6 border-b border-planilhorti-brown/10">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-planilhorti-brown/50 h-4 w-4" />
                <Input
                  placeholder="Buscar nos dados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-planilhorti-brown/20"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleExport}
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
                  {folder.schema.map((column) => (
                    <TableHead key={column.name} className="text-planilhorti-brown">
                      <div className="flex flex-col">
                        <span>{column.originalName}</span>
                        <span className="text-xs text-planilhorti-brown/50 font-normal">
                          {column.type}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="border-planilhorti-brown/5">
                    {folder.schema.map((column) => (
                      <TableCell key={column.name} className="text-planilhorti-brown/70">
                        {formatValue(record.data[column.name], column.type)}
                      </TableCell>
                    ))}
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

          {filteredRecords.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-planilhorti-brown/60">
                {searchTerm ? "Nenhum registro encontrado com os filtros aplicados" : "Nenhum dado encontrado nesta pasta"}
              </p>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="p-6 border-t border-planilhorti-brown/10 flex items-center justify-between">
              <div className="text-sm text-planilhorti-brown/70">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                {pagination.total} registros
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={pagination.page === 1}
                  className="border-planilhorti-brown/20 text-planilhorti-brown"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-planilhorti-brown/70">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                  disabled={pagination.page === pagination.totalPages}
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