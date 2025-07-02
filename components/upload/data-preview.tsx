// components/upload/data-preview.tsx
"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ColumnSchema } from '@/types/upload'

interface DataPreviewProps {
  schema: ColumnSchema[]
  sampleData: Record<string, any>[]
}

export function DataPreview({ schema, sampleData }: DataPreviewProps) {
  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined || String(value).trim() === '') {
      return <span className="text-gray-400 italic">vazio</span>
    }

    switch (type) {
      case 'number':
        const num = Number(value)
        return isNaN(num) ? (
          <span className="text-red-500">inválido</span>
        ) : (
          <span className="font-mono">{num.toLocaleString()}</span>
        )

      case 'boolean':
        const str = String(value).toLowerCase()
        const boolValue = ['true', 'sim', 'yes', '1'].includes(str)
        return (
          <Badge variant={boolValue ? "default" : "secondary"} className="text-xs">
            {boolValue ? 'Verdadeiro' : 'Falso'}
          </Badge>
        )

      case 'date':
        const date = new Date(value)
        return isNaN(date.getTime()) ? (
          <span className="text-red-500">data inválida</span>
        ) : (
          <span className="font-mono">{date.toLocaleDateString('pt-BR')}</span>
        )

      default:
        return <span>{String(value)}</span>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝'
      case 'number': return '🔢'
      case 'date': return '📅'
      case 'boolean': return '✓'
      default: return '❓'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center space-x-2">
          <span>Preview dos Dados</span>
          <Badge variant="secondary">
            Primeiras {sampleData.length} linhas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {schema.map((column) => (
                  <TableHead key={column.position} className="min-w-32">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <span>{getTypeIcon(column.type)}</span>
                        <span className="font-medium">{column.name}</span>
                        {column.required && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                      >
                        {column.type}
                      </Badge>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {schema.map((column) => (
                    <TableCell key={column.position}>
                      {formatValue(row[column.originalName], column.type)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {sampleData.length === 0 && (
          <div className="text-center py-8 text-planilhorti-brown/50">
            Nenhum dado disponível para preview
          </div>
        )}
      </CardContent>
    </Card>
  )
}