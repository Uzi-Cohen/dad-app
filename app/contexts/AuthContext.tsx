'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'OWNER' | 'EDITOR'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const token = apiClient.getToken()
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      const { user } = await apiClient.getMe()
      setUser(user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      apiClient.logout()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = async (email: string, password: string) => {
    const { user } = await apiClient.login(email, password)
    setUser(user)
  }

  const register = async (email: string, password: string, name?: string) => {
    const { user } = await apiClient.register(email, password, name)
    setUser(user)
  }

  const logout = () => {
    apiClient.logout()
    setUser(null)
  }

  const refetchUser = async () => {
    await fetchUser()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
