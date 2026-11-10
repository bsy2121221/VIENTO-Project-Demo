import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import type { Product } from '@/types'
import { CATEGORIES } from '@/data/seed'
import { cn, formatPrice } from '@/lib/format'
import { ProductImage } from '@/components/ui'
import { useAddToCart } from './ProductCard'

/** Minimal, image-first product card used on the homepage: discount badge, hover image swap, full-width Add to cart. */
export default function ShopCard({ product, className }: { product: Product; className?: string }) {
  const addToCart = useAddToCart()
  const category = CATEGORIES.find((c) => c.id === product.categoryId)
  const out = product.stock <= 0
  const low = !out && product.stock <= product.lowStockThreshold
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0
  const hoverImage = product.images[1]

  return (
    <article className={cn('group flex flex-col', className)}>
      <Link to={`/products/${product.slug}`} className="relative block overflow-hidden rounded-2xl bg-slate-100" aria-label={`View ${product.name}`}>
        <ProductImage src={product.images[0]} alt={product.name} className={cn('aspect-square w-full transition duration-500', hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-[1.04]')} />
        {hoverImage && <img src={hoverImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" />}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {discount > 0 && <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white">-{discount}%</span>}
          {out && <span className="rounded-full bg-navy-900 px-2.5 py-1 text-[11px] font-bold text-white">Sold out</span>}
          {low && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ember-600 backdrop-blur">Only {product.stock} left</span>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{category?.name}</p>
        <h3 className="mt-1 line-clamp-2 text-[15px] leading-snug font-semibold">
          <Link to={`/products/${product.slug}`} className="hover:text-navy-600">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className={cn('text-lg font-extrabold', discount > 0 ? 'text-red-600' : 'text-navy-900')}>{formatPrice(product.price)}</span>
          {product.compareAtPrice && <span className="text-sm text-slate-400 line-through">{formatPrice(product.compareAtPrice)}</span>}
        </p>
        <div className="mt-auto pt-4">
          <button
            type="button"
            className="btn btn-outline w-full rounded-full border-navy-900 hover:bg-navy-900 hover:text-white disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
            onClick={() => addToCart(product)}
            disabled={out}
            aria-label={out ? `${product.name} is sold out` : `Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden /> {out ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
