import { useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { LayoutGrid, List, PackageSearch, SlidersHorizontal } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import { Breadcrumbs, EmptyState, ErrorState, SkeletonCard } from '@/components/ui'
import { useCatalog } from '@/context/StoreContext'
import { CATEGORIES, DEPARTMENTS } from '@/data/seed'
import { cn } from '@/lib/format'

const SORTS = {
  featured: 'Featured',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  'name-asc': 'Name: A to Z',
  'name-desc': 'Name: Z to A',
} as const
type SortKey = keyof typeof SORTS

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>()
  const department = DEPARTMENTS.find((d) => d.id === slug)
  const { products, loading, error, reload } = useCatalog()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const sort = (params.get('sort') as SortKey) in SORTS ? (params.get('sort') as SortKey) : 'featured'
  const inStockOnly = params.get('stock') === 'in'
  const subcategory = params.get('category') ?? 'all'

  const categoryOptions = useMemo(
    () => (department ? CATEGORIES.filter((c) => department.categoryIds.includes(c.id)) : []),
    [department],
  )

  const results = useMemo(() => {
    if (!department) return []
    const list = products.filter(
      (p) =>
        department.categoryIds.includes(p.categoryId) &&
        (subcategory === 'all' || p.categoryId === subcategory) &&
        (!inStockOnly || p.stock > 0),
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
  }, [products, department, subcategory, sort, inStockOnly])

  if (!department) return <Navigate to="/" replace />

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(window.location.search)
    if (value === null || value === '' || value === 'all' || (key === 'sort' && value === 'featured')) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const other = DEPARTMENTS.find((d) => d.id !== department.id)

  return (
    <div className="bg-white">
      <div className="border-b border-slate-200">
        <div className="container-page py-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: department.name }]} />
          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{department.name}</h1>
        </div>
      </div>

      <div className="container-page py-6">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4">
          <button type="button" className="btn btn-outline gap-2" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filter
          </button>

          <p className="text-sm text-slate-600" aria-live="polite">
            {loading ? '…' : `${results.length} product${results.length === 1 ? '' : 's'}`}
          </p>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span className="whitespace-nowrap">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => update('sort', e.target.value)}
                className="input h-9 min-w-[10rem] border-0 bg-transparent py-1 pr-8 font-medium text-navy-900 shadow-none"
                aria-label="Sort products"
              >
                {Object.entries(SORTS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-1" role="group" aria-label="View mode">
              <button
                type="button"
                className={cn('rounded-lg p-2 transition', view === 'list' ? 'bg-navy-900 text-white' : 'text-slate-500 hover:bg-slate-100')}
                aria-pressed={view === 'list'}
                aria-label="List view"
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                className={cn('rounded-lg p-2 transition', view === 'grid' ? 'bg-navy-900 text-white' : 'text-slate-500 hover:bg-slate-100')}
                aria-pressed={view === 'grid'}
                aria-label="Grid view"
                onClick={() => setView('grid')}
              >
                <LayoutGrid className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {filtersOpen && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {categoryOptions.length > 1 && (
              <div>
                <label htmlFor="collection-category" className="mb-1 block text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Category
                </label>
                <select id="collection-category" value={subcategory} onChange={(e) => update('category', e.target.value)} className="input pr-8">
                  <option value="all">All in {department.name}</option>
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 self-end pb-2 text-sm font-medium text-navy-900">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => update('stock', e.target.checked ? 'in' : null)} className="h-4 w-4 rounded border-slate-300 accent-navy-900" />
              In stock only
            </label>
            {(subcategory !== 'all' || inStockOnly) && (
              <button type="button" className="self-end pb-2 text-sm font-semibold text-navy-700 hover:text-navy-900" onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </button>
            )}
          </div>
        )}

        <div className="mt-8">
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading ? (
            <div className={cn('grid gap-6', view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1')}>
              {Array.from({ length: 8 }, (_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<PackageSearch className="h-8 w-8" />}
                title="No products in this collection"
                description="Try clearing filters or browse another collection."
                action={
                  other ? (
                    <Link to={`/collections/${other.id}`} className="btn btn-primary">
                      Browse {other.name}
                    </Link>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className={cn('grid gap-6', view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:max-w-3xl')}>
              {results.map((p) => (
                <ProductCard key={p.id} product={p} showShopNow />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
