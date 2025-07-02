// app/api/upload/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { UploadService } from '@/lib/upload-service'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 400 })
    }

    // Analisar arquivo
    const schema = await UploadService.analyzeFile(file)

    return NextResponse.json(schema)

  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro na análise do arquivo' },
      { status: 500 }
    )
  }
}