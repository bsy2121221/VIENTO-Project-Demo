import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, FileSearch, Package, Truck } from 'lucide-react'
import { DemoNotice, EmptyState, PageLoader, PaymentBadge, ProductImage } from '@/components/ui'
import { useStore } from '@/context/StoreContext'
import { PAYMENT_METHOD_LABELS } from '@/data/seed'
import { formatDate, formatPrice } from '@/lib/format'

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams()
  const { orders, loading } = useStore()
  const order = orders.find((o) => o.orderNumber === orderNumber)

  if (loading) return <PageLoader />
  if (!order)
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<FileSearch className="h-8 w-8" />}
          title="Order not found"
          description="We couldn't find this order. It may have been cleared when the demo data was reset."
          action={
            <Link to="/track" className="btn btn-primary">
              Track an order
            </Link>
          }
        />
      </div>
    )

  return (
    <div className="container-page max-w-4xl py-12">
      <div className="animate-fade-up text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
          <CheckCircle2 className="h-11 w-11 text-emerald-600" aria-hidden />
        </span>
        <p className="eyebrow mt-6">Demo order confirmed</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Thank you, {order.customer.fullName.split(' ')[0]}!</h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-600">
          Your sample order has been placed. A confirmation would normally be emailed to <strong className="text-navy-900">{order.customer.email}</strong>.
        </p>
      </div>

      <div className="card mt-10 overflow-hidden">
        <div className="grid gap-px bg-slate-100 sm:grid-cols-4">
          {[
            ['Order number', order.orderNumber],
            ['Order date', formatDate(order.createdAt)],
            ['Estimated delivery', formatDate(order.estimatedDelivery)],
            ['Total', formatPrice(order.total)],
          ].map(([k, v]) => (
            <div key={k} className="bg-white p-5">
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{k}</p>
              <p className="mt-1 font-display text-lg font-extrabold break-all text-navy-900">{v}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-8 p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Package className="h-4 w-4 text-navy-600" aria-hidden /> Items
            </h2>
            <ul className="mt-4 space-y-3">
              {order.items.map((i) => (
                <li key={i.productId} className="flex items-center gap-3">
                  <ProductImage src={i.image} alt="" className="h-12 w-12 rounded-lg" />
                  <p className="flex-1 text-sm text-navy-900">
                    {i.name} <span className="text-slate-500">× {i.quantity}</span>
                  </p>
                  <p className="text-sm font-semibold">{formatPrice(i.unitPrice * i.quantity)}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-5 text-sm">
            <div>
              <h2 className="flex items-center gap-2 font-bold">
                <Truck className="h-4 w-4 text-navy-600" aria-hidden /> Shipping to
              </h2>
              <p className="mt-2 leading-relaxed text-slate-600">
                {order.customer.fullName}
                <br />
                {order.customer.addressLine1}
                {order.customer.addressLine2 && `, ${order.customer.addressLine2}`}
                <br />
                {order.customer.city}, {order.customer.state} {order.customer.postalCode}
              </p>
            </div>
            <div>
              <h2 className="font-bold">Payment</h2>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-slate-600">
                {PAYMENT_METHOD_LABELS[order.paymentMethod]} <PaymentBadge status={order.paymentStatus} />
              </p>
            </div>
            <div>
              <h2 className="font-bold">Demo tracking number</h2>
              <p className="mt-2 font-mono text-navy-900">{order.trackingNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <DemoNotice className="mt-6">Keep the order number and email to look the order up later. Status updates made in the admin dashboard appear on the tracking page.</DemoNotice>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to={`/orders/${order.orderNumber}`} className="btn btn-primary btn-lg">
          Track this order
        </Link>
        <Link to="/products" className="btn btn-outline btn-lg">
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
