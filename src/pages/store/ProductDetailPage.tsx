import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BadgeCheck, CheckCircle2, Info, PackageX, ShoppingCart, Truck, Zap } from 'lucide-react'
import ProductCard, { useAddToCart } from '@/components/product/ProductCard'
import { Breadcrumbs, EmptyState, ErrorState, PageLoader, ProductImage, QuantitySelector, StockBadge } from '@/components/ui'
import { useCatalog } from '@/context/StoreContext'
import { useCart } from '@/context/CartContext'
import { CATEGORIES } from '@/data/seed'
import { cn, formatPrice } from '@/lib/format'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { products, loading, error, reload } = useCatalog()
  const { quantityOf } = useCart()
  const addToCart = useAddToCart()
  const navigate = useNavigate()
  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<'description' | 'specs'>('description')

  const product = products.find((p) => p.slug === slug)
  useEffect(() => {
    setActiveImage(0)
    setQty(1)
  }, [slug])

  if (error) return <ErrorState message={error} onRetry={reload} />
  if (loading) return <PageLoader label="Loading product…" />
  if (!product)
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<PackageX className="h-8 w-8" />}
          title="Product not found"
          description="This product may have been removed or is currently unavailable."
          action={
            <Link to="/products" className="btn btn-primary">
              Browse all products
            </Link>
          }
        />
      </div>
    )

  const category = CATEGORIES.find((c) => c.id === product.categoryId)
  const inCart = quantityOf(product.id)
  const maxAddable = Math.max(0, product.stock - inCart)
  const out = product.stock <= 0
  const related = products.filter((p) => p.id !== product.id && (p.categoryId === product.categoryId || p.isFeatured)).slice(0, 4)
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0
  const safeQty = Math.min(qty, Math.max(1, maxAddable))

  const handleAdd = (goToCheckout: boolean) => {
    const ok = addToCart(product, safeQty)
    if (ok) {
      setQty(1)
      if (goToCheckout) navigate('/checkout')
    }
  }

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/products' }, { label: category?.name ?? 'Products', to: `/products?category=${product.categoryId}` }, { label: product.name }]} />

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="card overflow-hidden bg-slate-50">
            <ProductImage src={product.images[activeImage]} alt={`${product.name}, image ${activeImage + 1}`} className="aspect-square w-full" />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3" role="group" aria-label="Product images">
              {product.images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={i === activeImage}
                  className={cn('overflow-hidden rounded-xl border-2 bg-slate-50 transition', i === activeImage ? 'border-navy-900' : 'border-transparent opacity-70 hover:opacity-100')}
                >
                  <ProductImage src={src} alt="" className="aspect-square w-full" />
                </button>
              ))}
            </div>
          )}
          {product.imageNote && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <Info className="h-3.5 w-3.5" aria-hidden /> {product.imageNote}
            </p>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="eyebrow">{category?.name}</p>
          <h1 className="mt-2 text-3xl leading-tight font-extrabold sm:text-4xl">{product.name}</h1>
          <p className="mt-2 text-sm text-slate-500">SKU: {product.sku}</p>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">{product.shortDescription}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="font-display text-4xl font-extrabold text-navy-900">{formatPrice(product.price)}</span>
            {product.compareAtPrice && <span className="text-lg text-slate-400 line-through">{formatPrice(product.compareAtPrice)}</span>}
            {discount > 0 && <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Save {discount}%</span>}
            <span className="demo-badge">Demo price</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Inclusive of all taxes. Sample pricing for presentation only.</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StockBadge product={product} showCount />
            {inCart > 0 && <span className="text-sm text-slate-600">{inCart} already in your cart</span>}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-8">
            {!out && maxAddable > 0 && <QuantitySelector value={safeQty} max={maxAddable} onChange={setQty} />}
            <button className="btn btn-primary btn-lg flex-1 sm:flex-none" onClick={() => handleAdd(false)} disabled={out || maxAddable === 0}>
              <ShoppingCart className="h-5 w-5" aria-hidden /> Add to Cart
            </button>
            <button className="btn btn-gold btn-lg flex-1 sm:flex-none" onClick={() => handleAdd(true)} disabled={out || maxAddable === 0}>
              <Zap className="h-5 w-5" aria-hidden /> Buy Now
            </button>
          </div>
          {out && <p className="mt-3 text-sm font-medium text-slate-600">This product is out of demo stock. An admin can restock it from the dashboard.</p>}
          {!out && maxAddable === 0 && (
            <p className="mt-3 text-sm font-medium text-amber-700">
              All available demo stock is already in your cart. <Link to="/cart" className="underline">View cart</Link>
            </p>
          )}

          <ul className="mt-8 space-y-3">
            {product.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden /> {f}
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <Truck className="h-5 w-5 text-navy-700" aria-hidden />
              <p className="text-sm">
                <span className="font-semibold text-navy-900">Dispatch in 24 hours</span>
                <br />
                <span className="text-slate-500">Delivery in 3–5 business days</span>
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <BadgeCheck className="h-5 w-5 text-navy-700" aria-hidden />
              <p className="text-sm">
                <span className="font-semibold text-navy-900">Genuine VIENTo</span>
                <br />
                <span className="text-slate-500">Manufacturer guarantee</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <section className="mt-16">
        <div className="flex gap-8 border-b border-slate-200" role="tablist" aria-label="Product information">
          {(['description', 'specs'] as const).map((t) => (
            <button
              key={t}
              role="tab"
              id={`tab-${t}`}
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              onClick={() => setTab(t)}
              className={cn('-mb-px border-b-2 pb-3 text-sm font-semibold transition', tab === t ? 'border-gold-400 text-navy-900' : 'border-transparent text-slate-500 hover:text-navy-900')}
            >
              {t === 'description' ? 'Description' : 'Specifications'}
            </button>
          ))}
        </div>
        <div className="py-8" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'description' ? (
            <p className="max-w-3xl leading-relaxed text-slate-700">{product.description}</p>
          ) : (
            <dl className="card max-w-3xl divide-y divide-slate-100 overflow-hidden">
              {product.specs.map((s) => (
                <div key={s.label} className="grid grid-cols-2 gap-4 px-6 py-3.5 text-sm odd:bg-slate-50/60">
                  <dt className="font-medium text-slate-500">{s.label}</dt>
                  <dd className="font-semibold text-navy-900">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-8" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-2xl font-extrabold">
            Related products
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
