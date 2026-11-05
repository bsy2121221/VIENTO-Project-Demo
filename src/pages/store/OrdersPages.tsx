import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, CalendarClock, FileSearch, MapPin, PackageSearch, Receipt, Search, Truck } from 'lucide-react'
import OrderTimeline from '@/components/product/OrderTimeline'
import { Breadcrumbs, DemoNotice, EmptyState, ErrorState, Field, OrderStatusBadge, PageLoader, PaymentBadge, ProductImage, Spinner } from '@/components/ui'
import { useStore } from '@/context/StoreContext'
import { orderService } from '@/services/orderService'
import { PAYMENT_METHOD_LABELS } from '@/data/seed'
import type { Order } from '@/types'
import { ORDER_STATUSES } from '@/types'
import { formatDate, formatPrice } from '@/lib/format'
import { markVerified, readVerified } from '@/lib/verifiedOrders'

/* ---------- Lookup form ---------- */
function TrackOrderForm({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate()
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ orderNumber?: string; email?: string }>({})
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!orderNumber.trim()) errs.orderNumber = 'Enter your order number.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) errs.email = 'Enter the email used at checkout.'
    setErrors(errs)
    setLookupError(null)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      const order = await orderService.track(orderNumber, email)
      markVerified(order.orderNumber)
      navigate(`/orders/${order.orderNumber}`)
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Order lookup failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className={compact ? '' : 'card p-6 sm:p-8'}>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
        <Field label="Order number" htmlFor="track-order" error={errors.orderNumber}>
          <input id="track-order" className="input" placeholder="e.g. VNT-4821-DEMO" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} aria-invalid={errors.orderNumber ? true : undefined} aria-describedby={errors.orderNumber ? 'track-order-error' : undefined} />
        </Field>
        <Field label="Email address" htmlFor="track-email" error={errors.email}>
          <input id="track-email" type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? 'track-email-error' : undefined} />
        </Field>
        <button type="submit" className="btn btn-primary mt-0 h-[42px] sm:mt-7" disabled={busy}>
          {busy ? <Spinner className="h-4 w-4" /> : <Search className="h-4 w-4" aria-hidden />} Find order
        </button>
      </div>
      {lookupError && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {lookupError}
        </p>
      )}
      <p className="mt-4 text-xs text-slate-500">
        Try the sample order <button type="button" className="font-mono font-semibold text-navy-700 underline" onClick={() => { setOrderNumber('VNT-4858-DEMO'); setEmail('rahul.demo@example.com') }}>VNT-4858-DEMO</button> with <span className="font-mono">rahul.demo@example.com</span>.
      </p>
    </form>
  )
}

export function TrackOrderPage() {
  return (
    <div className="container-page max-w-4xl py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Track Order' }]} />
      <div className="mt-6 mb-8 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-300">
          <Truck className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold">Track your order</h1>
          <p className="mt-1 text-slate-600">Enter the order number from your confirmation page and the email address used at checkout.</p>
        </div>
      </div>
      <TrackOrderForm />
    </div>
  )
}

/* ---------- My Orders ---------- */
export function MyOrdersPage() {
  const { orders, myOrderNumbers, loading, error, reload } = useStore()
  const mine = orders.filter((o) => myOrderNumbers.includes(o.orderNumber))

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My Orders' }]} />
      <h1 className="mt-4 text-3xl font-extrabold">My orders</h1>
      <p className="mt-1 text-slate-600">Demo orders placed from this browser.</p>

      <div className="mt-8">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <PageLoader label="Loading your orders…" />
        ) : mine.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<Receipt className="h-8 w-8" />}
              title="No orders yet"
              description="Orders you place on this device will appear here. You can also find any order using the lookup below."
              action={
                <Link to="/products" className="btn btn-primary">
                  Start shopping
                </Link>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {mine.map((o) => (
              <OrderListCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>

      <section className="mt-12" aria-labelledby="lookup-heading">
        <h2 id="lookup-heading" className="text-xl font-bold">
          Look up an order
        </h2>
        <p className="mt-1 mb-5 text-sm text-slate-600">Placed an order on another device? Find it with the order number and email.</p>
        <TrackOrderForm />
      </section>
    </div>
  )
}

function OrderListCard({ order }: { order: Order }) {
  const progress = ((ORDER_STATUSES.indexOf(order.status) + 1) / ORDER_STATUSES.length) * 100
  return (
    <article className="card overflow-hidden transition hover:shadow-md">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4 text-sm">
        <div>
          <p className="text-xs text-slate-500">Order number</p>
          <p className="font-mono font-bold text-navy-900">{order.orderNumber}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Placed on</p>
          <p className="font-semibold text-navy-900">{formatDate(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Total</p>
          <p className="font-semibold text-navy-900">{formatPrice(order.total)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Payment</p>
          <PaymentBadge status={order.paymentStatus} />
        </div>
        <div className="ml-auto">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <div className="flex -space-x-3">
          {order.items.slice(0, 3).map((i) => (
            <ProductImage key={i.productId} src={i.image} alt="" className="h-14 w-14 rounded-xl border-2 border-white" />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-navy-900">{order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Delivery progress">
            <div className="h-full rounded-full bg-navy-900 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">{order.status === 'Delivered' ? 'Delivered' : `Estimated delivery ${formatDate(order.estimatedDelivery)}`}</p>
        </div>
        <Link to={`/orders/${order.orderNumber}`} className="btn btn-outline shrink-0">
          Track order <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  )
}

/* ---------- Tracking detail ---------- */
export function OrderTrackingPage() {
  const { orderNumber = '' } = useParams()
  const { orders, myOrderNumbers, loading, error, reload } = useStore()
  const order = orders.find((o) => o.orderNumber === orderNumber)
  const allowed = myOrderNumbers.includes(orderNumber) || readVerified().includes(orderNumber)

  if (error) return <ErrorState message={error} onRetry={reload} />
  if (loading) return <PageLoader label="Fetching tracking details…" />

  if (!order || !allowed)
    return (
      <div className="container-page max-w-4xl py-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Track Order', to: '/track' }, { label: orderNumber }]} />
        <div className="card mt-8">
          <EmptyState
            icon={order ? <FileSearch className="h-8 w-8" /> : <PackageSearch className="h-8 w-8" />}
            title={order ? 'Verify your order' : 'Order not found'}
            description={order ? 'For privacy, please confirm the email address used for this order.' : 'This order number does not exist or the demo data has been reset.'}
          />
          <div className="border-t border-slate-100 p-6">
            <TrackOrderForm compact />
          </div>
        </div>
      </div>
    )

  const delivered = order.status === 'Delivered'
  return (
    <div className="container-page max-w-5xl py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My Orders', to: '/orders' }, { label: order.orderNumber }]} />
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Order tracking</p>
          <h1 className="mt-1 font-mono text-2xl font-extrabold sm:text-3xl">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-slate-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentBadge status={order.paymentStatus} />
        </div>
      </div>

      <section className="card mt-8 p-6 sm:p-8" aria-labelledby="timeline-heading">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="timeline-heading" className="text-lg font-bold">
            Shipment status
          </h2>
          <span className="demo-badge">Simulated shipment</span>
        </div>
        <div className="mt-8">
          <OrderTimeline order={order} />
        </div>
        <div className="mt-8 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 h-5 w-5 text-navy-600" aria-hidden />
            <div>
              <p className="text-xs text-slate-500">Demo tracking number</p>
              <p className="font-mono text-sm font-bold text-navy-900">{order.trackingNumber}</p>
              <p className="text-xs text-slate-500">{order.carrier}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-5 w-5 text-navy-600" aria-hidden />
            <div>
              <p className="text-xs text-slate-500">{delivered ? 'Delivered on' : 'Estimated delivery'}</p>
              <p className="text-sm font-bold text-navy-900">{formatDate(delivered ? order.statusHistory.find((e) => e.status === 'Delivered')?.at ?? order.estimatedDelivery : order.estimatedDelivery)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-navy-600" aria-hidden />
            <div>
              <p className="text-xs text-slate-500">Delivering to</p>
              <p className="text-sm font-bold text-navy-900">
                {order.customer.city}, {order.customer.state}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2" aria-labelledby="items-heading">
          <h2 id="items-heading" className="text-lg font-bold">
            Products ordered
          </h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {order.items.map((i) => (
              <li key={i.productId} className="flex items-center gap-4 py-3">
                <ProductImage src={i.image} alt="" className="h-14 w-14 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy-900">{i.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatPrice(i.unitPrice)} × {i.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold">{formatPrice(i.unitPrice * i.quantity)}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-6" aria-labelledby="payment-summary-heading">
          <h2 id="payment-summary-heading" className="text-lg font-bold">
            Payment summary
          </h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Shipping</dt>
              <dd className="font-semibold">{order.shipping ? formatPrice(order.shipping) : 'Free'}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3">
              <dt className="font-bold text-navy-900">Order total</dt>
              <dd className="font-display text-lg font-extrabold text-navy-900">{formatPrice(order.total)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-slate-500">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
        </section>
      </div>

      <DemoNotice className="mt-6">Shipment progress is simulated. Status changes made by an admin in the dashboard are reflected here immediately.</DemoNotice>
    </div>
  )
}
