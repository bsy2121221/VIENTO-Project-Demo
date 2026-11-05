// localStorage-backed "database" for the demo. In production this file is removed and
// each service method calls the ASP.NET Core Web API endpoint noted at the top of its file.
import type { Order, Product } from '@/types'
import { SEED_PRODUCTS, createSeedOrders } from '@/data/seed'

const KEYS = {
  products: 'viento.demo.v1.products',
  orders: 'viento.demo.v1.orders',
} as const

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const read = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new ApiError('Browser storage is full. Try a smaller product image or reset the demo data.', 507)
  }
}

const clone = <T>(value: T): T => structuredClone(value)

export const db = {
  getProducts(): Product[] {
    const stored = read<Product[]>(KEYS.products)
    if (stored) return stored
    const seeded = clone(SEED_PRODUCTS)
    write(KEYS.products, seeded)
    return seeded
  },
  saveProducts(products: Product[]) {
    write(KEYS.products, products)
  },
  getOrders(): Order[] {
    const stored = read<Order[]>(KEYS.orders)
    if (stored) return stored
    const seeded = createSeedOrders()
    write(KEYS.orders, seeded)
    return seeded
  },
  saveOrders(orders: Order[]) {
    write(KEYS.orders, orders)
  },
  reset() {
    write(KEYS.products, clone(SEED_PRODUCTS))
    write(KEYS.orders, createSeedOrders())
  },
}

/** Simulates network latency so loading states behave like a real API. */
export const latency = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
