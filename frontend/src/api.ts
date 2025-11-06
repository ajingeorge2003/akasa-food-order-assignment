const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://akasa-food-order-assignment.onrender.com'

export const apiCall = async (endpoint: string, method: string = 'GET', body?: any, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const options: any = { method, headers }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${API_BASE}${endpoint}`, options)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || `API error: ${res.status}`)
  }
  return res.json()
}

export const auth = {
  register: (email: string, password: string) =>
    apiCall('/auth/register', 'POST', { email, password }),
  login: (email: string, password: string) =>
    apiCall('/auth/login', 'POST', { email, password }),
}

export const products = {
  list: (category: string = 'All') =>
    apiCall(`/products?category=${category}`),
  getCategories: async () => {
    const prods = await apiCall('/products?category=All')
    return ['All', ...new Set(prods.map((p: any) => p.category))]
  },
}

export const cart = {
  get: (token: string) => apiCall('/cart', 'GET', undefined, token),
  add: (productId: string, qty: number, token: string) =>
    apiCall('/cart', 'POST', { productId, qty }, token),
  update: (productId: string, qty: number, token: string) =>
    apiCall('/cart', 'PUT', { productId, qty }, token),
  remove: (productId: string, token: string) =>
    apiCall(`/cart/${productId}`, 'DELETE', undefined, token),
}

export const orders = {
  checkout: (token: string) => apiCall('/orders/checkout', 'POST', {}, token),
  list: (token: string) => apiCall('/orders', 'GET', undefined, token),
  get: (id: string, token: string) => apiCall(`/orders/${id}`, 'GET', undefined, token),
}
