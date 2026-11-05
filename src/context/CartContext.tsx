import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '@/types'
import { calcShipping } from '@/lib/format'
import { CART_KEY, DEMO_RESET_EVENT, useStore } from './StoreContext'

export interface CartLine {
  product: Product
  quantity: number
}

type AddResult = { ok: true; quantity: number } | { ok: false; message: string }

interface CartState {
  lines: CartLine[]
  count: number
  subtotal: number
  shipping: number
  total: number
  /** Explains automatic changes made because admin stock or availability changed. */
  notice: string | null
  dismissNotice: () => void
  quantityOf: (productId: string) => number
  add: (product: Product, quantity?: number) => AddResult
  setQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
}

const CartContext = createContext<CartState | null>(null)

const readCart = (): CartItem[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') as CartItem[]
    return Array.isArray(parsed) ? parsed.filter((i) => i && typeof i.productId === 'string' && i.quantity > 0) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { products, loading } = useStore()
  const [items, setItems] = useState<CartItem[]>(readCart)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    const onReset = () => setItems([])
    window.addEventListener(DEMO_RESET_EVENT, onReset)
    return () => window.removeEventListener(DEMO_RESET_EVENT, onReset)
  }, [])

  // Reconcile the cart whenever inventory changes (e.g. admin lowers stock or deactivates a product).
  useEffect(() => {
    if (loading) return
    setItems((current) => {
      const changes: string[] = []
      const next = current.flatMap((item) => {
        const p = products.find((x) => x.id === item.productId)
        if (!p || !p.isActive || p.stock <= 0) {
          changes.push(`${p?.name ?? 'An item'} is no longer available and was removed.`)
          return []
        }
        if (item.quantity > p.stock) {
          changes.push(`${p.name} quantity reduced to ${p.stock} (available demo stock).`)
          return [{ ...item, quantity: p.stock }]
        }
        return [item]
      })
      if (changes.length) setNotice(changes.join(' '))
      return changes.length ? next : current
    })
  }, [products, loading])

  const lines = useMemo<CartLine[]>(
    () =>
      items.flatMap((i) => {
        const product = products.find((p) => p.id === i.productId)
        return product ? [{ product, quantity: i.quantity }] : []
      }),
    [items, products],
  )

  const quantityOf = useCallback((id: string) => items.find((i) => i.productId === id)?.quantity ?? 0, [items])

  const add = useCallback(
    (product: Product, quantity = 1): AddResult => {
      const inCart = items.find((i) => i.productId === product.id)?.quantity ?? 0
      if (!product.isActive || product.stock <= 0) return { ok: false, message: `${product.name} is currently out of stock.` }
      if (inCart + quantity > product.stock) {
        const remaining = product.stock - inCart
        return {
          ok: false,
          message: remaining > 0 ? `You can add only ${remaining} more. ${product.stock} available in demo stock.` : `You already have all ${product.stock} available units in your cart.`,
        }
      }
      setItems((list) =>
        inCart ? list.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i)) : [...list, { productId: product.id, quantity }],
      )
      return { ok: true, quantity: inCart + quantity }
    },
    [items],
  )

  const value = useMemo<CartState>(() => {
    const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0)
    const shipping = calcShipping(subtotal)
    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      notice,
      dismissNotice: () => setNotice(null),
      quantityOf,
      add,
      setQuantity: (productId, quantity) => {
        const p = products.find((x) => x.id === productId)
        const max = p?.stock ?? 1
        const q = Math.max(1, Math.min(max, Math.floor(quantity) || 1))
        setItems((list) => list.map((i) => (i.productId === productId ? { ...i, quantity: q } : i)))
      },
      remove: (productId) => setItems((list) => list.filter((i) => i.productId !== productId)),
      clear: () => {
        setItems([])
        setNotice(null)
      },
    }
  }, [lines, notice, quantityOf, add, products])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
