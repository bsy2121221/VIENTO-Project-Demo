import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Ban, CheckCircle2, ExternalLink, Eye, RotateCcw, Search, Store, XCircle } from 'lucide-react'
import { AdminPageHeader } from '@/components/layout/AdminLayout'
import { SELLER_STATUS_LABELS, SellerAvatar, SellerStatusBadge } from '@/components/marketplace'
import { EmptyState, ErrorState, Field, Modal, PageLoader, Spinner } from '@/components/ui'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { cn, formatDate, formatPrice } from '@/lib/format'
import { SELLER_STATUSES, type Seller, type SellerStatus } from '@/types'

type Filter = 'all' | SellerStatus

interface SellerStats {
  products: number
  liveProducts: number
  units: number
  sales: number
  commission: number
}

/** Per-seller totals from order lines. Lines from orders placed before sellers existed have no seller and are skipped. */
function useSellerStats() {
  const { sellers, products, orders } = useStore()
  return useMemo(() => {
    const stats = new Map<string, SellerStats>()
    for (const s of sellers) stats.set(s.id, { products: 0, liveProducts: 0, units: 0, sales: 0, commission: 0 })
    for (const p of products) {
      const st = stats.get(p.sellerId)
      if (!st) continue
      st.products++
      if (p.isActive) st.liveProducts++
    }
    for (const o of orders)
      for (const line of o.items) {
        const st = line.sellerId ? stats.get(line.sellerId) : undefined
        if (!st) continue
        const seller = sellers.find((s) => s.id === line.sellerId)!
        const amount = line.unitPrice * line.quantity
        st.units += line.quantity
        st.sales += amount
        st.commission += Math.round((amount * seller.commissionRate) / 100)
      }
    return stats
  }, [sellers, products, orders])
}

export default function SellersAdminPage() {
  const { sellers, categories, loading, error, reload } = useStore()
  const stats = useSellerStats()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: sellers.length, pending: 0, approved: 0, rejected: 0, suspended: 0 }
    for (const s of sellers) c[s.status]++
    return c
  }, [sellers])

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase()
    return sellers
      .filter((s) => (filter === 'all' || s.status === filter) && (!t || [s.shopName, s.ownerName, s.email, s.city, s.state].some((v) => v.toLowerCase().includes(t))))
      // Pending applications first, newest first within each status.
      .sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending') || b.createdAt.localeCompare(a.createdAt))
  }, [sellers, filter, query])

  if (error) return <ErrorState message={error} onRetry={reload} />
  if (loading) return <PageLoader label="Loading sellers…" />

  const open = sellers.find((s) => s.id === openId)

  return (
    <>
      <AdminPageHeader
        title="Sellers"
        description={`${counts.approved} active seller${counts.approved === 1 ? '' : 's'} · ${counts.pending} application${counts.pending === 1 ? '' : 's'} waiting for review`}
        actions={
          <Link to="/sell" target="_blank" className="btn btn-outline">
            <ExternalLink className="h-4 w-4" aria-hidden /> Seller sign-up page
          </Link>
        }
      />

      <div className="card mb-4 flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="no-scrollbar flex gap-1 overflow-x-auto" role="group" aria-label="Filter by status">
          {(['all', ...SELLER_STATUSES] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn('shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition', filter === f ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100')}
            >
              {f === 'all' ? 'All' : SELLER_STATUS_LABELS[f]}
              <span className={cn('ml-1.5 rounded-full px-1.5 py-0.5 text-[11px]', filter === f ? 'bg-white/20' : f === 'pending' && counts.pending ? 'bg-amber-100 text-amber-800' : 'bg-slate-100')}>{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="relative lg:ml-auto lg:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <label htmlFor="seller-search" className="sr-only">
            Search sellers
          </label>
          <input id="seller-search" type="search" className="input pl-9" placeholder="Search shop, owner, email, city" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<Store className="h-8 w-8" />} title="No sellers here" description={filter === 'pending' ? 'There are no applications waiting for review.' : 'Try another filter or search.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Shop</th>
                  <th className="px-5 py-3 font-medium">Categories</th>
                  <th className="px-5 py-3 text-right font-medium">Products</th>
                  <th className="px-5 py-3 text-right font-medium">Sales</th>
                  <th className="px-5 py-3 text-right font-medium">Commission</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const st = stats.get(s.id)
                  return (
                    <tr key={s.id} className={cn('hover:bg-slate-50/70', s.status === 'pending' && 'bg-amber-50/40')}>
                      <td className="px-5 py-3">
                        <div className="flex min-w-64 items-center gap-3">
                          <SellerAvatar seller={s} size="sm" />
                          <div className="min-w-0">
                            <p className="flex items-center gap-1 font-semibold text-navy-900">
                              {s.shopName}
                              {s.isOfficial && <BadgeCheck className="h-4 w-4 text-sky-600" aria-label="Official store" />}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {s.ownerName} · {s.city}, {s.state}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex max-w-56 flex-wrap gap-1">
                          {s.categoryIds.map((id) => {
                            const c = categories.find((x) => x.id === id)
                            return c ? (
                              <span key={id} className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: `${c.color}1a`, color: c.color }}>
                                {c.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap tabular-nums">
                        <span className="font-semibold text-navy-900">{st?.liveProducts ?? 0}</span>
                        <span className="text-slate-400"> / {st?.products ?? 0}</span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold whitespace-nowrap tabular-nums text-navy-900">{formatPrice(st?.sales ?? 0)}</td>
                      <td className="px-5 py-3 text-right whitespace-nowrap tabular-nums">
                        <span className="font-semibold text-navy-900">{s.commissionRate}%</span>
                        {(st?.commission ?? 0) > 0 && <span className="block text-xs text-emerald-700">{formatPrice(st!.commission)} earned</span>}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <SellerStatusBadge status={s.status} />
                        <p className="mt-1 text-xs text-slate-400">Applied {formatDate(s.createdAt)}</p>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button type="button" className={cn('btn btn-sm', s.status === 'pending' ? 'btn-primary' : 'btn-outline')} onClick={() => setOpenId(s.id)}>
                          <Eye className="h-4 w-4" aria-hidden /> {s.status === 'pending' ? 'Review' : 'Manage'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SellerModal seller={open} stats={open ? stats.get(open.id) : undefined} onClose={() => setOpenId(null)} />
    </>
  )
}

function SellerModal({ seller, stats, onClose }: { seller?: Seller; stats?: SellerStats; onClose: () => void }) {
  const { updateSeller, categories } = useStore()
  const toast = useToast()
  const [commission, setCommission] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    if (seller) {
      setCommission(String(seller.commissionRate))
      setNote(seller.note ?? '')
    }
  }, [seller])

  if (!seller) return null

  const commissionValue = Number(commission)
  const commissionError = commission === '' || !Number.isFinite(commissionValue) || commissionValue < 0 || commissionValue > 50 ? 'Enter a value from 0 to 50.' : undefined

  const act = async (key: string, patch: Parameters<typeof updateSeller>[1], message: [string, string]) => {
    if (commissionError) return
    setBusy(key)
    try {
      await updateSeller(seller.id, { commissionRate: commissionValue, note: note.trim() || undefined, ...patch })
      toast.success(...message)
      onClose()
    } catch (e) {
      toast.error('Could not update seller', e instanceof Error ? e.message : undefined)
    } finally {
      setBusy(null)
    }
  }

  const button = (key: string, label: string, Icon: typeof CheckCircle2, className: string, patch: Parameters<typeof updateSeller>[1], message: [string, string]) => (
    <button type="button" className={cn('btn', className)} disabled={!!busy || !!commissionError} onClick={() => act(key, patch, message)}>
      {busy === key ? <Spinner className="h-4 w-4" /> : <Icon className="h-4 w-4" aria-hidden />} {label}
    </button>
  )

  const footer = (
    <div className="flex flex-wrap justify-end gap-2">
      {seller.status === 'pending' && (
        <>
          {button('reject', 'Reject', XCircle, 'btn-outline text-red-600', { status: 'rejected' }, ['Application rejected', seller.shopName])}
          {button('approve', 'Approve seller', CheckCircle2, 'bg-emerald-600 text-white hover:bg-emerald-700', { status: 'approved' }, ['Seller approved', `${seller.shopName} can now sell on VIENTo.`])}
        </>
      )}
      {seller.status === 'approved' && !seller.isOfficial && button('suspend', 'Suspend', Ban, 'btn-outline text-red-600', { status: 'suspended' }, ['Seller suspended', 'Their products are hidden from the storefront.'])}
      {(seller.status === 'suspended' || seller.status === 'rejected') &&
        button('approve', seller.status === 'suspended' ? 'Reactivate' : 'Approve', RotateCcw, 'bg-emerald-600 text-white hover:bg-emerald-700', { status: 'approved' }, ['Seller approved', `${seller.shopName} can now sell on VIENTo.`])}
      {button('save', 'Save changes', CheckCircle2, 'btn-primary', {}, ['Seller updated', seller.shopName])}
    </div>
  )

  const row = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-3 gap-3 py-2 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="col-span-2 font-medium break-words text-navy-900">{value}</dd>
    </div>
  )

  return (
    <Modal open onClose={onClose} title={seller.status === 'pending' ? 'Review seller application' : 'Manage seller'} footer={footer} size="lg">
      <div className="flex items-center gap-4">
        <SellerAvatar seller={seller} size="lg" />
        <div className="min-w-0">
          <p className="text-lg font-extrabold text-navy-900">{seller.shopName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <SellerStatusBadge status={seller.status} />
            {seller.status === 'approved' && (
              <Link to={`/sellers/${seller.slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:underline">
                View shop <ExternalLink className="h-3 w-3" aria-hidden />
              </Link>
            )}
          </div>
        </div>
      </div>

      {stats && (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            ['Live products', String(stats.liveProducts)],
            ['Sales', formatPrice(stats.sales)],
            ['Commission earned', formatPrice(stats.commission)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{k}</p>
              <p className="mt-0.5 font-extrabold text-navy-900 tabular-nums">{v}</p>
            </div>
          ))}
        </div>
      )}

      <dl className="mt-5 divide-y divide-slate-100">
        {row('Owner', seller.ownerName)}
        {row('Email', seller.email)}
        {row('Mobile', seller.phone)}
        {row('Location', `${seller.city}, ${seller.state}`)}
        {row('GSTIN', seller.gstin ?? <span className="text-amber-700">Not provided yet</span>)}
        {row(
          'Categories',
          <span className="flex flex-wrap gap-1">
            {seller.categoryIds.map((id) => {
              const c = categories.find((x) => x.id === id)
              return c ? (
                <span key={id} className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: `${c.color}1a`, color: c.color }}>
                  {c.name}
                </span>
              ) : null
            })}
          </span>,
        )}
        {row('About', seller.description)}
        {row('Applied', formatDate(seller.createdAt))}
      </dl>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Field label="Commission (%)" htmlFor="seller-commission" error={commissionError}>
          <input id="seller-commission" type="number" min={0} max={50} step={0.5} className="input" value={commission} onChange={(e) => setCommission(e.target.value)} aria-invalid={commissionError ? true : undefined} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Internal note (optional)" htmlFor="seller-note" hint="Only visible to admins, e.g. the reason for rejection.">
            <input id="seller-note" className="input" value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
      </div>
      {seller.isOfficial && <p className="mt-4 text-xs text-slate-500">This is the platform's own store. It cannot be suspended.</p>}
    </Modal>
  )
}
