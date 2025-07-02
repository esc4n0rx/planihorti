// app/upload/page.tsx
"use client"

import { Header } from "@/components/layout/header"
import { UploadWizard } from "@/components/upload/upload-wizard"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-planilhorti-brown hover:bg-planilhorti-brown/10 mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar às Coleções
            </Button>
          </Link>
        </div>

        <UploadWizard />

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Dicas para upload:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Certifique-se de que a primeira linha contém os cabeçalhos das colunas</li>
            <li>• Remova linhas vazias desnecessárias antes do upload</li>
            <li>• Arquivos grandes podem levar alguns minutos para processar</li>
            <li>• Tipos de dados são detectados automaticamente, mas você pode ajustá-los</li>
            <li>• Colunas marcadas como obrigatórias não podem ter valores vazios</li>
          </ul>
        </div>
      </main>
    </div>
  )
}