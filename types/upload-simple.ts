import { ColumnSchema } from './upload'

// types/upload-simple.ts
export interface UploadedFile {
  id: string
  user_id: string
  file_name: string
  file_size: number
  schema: ColumnSchema[]
  sample_data: Record<string, any>[]
  total_rows: number
  status: 'analyzed' | 'processing' | 'error'
  created_at: string
  updated_at: string
}

export interface CreateUploadRequest {
  file_data: string // base64
  file_name: string
  file_size: number
  schema: ColumnSchema[]
  sample_data: Record<string, any>[]
  total_rows: number
}

// Re-export from existing types
export type { ColumnSchema, DetectedSchema } from './upload'