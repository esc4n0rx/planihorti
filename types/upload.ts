import { Collection } from "./collection"

// types/upload.ts
export interface ColumnSchema {
  name: string
  originalName: string
  type: 'text' | 'number' | 'date' | 'boolean'
  required: boolean
  position: number
  sample_values: (string | number | boolean | null)[]
}

export interface DetectedSchema {
  columns: ColumnSchema[]
  totalRows: number
  sampleData: Record<string, any>[]
  fileName: string
  fileSize: number
}

export interface Folder {
  id: string
  collection_id: string
  name: string
  description?: string
  schema: ColumnSchema[]
  records_count: number
  file_name?: string
  file_size?: number
  status: 'active' | 'processing' | 'error' | 'archived'
  created_at: string
  updated_at: string
}

export interface DataRecord {
  id: string
  folder_id: string
  data: Record<string, any>
  row_number?: number
  created_at: string
}

export interface CreateFolderRequest {
  collection_id: string
  name: string
  description?: string
  schema: ColumnSchema[]
  file_name?: string
  file_size?: number
}

export interface UploadAnalysisRequest {
  file: File
  collection_id?: string
  collection_name?: string
}

export interface ImportDataRequest {
  folder_id: string
  data: Record<string, any>[]
}

export interface UploadStep {
  id: number
  title: string
  description: string
  completed: boolean
  current: boolean
}

export interface UploadState {
  currentStep: number
  file: File | null
  collection: Collection | null
  detectedSchema: DetectedSchema | null
  configuredSchema: ColumnSchema[] | null
  isAnalyzing: boolean
  isImporting: boolean
  error: string | null
  success: boolean
}