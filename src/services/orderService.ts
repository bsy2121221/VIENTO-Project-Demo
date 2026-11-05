// Future API mapping:
//   list()                      GET   /api/orders                (admin)
//   place(request)              POST  /api/orders                (stock is validated & reserved server-side)
//   track(orderNumber, email)   GET   /api/orders/track?number=&email=
//   updateStatus(id, status)    PATCH /api/orders/{id}/status
//   updatePayment(id, status)   PATCH /api/orders/{id}/payment
import type { Order, OrderStatus, PaymentStatus, PlaceOrderRequest } from '@/types'
import { ORDER_STATUSES } from '@/types'
import { addDays, calcShipping } from '@/lib/format'
import { statusNote } from '@/data/seed'
import { ApiError, db, latency, newId } from './mockDb'

const generateOrderNumber = (existing: Order[]) => {
  let candidate = ''
  do {
    candidate = `VNT-${Math.floor(100000 + Math.random() * 900000)}`
  } while (existing.some((o) => o.orderNumber === candidate))
  return candidate
}

export const orderService = {
  async list(): Promise<Order[]> {
    await latency(350)
    return db.getOrders()
  },

  async place(request: PlaceOrderRequest): Promise<Order> {
    await latency(900)
    if (request.items.length === 0) throw new ApiError('Your cart is empty.')
    const products = db.getProducts()

    const items = request.items.map((line) => {
      const product = products.find((p) => p.id === line.productId)
      if (!product || !product.isActive) throw new ApiError('One of the products in your cart is no longer available.', 409)
      if (line.quantity > product.stock)
        throw new ApiError(`Only ${product.stock} unit(s) of ${product.name} are available.`, 409)
      return { productId: product.id, name: product.name, sku: product.sku, image: product.images[0] ?? '', unitPrice: product.price, quantity: line.quantity }
    })

    // Reduce demo inventory.
    const now = new Date().toISOString()
    db.saveProducts(
      products.map((p) => {
        const line = request.items.find((i) => i.productId === p.id)
        return line ? { ...p, stock: p.stock - line.quantity, updatedAt: now } : p
      }),
    )

    const orders = db.getOrders()
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    const shipping = calcShipping(subtotal)
    const orderNumber = generateOrderNumber(orders)
    const order: Order = {
      id: newId('o'),
      orderNumber,
      trackingNumber: `VTRK${orderNumber.slice(4)}${Math.floor(10 + Math.random() * 89)}IN`,
      createdAt: now,
      customer: { ...request.customer, email: request.customer.email.trim().toLowerCase() },
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      paymentMethod: request.paymentMethod,
      paymentStatus: request.paymentMethod === 'cod' ? 'Pending' : 'Paid',
      status: 'Order Placed',
      statusHistory: [{ status: 'Order Placed', at: now, note: statusNote('Order Placed') }],
      estimatedDelivery: addDays(now, 5),
      carrier: 'VIENTo Demo Logistics',
    }
    db.saveOrders([order, ...orders])
    return order
  },

  async track(orderNumber: string, email: string): Promise<Order> {
    await latency(500)
    const order = db
      .getOrders()
      .find((o) => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase() && o.customer.email.toLowerCase() === email.trim().toLowerCase())
    if (!order) throw new ApiError('We could not find an order with that order number and email address.', 404)
    return order
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await latency(150)
    return mutate(id, (o) => {
      // Record every step up to the new status, so skipped steps still appear in the history.
      const at = new Date().toISOString()
      const missing = ORDER_STATUSES.slice(0, ORDER_STATUSES.indexOf(status) + 1).filter((s) => !o.statusHistory.some((e) => e.status === s))
      return { ...o, status, statusHistory: [...o.statusHistory, ...missing.map((s) => ({ status: s, at, note: statusNote(s) }))] }
    })
  },

  async updatePayment(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    await latency(150)
    return mutate(id, (o) => ({ ...o, paymentStatus }))
  },
}

const mutate = (id: string, fn: (o: Order) => Order) => {
  const orders = db.getOrders()
  const index = orders.findIndex((o) => o.id === id)
  if (index === -1) throw new ApiError('Order not found.', 404)
  orders[index] = fn(orders[index])
  db.saveOrders(orders)
  return orders[index]
}
