"use client"

import { Header } from "@/components/layout/header"
import { UploadFlow } from "@/components/upload/upload-flow"
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

        <UploadFlow />
      </main>
    </div>
  )
}