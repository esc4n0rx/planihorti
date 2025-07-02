// types/collection.ts
export interface Collection {
  id: string
  user_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  folders_count?: number
}

export interface CreateCollectionRequest {
  name: string
  description?: string
}

export interface UpdateCollectionRequest {
  name?: string
  description?: string
}

export interface Folder {
  id: string
  collection_id: string
  name: string
  schema: any[]
  file_name: string
  file_size: number
  records_count: number
  status: 'processing' | 'active' | 'error'
  created_at: string
  updated_at: string
}