import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgePercent, CookingPot, IndianRupee, PackageCheck, Quote, Star, Store, Users } from 'lucide-react'
import ShopCard from '@/components/product/ShopCard'
import InfiniteProductGrid from '@/components/product/InfiniteProductGrid'
import HeroBanner from '@/components/home/HeroBanner'
import { PowerToolsBanner, PromiseSection, PromoBanners, SeeAllButton, SupportSection, TrustBar } from '@/components/home/HomeSections'
import { ErrorState } from '@/components/ui'
import { useCatalog } from '@/context/StoreContext'
import { DEMO_TESTIMONIALS } from '@/data/seed'
import { CategoryBubble } from '@/components/marketplace'
import { cn } from '@/lib/format'
import type { Category, Product } from '@/types'

const IMG = '/images/products'

/** `contain` tiles show a transparent cut-out on a warm backdrop instead of a full-bleed photo. */
const TILES: Array<{ title: string; cta: string; to: string; image: string; contain?: boolean }> = [
  { title: 'Home Decoration', cta: 'Shop Décor', to: '/collections/home-decor-gifts', image: `${IMG}/decor-cushion-coral.jpeg` },
  { title: 'Power Tools', cta: 'Shop Tools', to: '/collections/power-tools', image: '/images/banner/blower.webp', contain: true },
  { title: 'Home & Kitchen', cta: 'Shop Kitchen', to: '/collections/home-kitchen', image: `${IMG}/kitchen-thali-serving.jpeg` },
  { title: 'Shop All', cta: 'Explore Everything', to: '/products', image: `${IMG}/decor-placemat-serpent.jpeg` },
]

/** Homepage product rows stay short; the full range is one click away via "See all collection". */
const HOME_LIMIT = 6

type TabId = string

const discountOf = (p: Product) => (p.compareAtPrice ? 1 - p.price / p.compareAtPrice : 0)

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

/* ---------- Colourful "shop by category" strip ---------- */
function CategoryStrip({ categories, products }: { categories: Category[]; products: Product[] }) {
  return (
    <section className="container-page pt-10" aria-labelledby="category-strip-heading">
      <h2 id="category-strip-heading" className="text-center text-xl font-extrabold sm:text-2xl">
        Shop from <span className="bg-rainbow bg-clip-text text-transparent">{categories.length}+ categories</span>
      </h2>
      <ul className="mt-6 grid grid-cols-4 gap-x-1 gap-y-3 sm:grid-cols-6 sm:gap-4 2xl:grid-cols-12">
        {categories.map((c) => {
          const count = products.filter((p) => p.categoryId === c.id).length
          return (
            <li key={c.id} className="min-w-0">
              <Link to={`/collections/${c.id}`} className="group flex flex-col items-center gap-1.5 rounded-2xl p-1 text-center sm:gap-2 sm:p-2 transition hover:-translate-y-1">
                <span className="rounded-full p-1 ring-2 ring-transparent transition group-hover:ring-[var(--c)]" style={{ ['--c' as string]: c.color }}>
                  <CategoryBubble category={c} size="lg" />
                </span>
                <span className="text-[11px] leading-tight font-bold text-navy-900 sm:text-[13px]">{c.name}</span>
                <span className="hidden text-[11px] font-medium sm:block" style={{ color: count ? c.color : undefined }}>
                  {count ? `${count} product${count === 1 ? '' : 's'}` : <span className="text-slate-400">Coming soon</span>}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ---------- "Sell on VIENTo" call-to-action ---------- */
const SELLER_PERKS = [
  { icon: Users, title: 'Reach new customers', text: 'Get discovered by shoppers across India.' },
  { icon: BadgePercent, title: 'Low commission', text: 'Simple, transparent per-order commission.' },
  { icon: PackageCheck, title: 'Easy listing', text: 'Our team helps you list your catalogue.' },
  { icon: IndianRupee, title: 'Regular payouts', text: 'Earnings settled straight to your bank.' },
]

function SellerCta({ sellerCount }: { sellerCount: number }) {
  return (
    <section className="container-page py-12" aria-labelledby="seller-cta-heading">
      <div className="bg-rainbow relative overflow-hidden rounded-[2rem] px-7 py-10 text-white sm:px-12 lg:py-14">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10" aria-hidden />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-white/10" aria-hidden />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wider uppercase">
              <Store className="h-3.5 w-3.5" aria-hidden /> For sellers
            </p>
            <h2 id="seller-cta-heading" className="mt-4 text-3xl leading-tight font-extrabold text-white sm:text-4xl">
              Sell your products on VIENTo
            </h2>
            <p className="mt-3 max-w-md text-white/85">
              Manufacturers, wholesalers, artisans and home businesses: list your products and grow with us. {sellerCount > 0 && `${sellerCount} seller${sellerCount === 1 ? ' is' : 's are'} already selling.`}
            </p>
            <Link to="/sell" className="btn btn-lg mt-7 rounded-full bg-white font-bold text-navy-900 hover:bg-white/90">
              Start selling <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {SELLER_PERKS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-2xl bg-white/15 p-5 backdrop-blur">
                <Icon className="h-6 w-6" aria-hidden />
                <h3 className="mt-3 font-bold text-white">{title}</h3>
                <p className="mt-1 text-sm text-white/80">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/** Home rows hold 6 cards: the 5th appears from 5 columns up, the 6th only on wide monitors. */
const hideExtra = (i: number) => (i === 4 ? 'max-lg:hidden' : i >= 5 ? 'max-2xl:hidden' : undefined)

/* ---------- Trending grid ---------- */
function TrendingGrid({ products, loading }: { products: Product[]; loading: boolean }) {
  // 2 columns on phones, 4 on tablets, 5 on desktop, 6 on wide monitors; extra cards only show where they complete a row.
  const cell = hideExtra
  return (
    <section className="py-12 sm:py-16" aria-labelledby="trending-heading">
      <div className="container-page">
        <p className="eyebrow">See it in action</p>
        <h2 id="trending-heading" className="mt-2 text-2xl font-extrabold sm:text-3xl">
          Trending right now
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
          {loading
            ? Array.from({ length: HOME_LIMIT }, (_, i) => (
                <div key={i} className={cell(i)}>
                  <ShopCardSkeleton />
                </div>
              ))
            : products.map((p, i) => <ShopCard key={p.id} product={p} className={cell(i)} />)}
        </div>
        <SeeAllButton to="/products" />
      </div>
    </section>
  )
}

/* ---------- "Products for you": endless feed that loads more on scroll ---------- */
function ProductFeed({ products, loading }: { products: Product[]; loading: boolean }) {
  return (
    <section className="container-page py-12 sm:py-16" aria-labelledby="feed-heading">
      <h2 id="feed-heading" className="text-2xl font-extrabold sm:text-3xl">
        Products for you
      </h2>
      <p className="mt-1 text-sm text-slate-500">Everything on VIENTo. Keep scrolling to see more.</p>
      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 12 }, (_, i) => (
              <ShopCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <InfiniteProductGrid
            products={products}
            className="gap-x-3 gap-y-8 sm:gap-x-5"
            skeleton={<ShopCardSkeleton />}
            render={(p) => <ShopCard key={p.id} product={p} />}
          />
        )}
      </div>
    </section>
  )
}

/* ---------- Tabbed best sellers ---------- */
function BestsellerTabs({ products, categories, loading }: { products: Product[]; categories: Category[]; loading: boolean }) {
  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'best', label: 'Best Sellers' },
    // Only categories that have products get a tab, so a tab is never empty.
    ...categories.filter((c) => products.some((p) => p.categoryId === c.id)).map((c) => ({ id: c.id, label: c.name })),
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
        return products.filter((p) => p.categoryId === active)
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
          <p className="mt-2 text-sm text-slate-500">Popular picks from every category on VIENTo.</p>
        </div>

        <div role="tablist" aria-label="Product collections" className="mt-8 flex flex-wrap justify-center gap-2">
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
                'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition sm:px-5 sm:py-2 sm:text-sm',
                active === t.id ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 bg-white text-navy-900 hover:border-navy-900',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div id="bestsellers-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="mt-10">
          {loading ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
              {Array.from({ length: HOME_LIMIT }, (_, i) => (
                <div key={i} className={hideExtra(i)}>
                  <ShopCardSkeleton />
                </div>
              ))}
            </div>
          ) : list.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
              {list.map((p, i) => (
                <ShopCard key={p.id} product={p} className={hideExtra(i)} />
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
  const { products, categories, sellers, loading, error, reload } = useCatalog()
  const maxDiscount = Math.floor(Math.max(0, ...products.map(discountOf)) * 100)
  // Trending: the best in-stock deal from each category in turn, so every stocked category shows up.
  const trending = (() => {
    const byDeal = (a: Product, b: Product) => Number(a.stock <= 0) - Number(b.stock <= 0) || discountOf(b) - discountOf(a)
    const queues = categories.map((c) => products.filter((p) => p.compareAtPrice && p.categoryId === c.id).sort(byDeal))
    const picks: Product[] = []
    for (let round = 0; picks.length < HOME_LIMIT && queues.some((q) => q.length > round); round++)
      for (const q of queues) if (q[round] && picks.length < HOME_LIMIT) picks.push(q[round])
    return picks
  })()

  return (
    <>
      <HeroBanner maxDiscount={maxDiscount} />

      <CategoryStrip categories={categories} products={products} />

      {/* Category tiles */}
      <section className="container-page pt-16" aria-label="Shop by category">
        <SectionHeading
          eyebrow="Featured collections"
          title="Find what you need"
          action={
            <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-navy-900">
              View all products <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {TILES.map((t) => (
            <Link
              key={t.title}
              to={t.to}
              className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl bg-navy-900"
            >
              {t.contain && <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#fbf7ea_0%,#ecd78f_55%,#bf9128_100%)]" aria-hidden />}
              <img
                src={t.image}
                alt=""
                loading="lazy"
                className={cn('absolute inset-0 h-full w-full transition duration-700 group-hover:scale-105', t.contain ? 'object-contain px-4 pb-20 sm:px-5 sm:pb-24 drop-shadow-[0_16px_18px_rgba(7,20,49,0.35)]' : 'object-cover')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden />
              <div className="relative p-3 sm:p-5">
                <h3 className="text-base font-extrabold text-white sm:text-lg">{t.title}</h3>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] sm:mt-3 sm:px-4 sm:py-2 sm:text-xs font-bold text-navy-900 transition group-hover:bg-gold-300">
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
          <TrendingGrid products={trending} loading={loading} />
          <PromoBanners products={products} />
          <div className="h-12" aria-hidden />
          <BestsellerTabs products={products} categories={categories} loading={loading} />
          <PowerToolsBanner products={products} />
          <ProductFeed products={products} loading={loading} />
        </>
      )}

      <SellerCta sellerCount={sellers.length} />

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
