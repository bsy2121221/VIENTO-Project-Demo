import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Minus, PackageX, Plus, Save } from 'lucide-react'
import { AdminPageHeader } from '@/components/layout/AdminLayout'
import { ErrorState, PageLoader, ProductImage, Spinner, StockBadge, stockLevel, type StockLevel } from '@/components/ui'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import type { Product } from '@/types'
import { cn } from '@/lib/format'

function StockEditor({ product }: { product: Product }) {
  const { updateProduct } = useStore()
  const toast = useToast()
  const [value, setValue] = useState(String(product.stock))
  const [busy, setBusy] = useState(false)
  const parsed = Number(value)
  const valid = value !== '' && Number.isInteger(parsed) && parsed >= 0 && parsed <= 99999
  const dirty = valid && parsed !== product.stock

  // Sync when stock changes elsewhere (e.g. an order is placed) and the field isn't being edited.
  const [lastSeen, setLastSeen] = useState(product.stock)
  if (product.stock !== lastSeen) {
    setLastSeen(product.stock)
    setValue(String(product.stock))
  }

  const save = async () => {
    if (!dirty) return
    setBusy(true)
    try {
      await updateProduct(product.id, { stock: parsed })
      toast.success('Stock updated', `${product.name}: ${parsed} units`)
    } catch (e) {
      toast.error('Update failed', e instanceof Error ? e.message : undefined)
    } finally {
      setBusy(false)
    }
  }

  const step = (d: number) => setValue(String(Math.max(0, (valid ? parsed : product.stock) + d)))

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
    >
      <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white">
        <button type="button" onClick={() => step(-1)} className="flex h-9 w-8 items-center justify-center text-slate-600 hover:bg-slate-50" aria-label={`Decrease stock for ${product.name}`}>
          <Minus className="h-3.5 w-3.5" />
        </button>
        <label htmlFor={`stock-${product.id}`} className="sr-only">
          Stock for {product.name}
        </label>
        <input
          id={`stock-${product.id}`}
          type="number"
          min={0}
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={!valid || undefined}
          className={cn('h-9 w-16 border-x border-slate-200 text-center text-sm font-semibold [appearance:textfield] focus:outline-none', !valid && 'bg-red-50 text-red-700')}
        />
        <button type="button" onClick={() => step(1)} className="flex h-9 w-8 items-center justify-center text-slate-600 hover:bg-slate-50" aria-label={`Increase stock for ${product.name}`}>
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <button type="submit" disabled={!dirty || busy} className={cn('btn btn-sm', dirty ? 'btn-primary' : 'btn-outline')}>
        {busy ? <Spinner className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" aria-hidden />} Save
      </button>
    </form>
  )
}

export default function InventoryPage() {
  const { products, loading, error, reload } = useStore()
  const [filter, setFilter] = useState<'all' | StockLevel>('all')

  const counts = useMemo(() => {
    const c = { in: 0, low: 0, out: 0 }
    products.forEach((p) => c[stockLevel(p)]++)
    return c
  }, [products])

  const list = useMemo(
    () =>
      products
        .filter((p) => filter === 'all' || stockLevel(p) === filter)
        .sort((a, b) => {
          const order = { out: 0, low: 1, in: 2 }
          return order[stockLevel(a)] - order[stockLevel(b)] || a.stock - b.stock
        }),
    [products, filter],
  )

  if (error) return <ErrorState message={error} onRetry={reload} />
  if (loading) return <PageLoader label="Loading inventory…" />

  const totalUnits = products.reduce((s, p) => s + p.stock, 0)
  const cards = [
    { key: 'all' as const, label: 'Total units', value: totalUnits, icon: CheckCircle2, tone: 'text-navy-700 bg-navy-50' },
    { key: 'in' as const, label: 'In stock', value: counts.in, icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-50' },
    { key: 'low' as const, label: 'Low stock', value: counts.low, icon: AlertTriangle, tone: 'text-amber-700 bg-amber-50' },
    { key: 'out' as const, label: 'Out of stock', value: counts.out, icon: PackageX, tone: 'text-slate-600 bg-slate-100' },
  ]

  return (
    <>
      <AdminPageHeader title="Inventory" description="Demo stock levels. Stock is reduced automatically when a customer places a demo order." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <button key={c.key} onClick={() => setFilter(c.key)} aria-pressed={filter === c.key} className={cn('card p-5 text-left transition hover:shadow-md', filter === c.key && 'ring-2 ring-navy-900')}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{c.label}</p>
              <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', c.tone)}>
                <c.icon className="h-[18px] w-[18px]" aria-hidden />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold tabular-nums text-navy-900">{c.value}</p>
            <p className="mt-1 text-xs text-slate-500">{c.key === 'all' ? `Across ${products.length} products` : 'Products · click to filter'}</p>
          </button>
        ))}
      </div>

      {counts.low + counts.out > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p>
            <strong>{counts.low + counts.out} product(s)</strong> are at or below their low-stock threshold. Out-of-stock items cannot be added to customer carts.
          </p>
        </div>
      )}

      <div className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Availability</th>
                <th className="px-5 py-3 text-right font-medium">Threshold</th>
                <th className="px-5 py-3 font-medium">Stock level</th>
                <th className="px-5 py-3 font-medium">Update stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((p) => {
                const pct = Math.min(100, (p.stock / Math.max(p.lowStockThreshold * 4, 1)) * 100)
                const level = stockLevel(p)
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <div className="flex min-w-56 items-center gap-3">
                        <ProductImage src={p.images[0]} alt="" className="h-10 w-10 shrink-0 rounded-lg" />
                        <div className="min-w-0">
                          <p className="font-semibold text-navy-900">{p.name}</p>
                          <p className="font-mono text-xs text-slate-500">
                            {p.sku}
                            {!p.isActive && ' · inactive'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <StockBadge product={p} />
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-600">{p.lowStockThreshold}</td>
                    <td className="px-5 py-3">
                      <div className="flex min-w-32 items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                          <div className={cn('h-full rounded-full', level === 'in' ? 'bg-emerald-500' : level === 'low' ? 'bg-amber-500' : 'bg-slate-300')} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-10 text-right font-semibold tabular-nums">{p.stock}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StockEditor product={p} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No products in this group.</p>}
      </div>
    </>
  )
}
