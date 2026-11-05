// Future API mapping:
//   list()            GET    /api/products
//   create(input)     POST   /api/products
//   update(id, patch) PUT    /api/products/{id}
//   remove(id)        DELETE /api/products/{id}
import type { Product, ProductInput } from '@/types'
import { ApiError, db, latency, newId } from './mockDb'

export const productService = {
  async list(): Promise<Product[]> {
    await latency(350)
    return db.getProducts()
  },

  async create(input: ProductInput): Promise<Product> {
    await latency()
    const products = db.getProducts()
    if (products.some((p) => p.slug === input.slug)) throw new ApiError('A product with a similar name already exists.', 409)
    const now = new Date().toISOString()
    const product: Product = { ...input, id: newId('p'), createdAt: now, updatedAt: now }
    db.saveProducts([product, ...products])
    return product
  },

  async update(id: string, patch: Partial<ProductInput>): Promise<Product> {
    await latency(150)
    const products = db.getProducts()
    const index = products.findIndex((p) => p.id === id)
    if (index === -1) throw new ApiError('Product not found.', 404)
    if (patch.slug && products.some((p) => p.slug === patch.slug && p.id !== id)) throw new ApiError('Another product already uses this name.', 409)
    const updated: Product = { ...products[index], ...patch, updatedAt: new Date().toISOString() }
    products[index] = updated
    db.saveProducts(products)
    return updated
  },

  async remove(id: string): Promise<void> {
    await latency()
    db.saveProducts(db.getProducts().filter((p) => p.id !== id))
  },
}
