// app/api/collections/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { CreateCollectionRequest } from '@/types/collection'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { data: collections, error } = await supabaseAdmin
      .from('collections')
      .select(`
        *,
        folders:folders(count)
      `)
      .eq('user_id', payload.sub)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    // Calcular estatísticas
    const collectionsWithStats = collections.map(collection => ({
      ...collection,
      folders_count: collection.folders?.[0]?.count || 0
    }))

    return NextResponse.json(collectionsWithStats)

  } catch (error) {
    console.error('Get collections error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar coleções' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const body: CreateCollectionRequest = await request.json()
    const { name, description } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nome da coleção é obrigatório' },
        { status: 400 }
      )
    }

    const { data: collection, error } = await supabaseAdmin
      .from('collections')
      .insert({
        user_id: payload.sub,
        name: name.trim(),
        description: description?.trim()
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json(collection, { status: 201 })

  } catch (error) {
    console.error('Create collection error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar coleção' },
      { status: 500 }
    )
  }
}