// app/api/collections/[id]/folders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Verificar se a collection pertence ao usuário
    const { data: collection, error: collectionError } = await supabaseAdmin
      .from('collections')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', payload.sub)
      .single()

    if (collectionError || !collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    // Buscar folders da collection
    const { data: folders, error } = await supabaseAdmin
      .from('folders')
      .select('*')
      .eq('collection_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json(folders)

  } catch (error) {
    console.error('Get folders error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pastas' },
      { status: 500 }
    )
  }
}