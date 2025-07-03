import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; folderId: string }> }
) {
  try {
    const { id, folderId } = await params
    
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

    // Verificar se o folder pertence à collection
    const { data: folder, error: folderError } = await supabaseAdmin
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .eq('collection_id', id)
      .single()

    if (folderError || !folder) {
      return NextResponse.json({ error: 'Pasta não encontrada' }, { status: 404 })
    }

    // Buscar dados da pasta com paginação
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const { data: records, error: recordsError, count } = await supabaseAdmin
      .from('data_records')
      .select('*', { count: 'exact' })
      .eq('folder_id', folderId)
      .order('row_number', { ascending: true })
      .range(offset, offset + limit - 1)

    if (recordsError) {
      throw new Error(recordsError.message)
    }

    return NextResponse.json({
      folder,
      records: records || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Get folder data error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados da pasta' },
      { status: 500 }
    )
  }
}