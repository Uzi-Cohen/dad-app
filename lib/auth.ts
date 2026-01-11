import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { Role } from '@prisma/client'

/**
 * Authentication Service
 *
 * Handles user authentication, session management, and authorization.
 */

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: Role
}

export interface JWTPayload extends AuthUser {
  iat: number
  exp: number
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
)
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Create a JWT token for a user
 */
export async function createToken(user: AuthUser): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET)

  return token
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as JWTPayload
  } catch {
    return null
  }
}

/**
 * Register a new user
 */
export async function register(
  email: string,
  password: string,
  name?: string,
  role: Role = 'OWNER'
): Promise<{ user: AuthUser; token: string }> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error('User already exists')
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  // Create token
  const token = await createToken(user)

  return { user, token }
}

/**
 * Login a user
 */
export async function login(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string }> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new Error('Invalid credentials')
  }

  // Verify password
  const valid = await verifyPassword(password, user.password)
  if (!valid) {
    throw new Error('Invalid credentials')
  }

  // Create token
  const token = await createToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  }
}

/**
 * Get user from token
 */
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  const payload = await verifyToken(token)
  if (!payload) return null

  // Verify user still exists
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  return user
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser, requiredRole: Role | Role[]): boolean {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return roles.includes(user.role)
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'ADMIN'
}

/**
 * Middleware helper to get authenticated user from request
 */
export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get('Authorization')
  const token = extractToken(authHeader)

  if (!token) return null

  return getUserFromToken(token)
}

/**
 * Middleware helper to require authentication
 *
 * NOTE: Auth temporarily disabled - always returns first OWNER user
 */
export async function requireAuth(request: Request): Promise<AuthUser> {
  // Temporarily bypass authentication - get first owner user
  const user = await prisma.user.findFirst({
    where: { role: 'OWNER' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  if (!user) {
    throw new Error('No user found in database')
  }

  return user
}

/**
 * Middleware helper to require specific role
 */
export async function requireRole(request: Request, role: Role | Role[]): Promise<AuthUser> {
  const user = await requireAuth(request)

  if (!hasRole(user, role)) {
    throw new Error('Forbidden')
  }

  return user
}
