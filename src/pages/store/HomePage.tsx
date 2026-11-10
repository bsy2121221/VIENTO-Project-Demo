import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, CookingPot, Quote, Star } from 'lucide-react'
import ShopCard from '@/components/product/ShopCard'
import HeroBanner from '@/components/home/HeroBanner'
import { PowerToolsBanner, PromiseSection, PromoBanners, SeeAllButton, SupportSection, TrustBar } from '@/components/home/HomeSections'
import { ErrorState } from '@/components/ui'
import { useCatalog } from '@/context/StoreContext'
import { DEMO_TESTIMONIALS, DEPARTMENTS } from '@/data/seed'
import { cn } from '@/lib/format'
import type { DepartmentId, Product } from '@/types'

const IMG = '/images/products'

/** `contain` tiles show a transparent cut-out on a warm backdrop instead of a full-bleed photo. */
const TILES: Array<{ title: string; cta: string; to: string; image: string; contain?: boolean }> = [
  { title: 'Home Decoration', cta: 'Shop Décor', to: '/collections/home-decor-gifts', image: `${IMG}/decor-cushion-coral.jpeg` },
  { title: 'Power Tools', cta: 'Shop Tools', to: '/collections/power-tools', image: '/images/banner/blower.webp', contain: true },
  { title: 'Home & Kitchen', cta: 'Shop Kitchen', to: '/collections/home-kitchen', image: `${IMG}/kitchen-thali-serving.jpeg` },
  { title: 'Shop All', cta: 'Explore Everything', to: '/products', image: `${IMG}/decor-placemat-serpent.jpeg` },
]

/** Homepage product rows stay short; the full range is one click away via "See all collection". */
const HOME_LIMIT = 5

type TabId = 'best' | DepartmentId | 'new'

const discountOf = (p: Product) => (p.compareAtPrice ? 1 - p.price / p.compareAtPrice : 0)
const inDepartment = (p: Product, id: DepartmentId) => DEPARTMENTS.find((d) => d.id === id)?.categoryIds.includes(p.categoryId) ?? false

function ShopCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-2xl bg-slate-100" />
      <div className="mt-4 h-3 w-1/3 rounded bg-slate-100" />
      <div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />
      <div className="mt-3 h-5 w-1/3 rounded bg-slate-100" />
      <div className="mt-4 h-10 rounded-full bg-slate-100" />
    </div>
  )
}

function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  )
}

/* ---------- Trending carousel ---------- */
function TrendingCarousel({ products, loading }: { products: Product[]; loading: boolean }) {
  const track = useRef<HTMLDivElement>(null)
  const scroll = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.85, behavior: 'smooth' })
  const arrow = 'flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-navy-900 transition hover:border-navy-900 hover:bg-navy-900 hover:text-white'

  return (
    <section className="py-16" aria-labelledby="trending-heading">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">See it in action</p>
            <h2 id="trending-heading" className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Trending right now
            </h2>
          </div>
          <div className="flex gap-2 lg:hidden">
            <button type="button" className={arrow} onClick={() => scroll(-1)} aria-label="Scroll trending products left">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" className={arrow} onClick={() => scroll(1)} aria-label="Scroll trending products right">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div ref={track} className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto scroll-smooth px-4 sm:scroll-px-6 lg:scroll-px-0 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          {loading
            ? Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="w-[72%] shrink-0 sm:w-[44%] lg:w-[calc((100%-5rem)/5)]">
                  <ShopCardSkeleton />
                </div>
              ))
            : products.map((p) => <ShopCard key={p.id} product={p} className="w-[72%] shrink-0 snap-start sm:w-[44%] lg:w-[calc((100%-5rem)/5)]" />)}
        </div>
        <SeeAllButton to="/products" />
      </div>
    </section>
  )
}

/* ---------- Tabbed best sellers ---------- */
function BestsellerTabs({ products, loading }: { products: Product[]; loading: boolean }) {
  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'best', label: 'Best Sellers' },
    ...DEPARTMENTS.map((d) => ({ id: d.id as TabId, label: d.name })),
    { id: 'new', label: 'New Arrivals' },
  ]
  const [active, setActive] = useState<TabId>('best')

  const list = (() => {
    switch (active) {
      case 'best':
        return [...products].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || discountOf(b) - discountOf(a))
      case 'new':
        return [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
      default:
        return products.filter((p) => inDepartment(p, active))
    }
  })().slice(0, HOME_LIMIT)

  const viewAll = active === 'best' || active === 'new' ? '/products' : `/collections/${active}`

  return (
    <section className="bg-slate-50 py-16" aria-labelledby="bestsellers-heading">
      <div className="container-page">
        <div className="text-center">
          <div className="flex items-center justify-center gap-0.5 text-gold-400" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <h2 id="bestsellers-heading" className="mt-3 text-2xl font-extrabold sm:text-3xl">
            Loved by homes &amp; businesses across India
          </h2>
          <p className="mt-2 text-sm text-slate-500">Our most popular picks, from handcrafted décor to everyday sealing machines.</p>
        </div>

        <div role="tablist" aria-label="Product collections" className="no-scrollbar mt-8 flex justify-start gap-2 overflow-x-auto sm:justify-center">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active === t.id}
              aria-controls="bestsellers-panel"
              onClick={() => setActive(t.id)}
              className={cn(
                'shrink-0 rounded-full border px-5 py-2 text-sm font-semibold transition',
                active === t.id ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 bg-white text-navy-900 hover:border-navy-900',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div id="bestsellers-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="mt-10">
          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-5">
              {Array.from({ length: HOME_LIMIT }, (_, i) => (
                <ShopCardSkeleton key={i} />
              ))}
            </div>
          ) : list.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-5">
              {list.map((p, i) => (
                <ShopCard key={p.id} product={p} className={i >= 4 ? 'max-lg:hidden' : undefined} />
              ))}
            </div>
          ) : (
            <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-300">
                <CookingPot className="h-7 w-7" aria-hidden />
              </span>
              <h3 className="text-lg font-bold">Coming soon</h3>
              <p className="text-sm text-slate-500">We are curating this range. Check back soon, or tell us what you are looking for.</p>
              <Link to="/contact" className="btn btn-primary btn-sm mt-2 rounded-full">
                Contact us
              </Link>
            </div>
          )}
        </div>

        {list.length > 0 && <SeeAllButton to={viewAll} />}
      </div>
    </section>
  )
}

/* ---------- Page ---------- */
export default function HomePage() {
  const { products, loading, error, reload } = useCatalog()
  const maxDiscount = Math.floor(Math.max(0, ...products.map(discountOf)) * 100)
  // Trending: the best in-stock deal from each range in turn (décor, tools, kitchen, ...), so all three ranges show up.
  const trending = (() => {
    const byDeal = (a: Product, b: Product) => Number(a.stock <= 0) - Number(b.stock <= 0) || discountOf(b) - discountOf(a)
    const queues = DEPARTMENTS.map((d) => products.filter((p) => p.compareAtPrice && inDepartment(p, d.id)).sort(byDeal))
    const picks: Product[] = []
    for (let round = 0; picks.length < HOME_LIMIT && queues.some((q) => q.length > round); round++)
      for (const q of queues) if (q[round] && picks.length < HOME_LIMIT) picks.push(q[round])
    return picks
  })()

  return (
    <>
      <HeroBanner maxDiscount={maxDiscount} />

      {/* Category tiles */}
      <section className="container-page pt-16" aria-label="Shop by category">
        <SectionHeading
          eyebrow="Shop by category"
          title="Find what you need"
          action={
            <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-navy-900">
              View all products <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />
        <div className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 sm:scroll-px-6 lg:scroll-px-0 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
          {TILES.map((t) => (
            <Link
              key={t.title}
              to={t.to}
              className="group relative flex aspect-[3/4] w-[62%] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-2xl bg-navy-900 sm:w-[36%] lg:w-auto"
            >
              {t.contain && <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#fbf7ea_0%,#ecd78f_55%,#bf9128_100%)]" aria-hidden />}
              <img
                src={t.image}
                alt=""
                loading="lazy"
                className={cn('absolute inset-0 h-full w-full transition duration-700 group-hover:scale-105', t.contain ? 'object-contain px-5 pb-24 drop-shadow-[0_16px_18px_rgba(7,20,49,0.35)]' : 'object-cover')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden />
              <div className="relative p-5">
                <h3 className="text-lg font-extrabold text-white">{t.title}</h3>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-navy-900 transition group-hover:bg-gold-300">
                  {t.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {error ? (
        <div className="container-page py-16">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : (
        <>
          <TrendingCarousel products={trending} loading={loading} />
          <PromoBanners products={products} />
          <div className="h-12" aria-hidden />
          <BestsellerTabs products={products} loading={loading} />
          <PowerToolsBanner products={products} />
        </>
      )}

      {/* Testimonials */}
      <section className="container-page py-20" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">What customers say</p>
          <h2 id="testimonials-heading" className="mt-2 text-2xl font-extrabold sm:text-3xl">
            Real stories from our customers
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            <span className="demo-badge mr-1.5">Demo content</span> These testimonials are illustrative samples for the client presentation.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {DEMO_TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-2xl bg-slate-50 p-8">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5 text-gold-400" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
                  ))}
                </div>
                <Quote className="h-7 w-7 text-gold-200" aria-hidden />
              </div>
              <blockquote className="mt-5 leading-relaxed text-slate-700">“{t.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-gold-300">{t.name[0]}</span>
                <span>
                  <span className="block text-sm font-bold text-navy-900">{t.name}</span>
                  <span className="block text-xs text-slate-500">{t.business} · Sample review</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <PromiseSection />
      <SupportSection />
      <TrustBar />
    </>
  )
}
