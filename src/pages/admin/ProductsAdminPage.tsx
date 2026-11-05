import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, PackagePlus, Pencil, Search, Trash2, PackageSearch } from 'lucide-react'
import { AdminPageHeader } from '@/components/layout/AdminLayout'
import ProductFormModal from '@/components/admin/ProductFormModal'
import { ConfirmDialog, EmptyState, ErrorState, PageLoader, ProductImage, StockBadge } from '@/components/ui'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { CATEGORIES } from '@/data/seed'
import type { Product, ProductInput } from '@/types'
import { cn, formatPrice } from '@/lib/format'

export function ActiveToggle({ product }: { product: Product }) {
  const { updateProduct } = useStore()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  return (
    <button
      role="switch"
      aria-checked={product.isActive}
      aria-label={`${product.name} ${product.isActive ? 'active' : 'inactive'}`}
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        try {
          await updateProduct(product.id, { isActive: !product.isActive })
          toast.success(product.isActive ? 'Product deactivated' : 'Product activated', product.isActive ? 'Hidden from the storefront.' : 'Now visible in the storefront.')
        } catch (e) {
          toast.error('Update failed', e instanceof Error ? e.message : undefined)
        } finally {
          setBusy(false)
        }
      }}
      className="inline-flex items-center gap-2 text-xs font-medium"
    >
      <span className={cn('relative inline-flex h-5 w-9 shrink-0 rounded-full transition', product.isActive ? 'bg-emerald-500' : 'bg-slate-300', busy && 'opacity-60')}>
        <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', product.isActive ? 'left-[18px]' : 'left-0.5')} />
      </span>
      <span className={product.isActive ? 'text-emerald-700' : 'text-slate-500'}>{product.isActive ? 'Active' : 'Inactive'}</span>
    </button>
  )
}

export default function ProductsAdminPage() {
  const { products, loading, error, reload, createProduct, updateProduct, deleteProduct } = useStore()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [editing, setEditing] = useState<Product | undefined>()
  const [formOpen, setFormOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase()
    return products.filter(
      (p) =>
        (category === 'all' || p.categoryId === category) &&
        (status === 'all' || (status === 'active' ? p.isActive : !p.isActive)) &&
        (!t || p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t)),
    )
  }, [products, query, category, status])

  if (error) return <ErrorState message={error} onRetry={reload} />
  if (loading) return <PageLoader label="Loading products…" />

  const openNew = () => {
    setEditing(undefined)
    setFormOpen(true)
  }

  const handleSubmit = async (input: ProductInput) => {
    try {
      if (editing) {
        await updateProduct(editing.id, input)
        toast.success('Product updated', input.name)
      } else {
        await createProduct(input)
        toast.success('Product created', `${input.name} is ${input.isActive ? 'now live in the store' : 'saved as inactive'}.`)
      }
      setFormOpen(false)
    } catch (e) {
      toast.error('Could not save product', e instanceof Error ? e.message : undefined)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Products"
        description={`${products.length} products · changes appear on the storefront immediately`}
        actions={
          <button className="btn btn-primary" onClick={openNew}>
            <PackagePlus className="h-4 w-4" aria-hidden /> Add product
          </button>
        }
      />

      <div className="card mb-4 flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <label htmlFor="admin-product-search" className="sr-only">
            Search products
          </label>
          <input id="admin-product-search" type="search" className="input pl-9" placeholder="Search by name or SKU" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <label htmlFor="admin-category" className="sr-only">
          Category
        </label>
        <select id="admin-category" className="input sm:w-48" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label htmlFor="admin-status" className="sr-only">
          Status
        </label>
        <select id="admin-status" className="input sm:w-40" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<PackageSearch className="h-8 w-8" />}
            title={products.length ? 'No products match' : 'No products yet'}
            description={products.length ? 'Try a different search or filter.' : 'Add your first product to start selling.'}
            action={
              <button className="btn btn-primary" onClick={openNew}>
                Add product
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 text-right font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className={cn('hover:bg-slate-50/70', !p.isActive && 'bg-slate-50/50')}>
                    <td className="px-5 py-3">
                      <div className="flex min-w-64 items-center gap-3">
                        <ProductImage src={p.images[0]} alt="" className={cn('h-12 w-12 shrink-0 rounded-lg', !p.isActive && 'opacity-50')} />
                        <div className="min-w-0">
                          <p className="font-semibold text-navy-900">{p.name}</p>
                          <p className="font-mono text-xs text-slate-500">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-600">{CATEGORIES.find((c) => c.id === p.categoryId)?.name}</td>
                    <td className="px-5 py-3 text-right font-semibold whitespace-nowrap tabular-nums text-navy-900">{formatPrice(p.price)}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="mr-2 font-semibold tabular-nums">{p.stock}</span>
                      <StockBadge product={p} />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <ActiveToggle product={p} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        {p.isActive && (
                          <Link to={`/products/${p.slug}`} target="_blank" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy-900" aria-label={`View ${p.name} in store`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                        <button
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy-900"
                          onClick={() => {
                            setEditing(p)
                            setFormOpen(true)
                          }}
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" onClick={() => setToDelete(p)} aria-label={`Delete ${p.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductFormModal open={formOpen} product={editing} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete product?"
        message={
          <>
            <strong className="text-navy-900">{toDelete?.name}</strong> will be permanently removed from the catalogue and storefront. Existing orders keep their item details. This cannot be undone.
          </>
        }
        confirmLabel="Delete product"
        danger
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return
          setDeleting(true)
          try {
            await deleteProduct(toDelete.id)
            toast.success('Product deleted', toDelete.name)
            setToDelete(null)
          } catch (e) {
            toast.error('Delete failed', e instanceof Error ? e.message : undefined)
          } finally {
            setDeleting(false)
          }
        }}
      />
    </>
  )
}
