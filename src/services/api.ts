import type { User, Product, Order } from './types'

// API Base URL aus Environment Variable (ohne trailing slashes)
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  // Stelle sicher, dass endpoint mit / beginnt
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${cleanEndpoint}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  const result: ApiResponse<T> = await response.json()

  if (!result.success) {
    throw new Error(`API Error: ${result.message}`)
  }

  return result.data
}

async function postAPI<T>(endpoint: string, body: unknown): Promise<T> {
  // Stelle sicher, dass endpoint mit / beginnt
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${cleanEndpoint}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  const result: ApiResponse<T> = await response.json()

  if (!result.success) {
    throw new Error(`API Error: ${result.message}`)
  }

  return result.data
}

export const api = {
  async getUsers(): Promise<User[]> {
    return fetchAPI<User[]>('/api/users')
  },

  async getProducts(): Promise<Product[]> {
    return fetchAPI<Product[]>('/api/products')
  },

  async getOrders(): Promise<Order[]> {
    return fetchAPI<Order[]>('/api/orders')
  },

  async createUser(username: string, email: string): Promise<User> {
    return postAPI<User>('/api/users', { username, email })
  },

  async createProduct(
    name: string,
    description: string,
    price: number,
    stock: number,
  ): Promise<Product> {
    return postAPI<Product>('/api/products', { name, description, price, stock })
  },

  async createOrder(
    user_id: number,
    items: Array<{ product_id: number; quantity: number; price: number }>,
    status?: string,
  ): Promise<Order> {
    return postAPI<Order>('/api/orders', { user_id, items, status })
  },
}
