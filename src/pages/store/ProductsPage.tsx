import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PackageSearch, Search, X } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import { Breadcrumbs, EmptyState, ErrorState, SkeletonCard } from '@/components/ui'
import { useCatalog } from '@/context/StoreContext'
import { CATEGORIES } from '@/data/seed'
import { cn } from '@/lib/format'

const SORTS = {
  featured: 'Featured',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  'name-asc': 'Name: A to Z',
  'name-desc': 'Name: Z to A',
} as const
type SortKey = keyof typeof SORTS

export default function ProductsPage() {
  const { products, loading, error, reload } = useCatalog()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const category = params.get('category') ?? 'all'
  const sort = (params.get('sort') as SortKey) in SORTS ? (params.get('sort') as SortKey) : 'featured'
  const inStockOnly = params.get('stock') === 'in'
  // Local state keeps typing responsive; the URL is updated after a short pause.
  const [search, setSearch] = useState(q)
  useEffect(() => {
    setSearch(q)
  }, [q])

  // Read the live URL rather than `params`: React Router's updater callback is not queued,
  // so a debounced search update could otherwise overwrite a newer sort or filter change.
  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(window.location.search)
    if (value === null || value === '' || value === 'all' || (key === 'sort' && value === 'featured')) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  useEffect(() => {
    if (search === q) return
    const t = setTimeout(() => update('q', search), 200)
    return () => clearTimeout(t)
  }, [search])

  const results = useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = products.filter(
      (p) =>
        (category === 'all' || p.categoryId === category) &&
        (!inStockOnly || p.stock > 0) &&
        (!term || p.name.toLowerCase().includes(term) || p.shortDescription.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)),
    )
    const sorted = [...list]
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
    }
    return sorted
  }, [products, search, category, sort, inStockOnly])

  const activeCategory = CATEGORIES.find((c) => c.id === category)
  const hasFilters = search || category !== 'all' || inStockOnly

  return (
    <div className="bg-slate-50/60">
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page py-10">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop' }]} />
          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{activeCategory?.name ?? 'All products'}</h1>
          <p className="mt-2 max-w-2xl text-slate-600">{activeCategory?.description ?? 'Sealing machines, spare parts and accessories for every packing need. All prices and stock levels shown are demo values.'}</p>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Toolbar */}
        <div className="card flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <label htmlFor="product-search" className="sr-only">
              Search products by name
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input id="product-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products by name or SKU" className="input pl-10" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <div>
              <label htmlFor="category-filter" className="sr-only">
                Filter by category
              </label>
              <select id="category-filter" value={category} onChange={(e) => update('category', e.target.value)} className="input pr-8">
                <option value="all">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sort" className="sr-only">
                Sort products
              </label>
              <select id="sort" value={sort} onChange={(e) => update('sort', e.target.value)} className="input pr-8">
                {Object.entries(SORTS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <label className="col-span-2 inline-flex cursor-pointer items-center gap-2 text-sm font-medium whitespace-nowrap text-navy-900 sm:col-span-1 sm:pl-2">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => update('stock', e.target.checked ? 'in' : null)} className="h-4 w-4 rounded border-slate-300 accent-navy-900" />
              In stock only
            </label>
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Quick category filter">
          {[{ id: 'all', name: 'All' }, ...CATEGORIES].map((c) => (
            <button
              key={c.id}
              onClick={() => update('category', c.id)}
              aria-pressed={category === c.id}
              className={cn('rounded-full border px-4 py-1.5 text-sm font-medium transition', category === c.id ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-navy-400')}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <p aria-live="polite">{loading ? 'Loading products…' : `${results.length} product${results.length === 1 ? '' : 's'} found`}</p>
          {hasFilters && (
            <button onClick={() => setParams({}, { replace: true })} className="inline-flex items-center gap-1 font-semibold text-navy-700 hover:text-navy-900">
              <X className="h-4 w-4" aria-hidden /> Clear filters
            </button>
          )}
        </div>

        <div className="mt-4">
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<PackageSearch className="h-8 w-8" />}
                title="No products match your search"
                description="Try a different keyword, choose another category or clear the filters."
                action={
                  <button className="btn btn-primary" onClick={() => setParams({}, { replace: true })}>
                    Clear filters
                  </button>
                }
              />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
