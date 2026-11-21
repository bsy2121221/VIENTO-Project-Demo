// Domain models. These mirror the DTOs the future ASP.NET Core Web API is expected
// to return, so the services layer can swap localStorage for HTTP without UI changes.

/**
 * Category ids are data, not a fixed union: the marketplace admin can add categories at any time.
 * The original three ranges keep their ids ('home-decor-gifts', 'power-tools', 'home-kitchen').
 */
export type CategoryId = string

/** Icon keys a category can use. Mapped to Lucide icons in `lib/categoryIcons.tsx`. */
export const CATEGORY_ICONS = ['shirt', 'sparkles', 'baby', 'gem', 'heart-pulse', 'house', 'cooking-pot', 'wrench', 'smartphone', 'footprints', 'dumbbell', 'gift', 'book', 'car', 'paw', 'shopping-bag'] as const
export type CategoryIcon = (typeof CATEGORY_ICONS)[number]

export interface Category {
  id: CategoryId
  name: string
  description: string
  /** Accent colour (hex) used for the category's chip, icon bubble and tiles. */
  color: string
  icon: CategoryIcon
  /** Cover image for collection tiles; a coloured icon tile is shown when omitted. */
  image?: string
  /** Hidden categories (and their products) are not shown on the storefront. */
  isActive: boolean
  sortOrder: number
}

export type CategoryInput = Omit<Category, 'id'> & { id?: string }

/* ---------- Sellers (multi-vendor marketplace) ---------- */

export const SELLER_STATUSES = ['pending', 'approved', 'rejected', 'suspended'] as const
export type SellerStatus = (typeof SELLER_STATUSES)[number]

export interface Seller {
  id: string
  slug: string
  shopName: string
  ownerName: string
  email: string
  phone: string
  city: string
  state: string
  gstin?: string
  /** Categories the seller wants to (or does) sell in. */
  categoryIds: CategoryId[]
  description: string
  status: SellerStatus
  /** Platform commission charged on each sale, in percent. */
  commissionRate: number
  /** Brand colour for the shop avatar. */
  color: string
  /** The platform's own store. It cannot be suspended or deleted. */
  isOfficial?: boolean
  /** Admin note, e.g. the reason an application was rejected. */
  note?: string
  createdAt: string
  updatedAt: string
}

export interface SellerApplication {
  shopName: string
  ownerName: string
  email: string
  phone: string
  city: string
  state: string
  gstin?: string
  categoryIds: CategoryId[]
  description: string
}

export interface ProductSpec {
  label: string
  value: string
}

export interface Product {
  id: string
  slug: string
  name: string
  categoryId: CategoryId
  /** The marketplace seller who lists and ships this product. */
  sellerId: string
  shortDescription: string
  description: string
  /** Demo price in INR. */
  price: number
  /** Optional demo MRP shown as a strike-through price. */
  compareAtPrice?: number
  stock: number
  lowStockThreshold: number
  images: string[]
  /** Set when the images are representative rather than of this exact model. */
  imageNote?: string
  features: string[]
  specs: ProductSpec[]
  isActive: boolean
  isFeatured: boolean
  sku: string
  createdAt: string
  updatedAt: string
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export interface CartItem {
  productId: string
  quantity: number
}

export const ORDER_STATUSES = ['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export type PaymentMethod = 'demo-card' | 'demo-upi' | 'cod'

export interface ShippingAddress {
  fullName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
}

export interface OrderItem {
  productId: string
  name: string
  sku: string
  image: string
  unitPrice: number
  quantity: number
  /** Optional because orders placed before the marketplace upgrade have no seller recorded. */
  sellerId?: string
  sellerName?: string
}

export interface StatusEvent {
  status: OrderStatus
  at: string
  note: string
}

export interface Order {
  id: string
  orderNumber: string
  trackingNumber: string
  createdAt: string
  customer: ShippingAddress
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  status: OrderStatus
  statusHistory: StatusEvent[]
  estimatedDelivery: string
  carrier: string
}

export interface PlaceOrderRequest {
  customer: ShippingAddress
  items: CartItem[]
  paymentMethod: PaymentMethod
}
