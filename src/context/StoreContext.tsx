import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Category, CategoryInput, Order, OrderStatus, PaymentStatus, PlaceOrderRequest, Product, ProductInput, Seller, SellerApplication } from '@/types'
import { productService } from '@/services/productService'
import { orderService } from '@/services/orderService'
import { categoryService } from '@/services/categoryService'
import { sellerService } from '@/services/sellerService'
import { DB_KEYS, db } from '@/services/mockDb'
import { clearVerified } from '@/lib/verifiedOrders'

const MY_ORDERS_KEY = 'viento.demo.v1.myOrders'
export const CART_KEY = 'viento.demo.v1.cart'
export const DEMO_RESET_EVENT = 'viento:demo-reset'

interface StoreState {
  products: Product[]
  orders: Order[]
  /** Every category, including hidden ones, in display order. */
  categories: Category[]
  /** Every seller, whatever their status. */
  sellers: Seller[]
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
  createCategory: (input: CategoryInput) => Promise<Category>
  updateCategory: (id: string, patch: Partial<Omit<Category, 'id'>>) => Promise<Category>
  applyAsSeller: (application: SellerApplication) => Promise<Seller>
  updateSeller: (id: string, patch: Parameters<typeof sellerService.update>[1]) => Promise<Seller>
  resetDemo: () => Promise<void>
}

const bySortOrder = (a: Category, b: Category) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)

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
  const [categories, setCategories] = useState<Category[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [myOrderNumbers, setMyOrderNumbers] = useState<string[]>(readMyOrders)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [p, o, c, s] = await Promise.all([productService.list(), orderService.list(), categoryService.list(), sellerService.list()])
      setProducts(p)
      setOrders(o)
      setCategories([...c].sort(bySortOrder))
      setSellers(s)
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
      if (e.key && (DB_KEYS.includes(e.key) || e.key === MY_ORDERS_KEY)) {
        setProducts(db.getProducts())
        setOrders(db.getOrders())
        setCategories([...db.getCategories()].sort(bySortOrder))
        setSellers(db.getSellers())
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
      categories,
      sellers,
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
      async createCategory(input) {
        const c = await categoryService.create(input)
        setCategories((list) => [...list, c].sort(bySortOrder))
        return c
      },
      async updateCategory(id, patch) {
        const c = await categoryService.update(id, patch)
        setCategories((list) => list.map((x) => (x.id === c.id ? c : x)).sort(bySortOrder))
        return c
      },
      async applyAsSeller(application) {
        const s = await sellerService.apply(application)
        setSellers((list) => [...list, s])
        return s
      },
      async updateSeller(id, patch) {
        const s = await sellerService.update(id, patch)
        setSellers((list) => list.map((x) => (x.id === s.id ? s : x)))
        return s
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
    [products, orders, categories, sellers, loading, error, myOrderNumbers, reload],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

/**
 * What customers can see: active products from approved sellers in visible categories,
 * plus the visible categories and approved sellers themselves.
 */
export const useCatalog = () => {
  const store = useStore()
  return useMemo(() => {
    const { products, categories, sellers, ...rest } = store
    const visibleCategories = categories.filter((c) => c.isActive)
    const approvedSellers = sellers.filter((s) => s.status === 'approved')
    const categoryIds = new Set(visibleCategories.map((c) => c.id))
    const sellerIds = new Set(approvedSellers.map((s) => s.id))
    const catalog = products.filter((p) => p.isActive && categoryIds.has(p.categoryId) && sellerIds.has(p.sellerId))
    return { ...rest, products: catalog, categories: visibleCategories, sellers: approvedSellers }
  }, [store])
}

/** Look-up helpers over the full (unfiltered) lists, for labels on cards, tables and order lines. */
export const useLookups = () => {
  const { categories, sellers } = useStore()
  return useMemo(
    () => ({
      category: (id: string | undefined) => categories.find((c) => c.id === id),
      seller: (id: string | undefined) => sellers.find((s) => s.id === id),
    }),
    [categories, sellers],
  )
}
