import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, IndianRupee, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import { AdminPageHeader } from '@/components/layout/AdminLayout'
import SalesChart, { type MonthPoint } from '@/components/admin/SalesChart'
import { ErrorState, OrderStatusBadge, PageLoader, PaymentBadge, ProductImage, StockBadge, stockLevel } from '@/components/ui'
import { useStore } from '@/context/StoreContext'
import { MOCK_MONTHLY_REVENUE } from '@/data/seed'
import { cn, formatDate, formatPrice } from '@/lib/format'

export default function DashboardPage() {
  const { products, orders, loading, error, reload } = useStore()

  const stats = useMemo(() => {
    const revenueOrders = orders.filter((o) => o.paymentStatus !== 'Refunded' && o.paymentStatus !== 'Failed')
    const revenue = revenueOrders.reduce((s, o) => s + o.total, 0)
    const lowStock = products.filter((p) => stockLevel(p) !== 'in')
    const now = new Date()
    const months: MonthPoint[] = MOCK_MONTHLY_REVENUE.map((base, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (MOCK_MONTHLY_REVENUE.length - 1 - i), 1)
      const inMonth = revenueOrders.filter((o) => {
        const c = new Date(o.createdAt)
        return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth()
      })
      return {
        label: d.toLocaleDateString('en-IN', { month: 'short' }),
        revenue: base + inMonth.reduce((s, o) => s + o.total, 0),
        orders: Math.round(base / 1450) + inMonth.length,
      }
    })
    const avgOrder = revenueOrders.length ? revenue / revenueOrders.length : 0
    return { revenue, lowStock, months, avgOrder, pending: orders.filter((o) => o.status !== 'Delivered').length }
  }, [products, orders])

  if (error) return <ErrorState message={error} onRetry={reload} />
  if (loading) return <PageLoader label="Loading dashboard…" />

  const tiles = [
    { label: 'Total products', value: String(products.length), sub: `${products.filter((p) => p.isActive).length} active in store`, icon: Package, to: '/admin/products' },
    { label: 'Total orders', value: String(orders.length), sub: `${stats.pending} awaiting delivery`, icon: ShoppingCart, to: '/admin/orders' },
    { label: 'Demo revenue', value: formatPrice(stats.revenue), sub: `Avg. order ${formatPrice(stats.avgOrder)}`, icon: IndianRupee, to: '/admin/orders' },
    { label: 'Low-stock products', value: String(stats.lowStock.length), sub: stats.lowStock.length ? 'Needs restocking' : 'All stock healthy', icon: AlertTriangle, to: '/admin/inventory', warn: stats.lowStock.length > 0 },
  ]

  return (
    <>
      <AdminPageHeader title="Dashboard" description="Overview of the VIENTo demo store. All figures are sample data." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} className="card group p-5 transition hover:border-navy-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{t.label}</p>
              <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', t.warn ? 'bg-amber-50 text-amber-600' : 'bg-navy-50 text-navy-700')}>
                <t.icon className="h-[18px] w-[18px]" aria-hidden />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold text-navy-900 tabular-nums">{t.value}</p>
            <p className={cn('mt-1 text-xs', t.warn ? 'font-medium text-amber-700' : 'text-slate-500')}>{t.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="card p-6 xl:col-span-2" aria-labelledby="sales-heading">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="sales-heading" className="flex items-center gap-2 text-base font-bold">
                <TrendingUp className="h-4 w-4 text-navy-600" aria-hidden /> Sales overview
              </h2>
              <p className="text-xs text-slate-500">Monthly revenue, last 6 months · sample data</p>
            </div>
          </div>
          <SalesChart data={stats.months} />
        </section>

        <section className="card p-6" aria-labelledby="lowstock-heading">
          <div className="flex items-center justify-between">
            <h2 id="lowstock-heading" className="text-base font-bold">
              Low-stock alerts
            </h2>
            <Link to="/admin/inventory" className="text-xs font-semibold text-navy-700 hover:underline">
              Manage
            </Link>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">All products are above their low-stock threshold.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {stats.lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <ProductImage src={p.images[0]} alt="" className="h-10 w-10 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy-900">{p.name}</p>
                    <p className="text-xs text-slate-500">Threshold: {p.lowStockThreshold}</p>
                  </div>
                  <StockBadge product={p} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card mt-6 overflow-hidden" aria-labelledby="recent-heading">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 id="recent-heading" className="text-base font-bold">
            Recent orders
          </h2>
          <Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Payment</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-3">
                    <Link to={`/admin/orders/${o.id}`} className="font-mono font-semibold text-navy-800 hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-navy-900">{o.customer.fullName}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-slate-500">{formatDate(o.createdAt)}</td>
                  <td className="px-6 py-3">
                    <PaymentBadge status={o.paymentStatus} />
                  </td>
                  <td className="px-6 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-6 py-3 text-right font-semibold tabular-nums">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
