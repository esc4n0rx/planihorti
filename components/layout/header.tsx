// components/layout/header.tsx
"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, LogOut, User, Upload } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UploadModal } from "@/components/upload/upload-modal"

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <FileSpreadsheet className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold text-planilhorti-brown">Planilhorti</span>
        </Link>

        <div className="flex items-center space-x-4">
          <UploadModal onUploadComplete={() => {
            // Opcional: atualizar algo quando upload completa
            console.log('Upload completed!')
          }}>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Button>
          </UploadModal>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}