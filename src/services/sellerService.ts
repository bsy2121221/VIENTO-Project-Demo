// Future API mapping:
//   list()               GET   /api/sellers                 (admin; the storefront gets approved sellers only)
//   apply(application)   POST  /api/sellers/applications    (public "Sell with us" form)
//   update(id, patch)    PATCH /api/sellers/{id}            (admin: approve / reject / suspend / commission)
import type { Seller, SellerApplication } from '@/types'
import { slugify } from '@/lib/format'
import { ApiError, db, latency, newId } from './mockDb'

/** Rotating avatar colours for new shops. */
const SHOP_COLORS = ['#db2777', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#ca8a04', '#ea580c', '#e11d48']

/** New sellers start on the platform's standard commission; the admin can change it per seller. */
export const DEFAULT_COMMISSION = 10

export const sellerService = {
  async list(): Promise<Seller[]> {
    await latency(200)
    return db.getSellers()
  },

  async apply(application: SellerApplication): Promise<Seller> {
    await latency(800)
    const sellers = db.getSellers()
    const email = application.email.trim().toLowerCase()
    if (sellers.some((s) => s.email === email)) throw new ApiError('A seller account with this email already exists. Our team will contact you about it.', 409)
    if (sellers.some((s) => s.shopName.toLowerCase() === application.shopName.trim().toLowerCase())) throw new ApiError('This shop name is already taken. Please choose another.', 409)
    let slug = slugify(application.shopName) || 'shop'
    while (sellers.some((s) => s.slug === slug)) slug = `${slug}-${Math.floor(Math.random() * 90 + 10)}`
    const now = new Date().toISOString()
    const seller: Seller = {
      ...application,
      shopName: application.shopName.trim(),
      ownerName: application.ownerName.trim(),
      email,
      phone: application.phone.replace(/[\s-]/g, ''),
      gstin: application.gstin?.trim().toUpperCase() || undefined,
      id: newId('s'),
      slug,
      status: 'pending',
      commissionRate: DEFAULT_COMMISSION,
      color: SHOP_COLORS[sellers.length % SHOP_COLORS.length],
      createdAt: now,
      updatedAt: now,
    }
    db.saveSellers([...sellers, seller])
    return seller
  },

  async update(id: string, patch: Partial<Pick<Seller, 'status' | 'commissionRate' | 'note' | 'categoryIds' | 'description'>>): Promise<Seller> {
    await latency(150)
    const sellers = db.getSellers()
    const index = sellers.findIndex((s) => s.id === id)
    if (index === -1) throw new ApiError('Seller not found.', 404)
    if (sellers[index].isOfficial && patch.status && patch.status !== 'approved') throw new ApiError('The official store cannot be suspended or rejected.')
    if (patch.commissionRate !== undefined && (patch.commissionRate < 0 || patch.commissionRate > 50)) throw new ApiError('Commission must be between 0% and 50%.')
    const updated = { ...sellers[index], ...patch, updatedAt: new Date().toISOString() }
    sellers[index] = updated
    db.saveSellers(sellers)
    return updated
  },
}
