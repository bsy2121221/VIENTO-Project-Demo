import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, ArrowRight, ShieldCheck, ShoppingBag, Trash2, X } from 'lucide-react'
import { Breadcrumbs, ConfirmDialog, EmptyState, PageLoader, ProductImage, QuantitySelector, StockBadge } from '@/components/ui'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { FREE_SHIPPING_THRESHOLD, formatPrice } from '@/lib/format'

export function OrderSummary({ subtotal, shipping, total, children }: { subtotal: number; shipping: number; total: number; children?: React.ReactNode }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-slate-600">Subtotal</span>
        <span className="font-semibold text-navy-900">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Shipping</span>
        <span className="font-semibold text-navy-900">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
      </div>
      {shipping > 0 && <p className="rounded-lg bg-navy-50 px-3 py-2 text-xs text-navy-700">Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.</p>}
      {children}
      <div className="flex items-baseline justify-between border-t border-slate-200 pt-4">
        <span className="font-semibold text-navy-900">Total</span>
        <span className="font-display text-2xl font-extrabold text-navy-900">{formatPrice(total)}</span>
      </div>
      <p className="text-xs text-slate-500">Inclusive of all taxes · Demo amounts</p>
    </div>
  )
}

export default function CartPage() {
  const cart = useCart()
  const { loading } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [confirmClear, setConfirmClear] = useState(false)

  if (loading) return <PageLoader label="Loading your cart…" />

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
      <h1 className="mt-4 text-3xl font-extrabold">Shopping cart</h1>

      {cart.notice && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p className="flex-1">{cart.notice}</p>
          <button onClick={cart.dismissNotice} aria-label="Dismiss" className="rounded p-0.5 hover:bg-amber-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {cart.lines.length === 0 ? (
        <div className="card mt-8">
          <EmptyState
            icon={<ShoppingBag className="h-8 w-8" />}
            title="Your cart is empty"
            description="Browse our sealing machines and spare parts to start a demo order."
            action={
              <Link to="/products" className="btn btn-primary">
                Start shopping
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2" aria-label="Cart items">
            <div className="card divide-y divide-slate-100">
              {cart.lines.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 p-5 sm:gap-6">
                  <Link to={`/products/${product.slug}`} className="shrink-0 overflow-hidden rounded-xl bg-slate-50">
                    <ProductImage src={product.images[0]} alt={product.name} className="h-24 w-24 sm:h-28 sm:w-28" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link to={`/products/${product.slug}`} className="font-bold text-navy-900 hover:text-navy-600">
                          {product.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-500">SKU {product.sku}</p>
                        <p className="mt-1 text-sm text-slate-600">{formatPrice(product.price)} each</p>
                      </div>
                      <p className="font-display text-lg font-extrabold whitespace-nowrap text-navy-900">{formatPrice(product.price * quantity)}</p>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                      <div className="flex items-center gap-3">
                        <QuantitySelector size="sm" value={quantity} max={product.stock} onChange={(q) => cart.setQuantity(product.id, q)} label={`Quantity for ${product.name}`} />
                        <StockBadge product={product} />
                      </div>
                      <button
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600"
                        onClick={() => {
                          cart.remove(product.id)
                          toast.info('Removed from cart', product.name)
                        }}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden /> Remove
                      </button>
                    </div>
                    {quantity >= product.stock && <p className="mt-2 text-xs text-amber-700">Maximum available demo stock reached.</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap justify-between gap-3">
              <Link to="/products" className="btn btn-outline">
                <ArrowLeft className="h-4 w-4" aria-hidden /> Continue Shopping
              </Link>
              <button className="btn btn-ghost text-red-600 hover:bg-red-50" onClick={() => setConfirmClear(true)}>
                <Trash2 className="h-4 w-4" aria-hidden /> Clear cart
              </button>
            </div>
          </section>

          <aside className="card h-fit p-6 lg:sticky lg:top-28" aria-label="Order summary">
            <h2 className="text-lg font-bold">Order summary</h2>
            <p className="mt-1 text-sm text-slate-500">
              {cart.count} item{cart.count === 1 ? '' : 's'}
            </p>
            <div className="mt-6">
              <OrderSummary subtotal={cart.subtotal} shipping={cart.shipping} total={cart.total} />
            </div>
            <button className="btn btn-primary btn-lg mt-6 w-full" onClick={() => navigate('/checkout')}>
              Proceed to Checkout <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4" aria-hidden /> Simulated checkout. No real payment is taken.
            </p>
          </aside>
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Clear your cart?"
        message="All items will be removed from your cart. This cannot be undone."
        confirmLabel="Clear cart"
        danger
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          cart.clear()
          setConfirmClear(false)
          toast.info('Cart cleared')
        }}
      />
    </div>
  )
}
