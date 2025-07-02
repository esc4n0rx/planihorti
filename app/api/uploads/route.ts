// app/api/uploads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { CreateUploadRequest } from '@/types/upload-simple'

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

    const { data: uploads, error } = await supabaseAdmin
      .from('uploads')
      .select('*')
      .eq('user_id', payload.sub)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json(uploads)

  } catch (error) {
    console.error('Get uploads error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar uploads' },
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

    const body: CreateUploadRequest = await request.json()
    const { file_name, file_size, schema, sample_data, total_rows } = body

    // Validações
    if (!file_name || !schema || schema.length === 0) {
      return NextResponse.json(
        { error: 'Dados do upload incompletos' },
        { status: 400 }
      )
    }

    // Salvar upload no banco
    const { data: upload, error } = await supabaseAdmin
      .from('uploads')
      .insert({
        user_id: payload.sub,
        file_name,
        file_size,
        schema,
        sample_data,
        total_rows,
        status: 'analyzed'
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json(upload, { status: 201 })

  } catch (error) {
    console.error('Create upload error:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar upload' },
      { status: 500 }
    )
  }
}