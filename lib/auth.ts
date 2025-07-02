import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '@/types/auth'

const JWT_SECRET = process.env.JWT_SECRET!
const SALT_ROUNDS = 12

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable')
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    },
    JWT_SECRET,
    { algorithm: 'HS256' }
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'Senha deve ter pelo menos 6 caracteres' }
  }
  
  if (password.length > 100) {
    return { isValid: false, message: 'Senha muito longa' }
  }
  
  return { isValid: true }
}