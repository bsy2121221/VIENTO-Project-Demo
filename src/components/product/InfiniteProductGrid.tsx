import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Product } from '@/types'
import { SkeletonCard } from '@/components/ui'
import { cn } from '@/lib/format'

/** Responsive product grid: 2 columns on phones, growing with the viewport. */
export const PRODUCT_GRID = 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'

/**
 * Shows `pageSize` items, then reveals the next page whenever the sentinel below the grid
 * scrolls into view — the "load more as you scroll" pattern used by real marketplaces.
 * Resets to the first page whenever `resetKey` changes (filters, sort, category).
 */
export function useInfiniteList<T>(items: T[], pageSize: number, resetKey: string) {
  const [count, setCount] = useState(pageSize)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)
  const hasMore = count < items.length

  useEffect(() => setCount(pageSize), [resetKey, pageSize])

  useEffect(() => {
    const el = sentinel.current
    if (!el || !hasMore) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || timer) return
        setLoadingMore(true)
        // Short delay mimics a network page fetch so shoppers see the loader.
        timer = setTimeout(() => {
          setCount((c) => c + pageSize)
          setLoadingMore(false)
          timer = undefined
        }, 450)
      },
      { rootMargin: '300px 0px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (timer) clearTimeout(timer)
      setLoadingMore(false)
    }
  }, [hasMore, pageSize, count])

  return { visible: items.slice(0, count), hasMore, loadingMore, sentinel }
}

export default function InfiniteProductGrid({
  products,
  render,
  resetKey = '',
  pageSize = 10,
  className,
  skeleton = <SkeletonCard />,
}: {
  products: Product[]
  render: (p: Product) => React.ReactNode
  resetKey?: string
  pageSize?: number
  className?: string
  skeleton?: React.ReactNode
}) {
  const { visible, hasMore, loadingMore, sentinel } = useInfiniteList(products, pageSize, resetKey)

  return (
    <>
      <div className={cn(PRODUCT_GRID, className)}>
        {visible.map(render)}
        {loadingMore && Array.from({ length: 2 }, (_, i) => <div key={`sk-${i}`}>{skeleton}</div>)}
      </div>
      {hasMore ? (
        <div ref={sentinel} className="flex items-center justify-center gap-2 py-8 text-sm font-medium text-slate-500" aria-live="polite">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading more products…
        </div>
      ) : (
        products.length > pageSize && <p className="py-8 text-center text-sm text-slate-400">You've seen all {products.length} products</p>
      )}
    </>
  )
}
