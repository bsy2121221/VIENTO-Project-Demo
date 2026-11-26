import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingCart } from 'lucide-react'
import type { Product } from '@/types'
import { CategoryLabel } from '@/components/marketplace'
import { useLookups } from '@/context/StoreContext'
import { formatPrice } from '@/lib/format'
import { ProductImage, StockBadge } from '@/components/ui'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'

export function useAddToCart() {
  const cart = useCart()
  const toast = useToast()
  return (product: Product, quantity = 1) => {
    const result = cart.add(product, quantity)
    if (result.ok) toast.success('Added to cart', `${quantity} × ${product.name}`)
    else toast.error('Could not add to cart', result.message)
    return result.ok
  }
}

/** `showShopNow` adds a full-width "Shop Now" link to the product page below the price row. */
export default function ProductCard({ product, showShopNow = false }: { product: Product; showShopNow?: boolean }) {
  const addToCart = useAddToCart()
  const lookups = useLookups()
  const category = lookups.category(product.categoryId)
  const out = product.stock <= 0
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0

  return (
    <article className="group card relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-navy-900/[0.07]">
      <Link to={`/products/${product.slug}`} className="relative block overflow-hidden bg-slate-50" aria-label={`View ${product.name}`}>
        <ProductImage src={product.images[0]} alt={product.name} className="aspect-square w-full transition duration-500 group-hover:scale-[1.04]" />
        {discount > 0 && <span className="absolute top-2 left-2 rounded-md bg-navy-900 px-1.5 py-0.5 text-[10px] sm:top-3 sm:left-3 sm:px-2 sm:py-1 sm:text-[11px] font-bold text-white">{discount}% OFF</span>}
        {out && <span className="absolute inset-0 flex items-center justify-center bg-white/55 text-sm font-semibold text-navy-900 backdrop-blur-[1px]">Out of stock</span>}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-5">
        <CategoryLabel category={category} />
        <h3 className="mt-1 line-clamp-2 text-[13px] leading-snug font-bold sm:mt-1.5 sm:text-[15px]">
          <Link to={`/products/${product.slug}`} className="hover:text-navy-600">
            {product.name}
          </Link>
        </h3>
        <div className="mt-2 hidden sm:mt-3 sm:block">
          <StockBadge product={product} />
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3 sm:gap-3 sm:pt-5">
          <div>
            <p className="hidden text-[10px] font-semibold tracking-wider text-slate-400 uppercase sm:block">Demo price</p>
            <p className="flex flex-wrap items-baseline gap-x-1.5 sm:gap-x-2">
              <span className="font-display text-base font-extrabold sm:text-xl text-navy-900">{formatPrice(product.price)}</span>
              {product.compareAtPrice && <span className="text-xs text-slate-400 line-through">{formatPrice(product.compareAtPrice)}</span>}
            </p>
          </div>
          <button className="btn btn-primary w-full px-3 py-2 sm:w-auto sm:px-3.5 sm:py-2.5" onClick={() => addToCart(product)} disabled={out} aria-label={`Add ${product.name} to cart`}>
            <ShoppingCart className="h-4 w-4" aria-hidden />
            <span>Add</span>
          </button>
        </div>
        {showShopNow && (
          <Link to={`/products/${product.slug}`} className="btn btn-outline group/shop mt-2 w-full px-3 py-2 sm:mt-4 sm:py-2.5" aria-label={`Shop now: ${product.name}`}>
            Shop Now <ArrowRight className="h-4 w-4 transition group-hover/shop:translate-x-1" aria-hidden />
          </Link>
        )}
      </div>
    </article>
  )
}
