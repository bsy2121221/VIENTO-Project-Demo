import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import type { Product } from '@/types'
import { CategoryLabel } from '@/components/marketplace'
import { useLookups } from '@/context/StoreContext'
import { cn, formatPrice } from '@/lib/format'
import { ProductImage } from '@/components/ui'
import { useAddToCart } from './ProductCard'

/** Minimal, image-first product card used on the homepage: discount badge, hover image swap, full-width Add to cart. */
export default function ShopCard({ product, className }: { product: Product; className?: string }) {
  const addToCart = useAddToCart()
  const lookups = useLookups()
  const category = lookups.category(product.categoryId)
  const out = product.stock <= 0
  const low = !out && product.stock <= product.lowStockThreshold
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0
  const hoverImage = product.images[1]

  return (
    <article className={cn('group flex min-w-0 flex-col', className)}>
      <Link to={`/products/${product.slug}`} className="relative block overflow-hidden rounded-xl bg-slate-100 sm:rounded-2xl" aria-label={`View ${product.name}`}>
        <ProductImage src={product.images[0]} alt={product.name} className={cn('aspect-square w-full transition duration-500', hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-[1.04]')} />
        {hoverImage && <img src={hoverImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" />}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1 sm:top-3 sm:left-3 sm:gap-1.5">
          {discount > 0 && <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px] font-bold text-white">-{discount}%</span>}
          {out && <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px] font-bold text-white">Sold out</span>}
          {low && <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px] font-bold text-ember-600 backdrop-blur">Only {product.stock} left</span>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col pt-2.5 sm:pt-4">
        <CategoryLabel category={category} />
        <h3 className="mt-1 line-clamp-2 text-[13px] leading-snug font-semibold sm:text-[15px]">
          <Link to={`/products/${product.slug}`} className="hover:text-navy-600">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className={cn('text-base font-extrabold sm:text-lg', discount > 0 ? 'text-red-600' : 'text-navy-900')}>{formatPrice(product.price)}</span>
          {product.compareAtPrice && <span className="text-xs text-slate-400 line-through sm:text-sm">{formatPrice(product.compareAtPrice)}</span>}
        </p>
        <div className="mt-auto pt-3 sm:pt-4">
          <button
            type="button"
            className="btn btn-outline w-full rounded-full px-2 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm border-navy-900 hover:bg-navy-900 hover:text-white disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
            onClick={() => addToCart(product)}
            disabled={out}
            aria-label={out ? `${product.name} is sold out` : `Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden /> {out ? 'Sold out' : <><span className="sm:hidden">Add</span><span className="hidden sm:inline">Add to cart</span></>}
          </button>
        </div>
      </div>
    </article>
  )
}
