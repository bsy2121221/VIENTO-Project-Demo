import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import type { Product } from '@/types'
import { CATEGORIES } from '@/data/seed'
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

export default function ProductCard({ product }: { product: Product }) {
  const addToCart = useAddToCart()
  const category = CATEGORIES.find((c) => c.id === product.categoryId)
  const out = product.stock <= 0
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0

  return (
    <article className="group card relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-navy-900/[0.07]">
      <Link to={`/products/${product.slug}`} className="relative block overflow-hidden bg-slate-50" aria-label={`View ${product.name}`}>
        <ProductImage src={product.images[0]} alt={product.name} className="aspect-square w-full transition duration-500 group-hover:scale-[1.04]" />
        {discount > 0 && <span className="absolute top-3 left-3 rounded-md bg-navy-900 px-2 py-1 text-[11px] font-bold text-white">{discount}% OFF</span>}
        {out && <span className="absolute inset-0 flex items-center justify-center bg-white/55 text-sm font-semibold text-navy-900 backdrop-blur-[1px]">Out of stock</span>}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium tracking-wide text-gold-600 uppercase">{category?.name}</p>
        <h3 className="mt-1.5 line-clamp-2 text-[15px] leading-snug font-bold">
          <Link to={`/products/${product.slug}`} className="hover:text-navy-600">
            {product.name}
          </Link>
        </h3>
        <div className="mt-3">
          <StockBadge product={product} />
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Demo price</p>
            <p className="flex items-baseline gap-2">
              <span className="font-display text-xl font-extrabold text-navy-900">{formatPrice(product.price)}</span>
              {product.compareAtPrice && <span className="text-xs text-slate-400 line-through">{formatPrice(product.compareAtPrice)}</span>}
            </p>
          </div>
          <button className="btn btn-primary px-3.5" onClick={() => addToCart(product)} disabled={out} aria-label={`Add ${product.name} to cart`}>
            <ShoppingCart className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </article>
  )
}
