import { useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { LayoutGrid, List, SlidersHorizontal, Store } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import InfiniteProductGrid, { PRODUCT_GRID } from '@/components/product/InfiniteProductGrid'
import { Breadcrumbs, EmptyState, ErrorState, SkeletonCard } from '@/components/ui'
import { useCatalog } from '@/context/StoreContext'
import { CategoryBubble, CategoryIcon, tint } from '@/components/marketplace'
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
  const { products, categories, loading, error, reload } = useCatalog()
  const department = categories.find((c) => c.id === slug)
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const sort = (params.get('sort') as SortKey) in SORTS ? (params.get('sort') as SortKey) : 'featured'
  const inStockOnly = params.get('stock') === 'in'

  const results = useMemo(() => {
    if (!department) return []
    const list = products.filter(
      (p) =>
        p.categoryId === department.id &&
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
  }, [products, department, sort, inStockOnly])

  // Categories load asynchronously; only redirect once we know the slug is genuinely unknown or hidden.
  if (loading && !department) return null
  if (!department) return <Navigate to="/products" replace />

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(window.location.search)
    if (value === null || value === '' || value === 'all' || (key === 'sort' && value === 'featured')) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const comingSoon = !loading && !products.some((p) => p.categoryId === department.id)
  const others = categories.filter((c) => c.id !== department.id && products.some((p) => p.categoryId === c.id)).slice(0, 4)

  return (
    <div className="bg-white">
      <div className="border-b border-slate-200" style={{ background: `linear-gradient(120deg, ${tint(department.color, 0.14)} 0%, ${tint(department.color, 0.03)} 60%, #fff 100%)` }}>
        <div className="container-page py-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/products' }, { label: department.name }]} />
          <div className="mt-4 flex items-center gap-4">
            <CategoryBubble category={department} size="lg" />
            <div>
              <h1 className="text-3xl font-extrabold sm:text-4xl">{department.name}</h1>
              <p className="mt-2 max-w-2xl text-slate-600">{department.description}</p>
            </div>
          </div>
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
              <span className="hidden whitespace-nowrap sm:inline">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => update('sort', e.target.value)}
                className="input h-9 min-w-0 border-0 sm:min-w-[10rem] bg-transparent py-1 pr-8 font-medium text-navy-900 shadow-none"
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
            <label className="inline-flex cursor-pointer items-center gap-2 self-end pb-2 text-sm font-medium text-navy-900">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => update('stock', e.target.checked ? 'in' : null)} className="h-4 w-4 rounded border-slate-300 accent-navy-900" />
              In stock only
            </label>
            {inStockOnly && (
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
            <div className={view === 'grid' ? PRODUCT_GRID : 'grid grid-cols-1 gap-6'}>
              {Array.from({ length: 10 }, (_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            comingSoon ? (
              <div className="overflow-hidden rounded-3xl border-2 border-dashed px-6 py-14 text-center" style={{ borderColor: tint(department.color, 0.4), backgroundColor: tint(department.color, 0.05) }}>
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: department.color }}>
                  <CategoryIcon category={department} className="h-8 w-8" />
                </span>
                <h2 className="mt-5 text-2xl font-extrabold">Sellers are onboarding</h2>
                <p className="mx-auto mt-2 max-w-md text-slate-600">
                  New {department.name} sellers are joining VIENTo. Check back soon, or list your own {department.name.toLowerCase()} products and reach customers across India.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link to={`/sell?category=${department.id}`} className="btn rounded-full text-white" style={{ backgroundColor: department.color }}>
                    <Store className="h-4 w-4" aria-hidden /> Sell {department.name} on VIENTo
                  </Link>
                  <Link to="/products" className="btn btn-outline rounded-full">
                    Shop all products
                  </Link>
                </div>
                {others.length > 0 && (
                  <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {others.map((c) => (
                      <Link key={c.id} to={`/collections/${c.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-slate-200 hover:ring-slate-300" style={{ color: c.color }}>
                        <CategoryIcon category={c} className="h-3.5 w-3.5" /> {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="card">
                <EmptyState
                  icon={<SlidersHorizontal className="h-8 w-8" />}
                  title="No products match these filters"
                  description="Try clearing the filters to see everything in this category."
                  action={
                    <button type="button" className="btn btn-primary" onClick={() => setParams({}, { replace: true })}>
                      Clear filters
                    </button>
                  }
                />
              </div>
            )
          ) : (
            <InfiniteProductGrid
              products={results}
              resetKey={`${department.id}|${sort}|${inStockOnly}`}
              className={view === 'list' ? '!grid-cols-1 gap-6 md:max-w-3xl' : undefined}
              render={(p) => <ProductCard key={p.id} product={p} showShopNow />}
            />
          )}
        </div>
      </div>
    </div>
  )
}
