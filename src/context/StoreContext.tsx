import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Order, OrderStatus, PaymentStatus, PlaceOrderRequest, Product, ProductInput } from '@/types'
import { productService } from '@/services/productService'
import { orderService } from '@/services/orderService'
import { db } from '@/services/mockDb'
import { clearVerified } from '@/lib/verifiedOrders'

const MY_ORDERS_KEY = 'viento.demo.v1.myOrders'
export const CART_KEY = 'viento.demo.v1.cart'
export const DEMO_RESET_EVENT = 'viento:demo-reset'

interface StoreState {
  products: Product[]
  orders: Order[]
  loading: boolean
  error: string | null
  /** Order numbers placed from this browser, shown on My Orders. */
  myOrderNumbers: string[]
  reload: () => Promise<void>
  createProduct: (input: ProductInput) => Promise<Product>
  updateProduct: (id: string, patch: Partial<ProductInput>) => Promise<Product>
  deleteProduct: (id: string) => Promise<void>
  placeOrder: (req: PlaceOrderRequest) => Promise<Order>
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<Order>
  updatePaymentStatus: (id: string, status: PaymentStatus) => Promise<Order>
  resetDemo: () => Promise<void>
}

const StoreContext = createContext<StoreState | null>(null)

const readMyOrders = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(MY_ORDERS_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [myOrderNumbers, setMyOrderNumbers] = useState<string[]>(readMyOrders)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [p, o] = await Promise.all([productService.list(), orderService.list()])
      setProducts(p)
      setOrders(o)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load store data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  // Keep multiple tabs (e.g. storefront + admin side by side) in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('viento.demo.v1.') && e.key !== CART_KEY) {
        setProducts(db.getProducts())
        setOrders(db.getOrders())
        setMyOrderNumbers(readMyOrders())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const replaceProduct = (p: Product) => setProducts((list) => list.map((x) => (x.id === p.id ? p : x)))
  const replaceOrder = (o: Order) => setOrders((list) => list.map((x) => (x.id === o.id ? o : x)))

  const value = useMemo<StoreState>(
    () => ({
      products,
      orders,
      loading,
      error,
      myOrderNumbers,
      reload,
      async createProduct(input) {
        const p = await productService.create(input)
        setProducts((list) => [p, ...list])
        return p
      },
      async updateProduct(id, patch) {
        const p = await productService.update(id, patch)
        replaceProduct(p)
        return p
      },
      async deleteProduct(id) {
        await productService.remove(id)
        setProducts((list) => list.filter((p) => p.id !== id))
      },
      async placeOrder(req) {
        const order = await orderService.place(req)
        setOrders((list) => [order, ...list])
        setProducts(db.getProducts())
        setMyOrderNumbers((list) => {
          const next = [order.orderNumber, ...list]
          localStorage.setItem(MY_ORDERS_KEY, JSON.stringify(next))
          return next
        })
        return order
      },
      async updateOrderStatus(id, status) {
        const o = await orderService.updateStatus(id, status)
        replaceOrder(o)
        return o
      },
      async updatePaymentStatus(id, status) {
        const o = await orderService.updatePayment(id, status)
        replaceOrder(o)
        return o
      },
      async resetDemo() {
        db.reset()
        localStorage.removeItem(MY_ORDERS_KEY)
        localStorage.removeItem(CART_KEY)
        clearVerified()
        setMyOrderNumbers([])
        window.dispatchEvent(new Event(DEMO_RESET_EVENT))
        await reload()
      },
    }),
    [products, orders, loading, error, myOrderNumbers, reload],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

/** Products visible to customers. */
export const useCatalog = () => {
  const { products, ...rest } = useStore()
  const catalog = useMemo(() => products.filter((p) => p.isActive), [products])
  return { ...rest, products: catalog }
}
