import { supabaseAdmin } from './supabase'
import { User, RegisterRequest } from '@/types/auth'

export async function createUser(userData: RegisterRequest & { password_hash: string }): Promise<User> {
  const { email, name, password_hash } = userData
  
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert([{ 
      email, 
      name, 
      password_hash 
    }])
    .select('id, email, name, created_at, updated_at')
    .single()

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`)
  }

  return data
}

export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, name, password_hash, created_at, updated_at')
    .eq('email', email)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // User not found
    }
    throw new Error(`Failed to get user: ${error.message}`)
  }

  return data
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, name, created_at, updated_at')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // User not found
    }
    throw new Error(`Failed to get user: ${error.message}`)
  }

  return data
}