// components/upload/schema-configurator.tsx
"use client"

import React, { useState } from 'react'
import { useUpload } from '@/hooks/use-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit2, Eye, EyeOff } from 'lucide-react'
import { ColumnSchema } from '@/types/upload'
import { DataPreview } from './data-preview'

export function SchemaConfigurator() {
 const { state, updateSchema, goToStep } = useUpload()
 const [editingColumn, setEditingColumn] = useState<number | null>(null)
 const [showPreview, setShowPreview] = useState(true)

 if (!state.detectedSchema || !state.configuredSchema) return null

 const handleColumnUpdate = (index: number, updates: Partial<ColumnSchema>) => {
   const newSchema = [...state.configuredSchema!]
   newSchema[index] = { ...newSchema[index], ...updates }
   updateSchema(newSchema)
 }

 const handleProceed = () => {
   goToStep(4)
 }

 const getTypeColor = (type: string) => {
   switch (type) {
     case 'text': return 'bg-blue-100 text-blue-800'
     case 'number': return 'bg-green-100 text-green-800'
     case 'date': return 'bg-purple-100 text-purple-800'
     case 'boolean': return 'bg-orange-100 text-orange-800'
     default: return 'bg-gray-100 text-gray-800'
   }
 }

 return (
   <div className="space-y-6">
     <div>
       <h3 className="text-lg font-medium text-planilhorti-brown mb-2">
         Configurar Schema das Colunas
       </h3>
       <p className="text-sm text-planilhorti-brown/70 mb-4">
         Revise e ajuste as configurações detectadas automaticamente para cada coluna
       </p>
     </div>

     <div className="flex items-center justify-between">
       <div className="flex items-center space-x-4">
         <Badge variant="outline" className="text-planilhorti-brown">
           {state.configuredSchema.length} colunas detectadas
         </Badge>
         <Badge variant="outline" className="text-planilhorti-brown">
           {state.detectedSchema.totalRows} linhas de dados
         </Badge>
       </div>

       <Button
         variant="outline"
         size="sm"
         onClick={() => setShowPreview(!showPreview)}
         className="flex items-center space-x-2"
       >
         {showPreview ? (
           <>
             <EyeOff className="h-4 w-4" />
             <span>Ocultar Preview</span>
           </>
         ) : (
           <>
             <Eye className="h-4 w-4" />
             <span>Mostrar Preview</span>
           </>
         )}
       </Button>
     </div>

     {/* Schema Configuration Table */}
     <Card>
       <CardHeader>
         <CardTitle className="text-base">Configuração das Colunas</CardTitle>
       </CardHeader>
       <CardContent>
         <div className="overflow-x-auto">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Nome Original</TableHead>
                 <TableHead>Nome do Campo</TableHead>
                 <TableHead>Tipo</TableHead>
                 <TableHead>Obrigatório</TableHead>
                 <TableHead>Valores de Amostra</TableHead>
                 <TableHead className="w-12"></TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {state.configuredSchema.map((column, index) => (
                 <TableRow key={column.position}>
                   <TableCell className="font-medium">
                     {column.originalName}
                   </TableCell>
                   <TableCell>
                     {editingColumn === index ? (
                       <Input
                         value={column.name}
                         onChange={(e) => handleColumnUpdate(index, { name: e.target.value })}
                         onBlur={() => setEditingColumn(null)}
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') setEditingColumn(null)
                         }}
                         className="h-8"
                         autoFocus
                       />
                     ) : (
                       <span 
                         className="cursor-pointer hover:text-primary"
                         onClick={() => setEditingColumn(index)}
                       >
                         {column.name}
                       </span>
                     )}
                   </TableCell>
                   <TableCell>
                     <Select
                       value={column.type}
                       onValueChange={(value) => handleColumnUpdate(index, { 
                         type: value as ColumnSchema['type'] 
                       })}
                     >
                       <SelectTrigger className="w-32">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="text">Texto</SelectItem>
                         <SelectItem value="number">Número</SelectItem>
                         <SelectItem value="date">Data</SelectItem>
                         <SelectItem value="boolean">Booleano</SelectItem>
                       </SelectContent>
                     </Select>
                   </TableCell>
                   <TableCell>
                     <Switch
                       checked={column.required}
                       onCheckedChange={(checked) => handleColumnUpdate(index, { required: checked })}
                     />
                   </TableCell>
                   <TableCell>
                     <div className="flex flex-wrap gap-1">
                       {column.sample_values.slice(0, 3).map((value, i) => (
                         <Badge 
                           key={i} 
                           variant="secondary" 
                           className={`text-xs ${getTypeColor(column.type)}`}
                         >
                           {value === null ? 'null' : String(value)}
                         </Badge>
                       ))}
                       {column.sample_values.length > 3 && (
                         <Badge variant="secondary" className="text-xs">
                           +{column.sample_values.length - 3}
                         </Badge>
                       )}
                     </div>
                   </TableCell>
                   <TableCell>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => setEditingColumn(editingColumn === index ? null : index)}
                     >
                       <Edit2 className="h-4 w-4" />
                     </Button>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </div>
       </CardContent>
     </Card>

     {/* Data Preview */}
     {showPreview && (
       <DataPreview 
         schema={state.configuredSchema}
         sampleData={state.detectedSchema.sampleData}
       />
     )}

     {/* Action Buttons */}
     <div className="flex justify-between">
       <Button
         variant="outline"
         onClick={() => goToStep(2)}
       >
         Voltar
       </Button>
       <Button
         onClick={handleProceed}
         className="bg-primary hover:bg-primary/90"
       >
         Importar Dados
       </Button>
     </div>
   </div>
 )
}