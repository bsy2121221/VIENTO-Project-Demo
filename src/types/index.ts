// Domain models. These mirror the DTOs the future ASP.NET Core Web API is expected
// to return, so the services layer can swap localStorage for HTTP without UI changes.

export type CategoryId = 'hand-sealers' | 'impulse-sealers' | 'band-sealers' | 'accessories' | 'spare-parts' | 'home-decor-gifts' | 'kitchen-essentials'

/** Top-level storefront groupings shown on the Explore page. */
export type DepartmentId = 'home-decor-gifts' | 'power-tools' | 'home-kitchen'

export interface Department {
  id: DepartmentId
  name: string
  description: string
  categoryIds: CategoryId[]
  /** Cover image for the department tile; a branded placeholder is shown when omitted. */
  image?: string
}

export interface Category {
  id: CategoryId
  name: string
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
