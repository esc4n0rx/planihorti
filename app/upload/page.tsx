"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"

export default function UploadPage() {
  const router = useRouter()
  const [collectionName, setCollectionName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"]
      if (validTypes.includes(file.type)) {
        setSelectedFile(file)
        setUploadStatus("idle")
      } else {
        alert("Por favor, selecione apenas arquivos .xlsx ou .csv")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collectionName || !selectedFile) return

    setUploading(true)
    setUploadStatus("uploading")
    setUploadProgress(0)

    // Simular upload com progresso
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploadStatus("success")
          setUploading(false)
          setTimeout(() => {
            router.push("/")
          }, 2000)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-planilhorti-brown mb-2">Nova Coleção</h1>
          <p className="text-planilhorti-brown/70">
            Faça upload de uma planilha para criar uma nova coleção de dados agrícolas
          </p>
        </div>

        <Card className="border-planilhorti-brown/10">
          <CardHeader>
            <CardTitle className="text-planilhorti-brown">Informações da Coleção</CardTitle>
            <CardDescription className="text-planilhorti-brown/70">
              Preencha os dados abaixo para criar sua nova coleção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Coleção</Label>
                <Input
                  id="name"
                  placeholder="Ex: Vendas Q1 2024"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  required
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Arquivo da Planilha</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="file"
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileText className="h-8 w-8 text-blue-600 mx-auto" />
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                        <div>
                          <p className="font-medium">Clique para selecionar um arquivo</p>
                          <p className="text-sm text-gray-500">Suporta arquivos .xlsx e .csv até 10MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {uploadStatus === "uploading" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processando arquivo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {uploadStatus === "success" && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span>Coleção criada com sucesso! Redirecionando...</span>
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span>Erro ao processar arquivo. Tente novamente.</span>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={uploading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!collectionName || !selectedFile || uploading}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {uploading ? "Processando..." : "Enviar e Processar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Dicas para upload:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Certifique-se de que a primeira linha contém os cabeçalhos das colunas</li>
            <li>• Remova linhas vazias desnecessárias antes do upload</li>
            <li>• Arquivos grandes podem levar alguns minutos para processar</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
