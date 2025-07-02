// app/api/collections/[id]/folders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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
      .eq('id', id)
      .eq('user_id', payload.sub)
      .single()

    if (collectionError || !collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    // Buscar folders da collection
    const { data: folders, error } = await supabaseAdmin
      .from('folders')
      .select('*')
      .eq('collection_id', id)
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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
      .eq('id', id)
      .eq('user_id', payload.sub)
      .single()

    if (collectionError || !collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const { name, schema, file_name, file_size, upload_id } = body

    // Validações
    if (!name || !schema) {
      return NextResponse.json(
        { error: 'Nome e schema são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar folder
    const { data: folder, error: folderError } = await supabaseAdmin
      .from('folders')
      .insert({
        collection_id: id,
        name: name.trim(),
        schema,
        file_name: file_name || null,
        file_size: file_size || null,
        upload_id: upload_id || null,
        records_count: 0,
        status: 'active'
      })
      .select()
      .single()

    if (folderError) {
      console.error('Folder creation error:', folderError)
      throw new Error(`Erro ao criar pasta: ${folderError.message}`)
    }

    return NextResponse.json(folder, { status: 201 })

  } catch (error) {
    console.error('Create folder error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao criar pasta' },
      { status: 500 }
    )
  }
}