// Future API mapping:
//   list()            GET  /api/categories
//   create(input)     POST /api/categories          (admin)
//   update(id, patch) PUT  /api/categories/{id}     (admin)
import type { Category, CategoryInput } from '@/types'
import { slugify } from '@/lib/format'
import { ApiError, db, latency } from './mockDb'

export const categoryService = {
  async list(): Promise<Category[]> {
    await latency(200)
    return db.getCategories()
  },

  async create(input: CategoryInput): Promise<Category> {
    await latency()
    const categories = db.getCategories()
    const id = slugify(input.id || input.name)
    if (!id) throw new ApiError('Please enter a category name.')
    if (categories.some((c) => c.id === id || c.name.toLowerCase() === input.name.trim().toLowerCase()))
      throw new ApiError('A category with this name already exists.', 409)
    const category: Category = { ...input, id, name: input.name.trim() }
    db.saveCategories([...categories, category])
    return category
  },

  async update(id: string, patch: Partial<Omit<Category, 'id'>>): Promise<Category> {
    await latency(150)
    const categories = db.getCategories()
    const index = categories.findIndex((c) => c.id === id)
    if (index === -1) throw new ApiError('Category not found.', 404)
    if (patch.name && categories.some((c) => c.id !== id && c.name.toLowerCase() === patch.name!.trim().toLowerCase()))
      throw new ApiError('Another category already uses this name.', 409)
    const updated = { ...categories[index], ...patch }
    categories[index] = updated
    db.saveCategories(categories)
    return updated
  },
}
