/**
 * API Client
 *
 * Utility for making authenticated requests to the backend API
 */

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiClient {
  private token: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const url = `${API_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || 'An error occurred',
        response.status,
        data
      )
    }

    return data
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ user: any; token: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    )
    this.setToken(data.token)
    return data
  }

  async register(email: string, password: string, name?: string) {
    const data = await this.request<{ user: any; token: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }
    )
    this.setToken(data.token)
    return data
  }

  async getMe() {
    return this.request<{ user: any }>('/api/auth/me')
  }

  logout() {
    this.setToken(null)
  }

  // Brands
  async getBrands() {
    return this.request<{ brands: any[] }>('/api/brands')
  }

  async getBrand(id: string) {
    return this.request<{ brand: any }>(`/api/brands/${id}`)
  }

  async createBrand(data: any) {
    return this.request<{ brand: any }>('/api/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBrand(id: string, data: any) {
    return this.request<{ brand: any }>(`/api/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteBrand(id: string) {
    return this.request<{ success: boolean }>(`/api/brands/${id}`, {
      method: 'DELETE',
    })
  }

  // Products
  async getProducts() {
    return this.request<{ products: any[] }>('/api/products')
  }

  async getProduct(id: string) {
    return this.request<{ product: any }>(`/api/products/${id}`)
  }

  async createProduct(data: any) {
    return this.request<{ product: any }>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProduct(id: string, data: any) {
    return this.request<{ product: any }>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(id: string) {
    return this.request<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE',
    })
  }

  // Assets
  async getAssets(productId: string) {
    return this.request<{ assets: any[] }>(`/api/products/${productId}/assets`)
  }

  async uploadAsset(productId: string, data: any) {
    return this.request<{ asset: any }>(`/api/products/${productId}/assets`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Video Generation
  async generateVideo(data: any) {
    return this.request<{ job: any }>('/api/generate/video', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Jobs
  async getJob(id: string) {
    return this.request<{ job: any; queueStatus?: any }>(`/api/jobs/${id}`)
  }

  async cancelJob(id: string) {
    return this.request<{ success: boolean }>(`/api/jobs/${id}`, {
      method: 'DELETE',
    })
  }
}

// Singleton instance
export const apiClient = new ApiClient()
