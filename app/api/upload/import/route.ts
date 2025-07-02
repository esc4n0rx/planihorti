// app/api/upload/import/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { FileParser } from '@/lib/file-parser'
import { ColumnSchema } from '@/types/upload'

interface ImportRequest {
  file_data: string // base64
  file_name: string
  file_size: number
  collection_id: string
  schema: ColumnSchema[]
  folder_name: string
}

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

    const body: ImportRequest = await request.json()
    const { file_data, file_name, file_size, collection_id, schema, folder_name } = body

    // Verificar se a collection pertence ao usuário
    const { data: collection, error: collectionError } = await supabaseAdmin
      .from('collections')
      .select('id')
      .eq('id', collection_id)
      .eq('user_id', payload.sub)
      .single()

    if (collectionError || !collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    // Converter base64 de volta para File
    const buffer = Buffer.from(file_data, 'base64')
    const blob = new Blob([buffer])
    const file = new File([blob], file_name)

    // Parse do arquivo novamente para importação
    const parsedData = await FileParser.parseFile(file)

    // Criar folder
    const { data: folder, error: folderError } = await supabaseAdmin
      .from('folders')
      .insert({
        collection_id,
        name: folder_name,
        schema,
        file_name,
        file_size,
        status: 'processing'
      })
      .select()
      .single()

    if (folderError) {
      throw new Error(`Erro ao criar pasta: ${folderError.message}`)
    }

    // Preparar dados para inserção
    const dataRecords = parsedData.rows.map((row, index) => {
      const record: Record<string, any> = {}
      
      schema.forEach((column, colIndex) => {
        const rawValue = row[colIndex]
        record[column.name] = convertValue(rawValue, column.type)
      })

      return {
        folder_id: folder.id,
        data: record,
        row_number: index + 1
      }
    }).filter(record => 
      // Filtrar linhas completamente vazias
      Object.values(record.data).some(value => 
        value !== null && value !== undefined && String(value).trim() !== ''
      )
    )

    // Inserir dados em lotes de 1000
    const batchSize = 1000
    let totalInserted = 0

    for (let i = 0; i < dataRecords.length; i += batchSize) {
      const batch = dataRecords.slice(i, i + batchSize)
      
      const { error: insertError } = await supabaseAdmin
        .from('data_records')
        .insert(batch)

      if (insertError) {
        // Se der erro, marcar folder como erro
        await supabaseAdmin
          .from('folders')
          .update({ status: 'error' })
          .eq('id', folder.id)
        
        throw new Error(`Erro ao inserir dados: ${insertError.message}`)
      }

      totalInserted += batch.length
    }

    // Atualizar folder com contagem final e status ativo
    await supabaseAdmin
      .from('folders')
      .update({ 
        records_count: totalInserted,
        status: 'active'
      })
      .eq('id', folder.id)

    return NextResponse.json({
      message: 'Dados importados com sucesso',
      folder_id: folder.id,
      records_imported: totalInserted
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro na importação' },
      { status: 500 }
    )
  }
}

function convertValue(value: any, type: string): any {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null
  }

  switch (type) {
    case 'number':
      const num = Number(value)
      return isNaN(num) ? null : num

    case 'boolean':
      const str = String(value).toLowerCase()
      if (['true', 'sim', 'yes', '1'].includes(str)) return true
      if (['false', 'não', 'no', '0'].includes(str)) return false
      return null

    case 'date':
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date.toISOString()

    default:
      return String(value)
  }
}