"use client"

import { useRouter } from "next/navigation"
import { RegisterForm } from "@/components/register-form"
import { RegisterRequest } from "@/types/auth"

export default function RegisterPage() {
  const router = useRouter()

  const handleRegister = async (data: RegisterRequest) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao criar conta')
    }

    // Redirecionar para login após registro bem-sucedido
    router.push('/login?message=Conta criada com sucesso! Faça login para continuar.')
  }

  return <RegisterForm onRegister={handleRegister} />
}