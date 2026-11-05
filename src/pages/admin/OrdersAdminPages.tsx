import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, ExternalLink, Mail, MapPin, Phone, Receipt, Search } from 'lucide-react'
import { AdminPageHeader } from '@/components/layout/AdminLayout'
import OrderTimeline from '@/components/product/OrderTimeline'
import { DemoNotice, EmptyState, ErrorState, OrderStatusBadge, PageLoader, PaymentBadge, ProductImage, Spinner } from '@/components/ui'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { PAYMENT_METHOD_LABELS } from '@/data/seed'
import { ORDER_STATUSES, PAYMENT_STATUSES, type OrderStatus, type PaymentStatus } from '@/types'
import { formatDate, formatDateTime, formatPrice } from '@/lib/format'
import { markVerified } from '@/lib/verifiedOrders'

export function OrdersAdminPage() {
  const { orders, loading, error, reload } = useStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | OrderStatus>('all')

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase()
    return orders.filter((o) => (status === 'all' || o.status === status) && (!t || o.orderNumber.toLowerCase().includes(t) || o.customer.fullName.toLowerCase().includes(t)))
  }, [orders, query, status])

  if (error) return <ErrorState message={error} onRetry={reload} />
  if (loading) return <PageLoader label="Loading orders…" />

  return (
    <>
      <AdminPageHeader title="Orders" description={`${orders.length} demo orders · sample customers`} />

      <div className="card mb-4 flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <label htmlFor="order-search" className="sr-only">
            Search orders
          </label>
          <input id="order-search" type="search" className="input pl-9" placeholder="Search by order number or customer name" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <label htmlFor="order-status-filter" className="sr-only">
          Filter by status
        </label>
        <select id="order-status-filter" className="input sm:w-48" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<Receipt className="h-8 w-8" />} title="No orders found" description={orders.length ? 'Try another order number, customer name or status.' : 'Orders placed on the storefront will appear here.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Items</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((o) => (
                  <tr key={o.id} className="group hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <Link to={`/admin/orders/${o.id}`} className="font-mono font-semibold whitespace-nowrap text-navy-800 hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium whitespace-nowrap text-navy-900">{o.customer.fullName}</p>
                      <p className="text-xs text-slate-500">{o.customer.city}</p>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-500">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatPrice(o.total)}</td>
                    <td className="px-5 py-3">
                      <PaymentBadge status={o.paymentStatus} />
                    </td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link to={`/admin/orders/${o.id}`} className="inline-flex rounded-lg p-1.5 text-slate-400 group-hover:text-navy-900 hover:bg-slate-100" aria-label={`Open order ${o.orderNumber}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export function OrderDetailAdminPage() {
  const { id } = useParams()
  const { orders, loading, error, reload, updateOrderStatus, updatePaymentStatus } = useStore()
  const toast = useToast()
  const [busy, setBusy] = useState<'status' | 'payment' | null>(null)
  const order = orders.find((o) => o.id === id)

  if (error) return <ErrorState message={error} onRetry={reload} />
  if (loading) return <PageLoader label="Loading order…" />
  if (!order)
    return (
      <EmptyState
        icon={<Receipt className="h-8 w-8" />}
        title="Order not found"
        description="This order may have been removed by a demo data reset."
        action={
          <Link to="/admin/orders" className="btn btn-primary">
            Back to orders
          </Link>
        }
      />
    )

  const changeStatus = async (s: OrderStatus) => {
    setBusy('status')
    try {
      await updateOrderStatus(order.id, s)
      toast.success('Order status updated', `${order.orderNumber} is now “${s}”.`)
    } catch (e) {
      toast.error('Update failed', e instanceof Error ? e.message : undefined)
    } finally {
      setBusy(null)
    }
  }
  const changePayment = async (s: PaymentStatus) => {
    setBusy('payment')
    try {
      await updatePaymentStatus(order.id, s)
      toast.success('Payment status updated', `${order.orderNumber} payment marked “${s}”.`)
    } catch (e) {
      toast.error('Update failed', e instanceof Error ? e.message : undefined)
    } finally {
      setBusy(null)
    }
  }

  const currentIdx = ORDER_STATUSES.indexOf(order.status)
  const nextStatus = ORDER_STATUSES[currentIdx + 1]

  return (
    <>
      <Link to="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All orders
      </Link>
      <AdminPageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        actions={
          <Link to={`/orders/${order.orderNumber}`} target="_blank" className="btn btn-outline" onClick={() => markVerified(order.orderNumber)}>
            <ExternalLink className="h-4 w-4" aria-hidden /> Customer tracking view
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="card p-6" aria-labelledby="progress-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="progress-heading" className="text-base font-bold">
                Fulfilment progress
              </h2>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="mt-8">
              <OrderTimeline order={order} />
            </div>
          </section>

          <section className="card overflow-hidden" aria-labelledby="items-heading">
            <h2 id="items-heading" className="px-6 pt-5 text-base font-bold">
              Items
            </h2>
            <table className="mt-3 w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {order.items.map((i) => (
                  <tr key={i.productId}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage src={i.image} alt="" className="h-11 w-11 shrink-0 rounded-lg" />
                        <div>
                          <p className="font-medium text-navy-900">{i.name}</p>
                          <p className="font-mono text-xs text-slate-500">{i.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right whitespace-nowrap text-slate-600">
                      {formatPrice(i.unitPrice)} × {i.quantity}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold whitespace-nowrap tabular-nums">{formatPrice(i.unitPrice * i.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="space-y-2 border-t border-slate-200 bg-slate-50/60 px-6 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="font-semibold">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Shipping</dt>
                <dd className="font-semibold">{order.shipping ? formatPrice(order.shipping) : 'Free'}</dd>
              </div>
              <div className="flex justify-between text-base">
                <dt className="font-bold text-navy-900">Total</dt>
                <dd className="font-extrabold text-navy-900">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-6" aria-labelledby="history-heading">
            <h2 id="history-heading" className="text-base font-bold">
              Status history
            </h2>
            <ul className="mt-4 space-y-3">
              {[...order.statusHistory].reverse().map((e) => (
                <li key={e.status + e.at} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-navy-700" aria-hidden />
                  <div>
                    <p className="font-semibold text-navy-900">{e.status}</p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(e.at)} · {e.note}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-6" aria-labelledby="controls-heading">
            <div className="flex items-center justify-between">
              <h2 id="controls-heading" className="text-base font-bold">
                Update order
              </h2>
              <span className="demo-badge">Demo controls</span>
            </div>
            <div className="mt-5 space-y-5">
              <div>
                <label htmlFor="order-status" className="label">
                  Order status
                </label>
                <div className="flex items-center gap-2">
                  <select id="order-status" className="input" value={order.status} disabled={busy !== null} onChange={(e) => changeStatus(e.target.value as OrderStatus)}>
                    {ORDER_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  {busy === 'status' && <Spinner className="h-4 w-4 text-navy-700" />}
                </div>
                {nextStatus && (
                  <button className="btn btn-primary mt-3 w-full" disabled={busy !== null} onClick={() => changeStatus(nextStatus)}>
                    Mark as {nextStatus}
                  </button>
                )}
              </div>
              <div>
                <label htmlFor="payment-status" className="label">
                  Payment status
                </label>
                <div className="flex items-center gap-2">
                  <select id="payment-status" className="input" value={order.paymentStatus} disabled={busy !== null} onChange={(e) => changePayment(e.target.value as PaymentStatus)}>
                    {PAYMENT_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  {busy === 'payment' && <Spinner className="h-4 w-4 text-navy-700" />}
                </div>
                <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod]} <PaymentBadge status={order.paymentStatus} />
                </p>
              </div>
            </div>
          </section>

          <section className="card p-6" aria-labelledby="customer-heading">
            <h2 id="customer-heading" className="text-base font-bold">
              Customer
            </h2>
            <p className="mt-3 font-semibold text-navy-900">{order.customer.fullName}</p>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" aria-hidden /> {order.customer.email}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden /> {order.customer.phone}
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <span>
                  {order.customer.addressLine1}
                  {order.customer.addressLine2 && `, ${order.customer.addressLine2}`}
                  <br />
                  {order.customer.city}, {order.customer.state} {order.customer.postalCode}
                </span>
              </li>
            </ul>
          </section>

          <section className="card p-6" aria-labelledby="shipment-heading">
            <h2 id="shipment-heading" className="text-base font-bold">
              Shipment
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Tracking no.</dt>
                <dd className="font-mono font-semibold text-navy-900">{order.trackingNumber}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Carrier</dt>
                <dd className="text-navy-900">{order.carrier}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Est. delivery</dt>
                <dd className="text-navy-900">{formatDate(order.estimatedDelivery)}</dd>
              </div>
            </dl>
          </section>
          <DemoNotice>Changes here update the customer’s tracking page instantly.</DemoNotice>
        </div>
      </div>
    </>
  )
}
