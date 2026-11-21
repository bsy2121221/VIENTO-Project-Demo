// localStorage-backed "database" for the demo. In production this file is removed and
// each service method calls the ASP.NET Core Web API endpoint noted at the top of its file.
import type { Category, Order, Product, Seller } from '@/types'
import { OFFICIAL_SELLER_ID, SEED_CATEGORIES, SEED_PRODUCTS, SEED_SELLERS, createSeedOrders } from '@/data/seed'

const KEYS = {
  // Bumped to v4 when categories were consolidated into three ranges and new products were added, so existing browsers pick up the new catalogue.
  products: 'viento.demo.v4.products',
  orders: 'viento.demo.v1.orders',
  categories: 'viento.demo.v1.categories',
  sellers: 'viento.demo.v1.sellers',
} as const

/** Every key the demo "database" owns, so other tabs can tell when to resync. */
export const DB_KEYS: readonly string[] = Object.values(KEYS)

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
    // Products saved before the marketplace upgrade have no seller; they belong to the official store.
    if (stored) return stored.map((p) => (p.sellerId ? p : { ...p, sellerId: OFFICIAL_SELLER_ID }))
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
  getCategories(): Category[] {
    const stored = read<Category[]>(KEYS.categories)
    if (stored) return stored
    const seeded = clone(SEED_CATEGORIES)
    write(KEYS.categories, seeded)
    return seeded
  },
  saveCategories(categories: Category[]) {
    write(KEYS.categories, categories)
  },
  getSellers(): Seller[] {
    const stored = read<Seller[]>(KEYS.sellers)
    if (stored) return stored
    const seeded = clone(SEED_SELLERS)
    write(KEYS.sellers, seeded)
    return seeded
  },
  saveSellers(sellers: Seller[]) {
    write(KEYS.sellers, sellers)
  },
  reset() {
    write(KEYS.products, clone(SEED_PRODUCTS))
    write(KEYS.orders, createSeedOrders())
    write(KEYS.categories, clone(SEED_CATEGORIES))
    write(KEYS.sellers, clone(SEED_SELLERS))
  },
}

/** Simulates network latency so loading states behave like a real API. */
export const latency = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

