import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, CookingPot, Gauge, Hand, Headphones, PackageCheck, Quote, ShieldCheck, Sofa, Thermometer, Timer, Truck, Wrench, Zap, type LucideIcon } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import { ErrorState, SkeletonCard } from '@/components/ui'
import { useCatalog } from '@/context/StoreContext'
import { DEMO_TESTIMONIALS, DEPARTMENTS } from '@/data/seed'
import type { DepartmentId } from '@/types'

const DEPARTMENT_ICONS: Record<DepartmentId, LucideIcon> = {
  'home-decor-gifts': Sofa,
  'power-tools': Wrench,
  'home-kitchen': CookingPot,
}

const DEPARTMENT_HEADINGS: Record<DepartmentId, string> = {
  'home-decor-gifts': 'Handcrafted pieces for every room',
  'power-tools': 'Sealing machines built for daily use',
  'home-kitchen': 'Everyday essentials for your kitchen',
}

const BENEFITS = [
  { icon: Timer, title: 'Fast sealing', text: 'No warm-up needed. Instant heating finishes each seal in 2–3 seconds, so queues at the counter keep moving.' },
  { icon: Thermometer, title: 'Adjustable temperature', text: '8 heat levels let you match the seal to thin polythene, PP or laminated pouches without burning the film.' },
  { icon: Hand, title: 'Easy operation', text: 'Place the bag, press the arm, wait for the light. New staff can produce professional seals on day one.' },
  { icon: PackageCheck, title: 'Reliable packaging', text: 'Airtight, uniform seams keep snacks crisp, spices fresh and hardware protected through transit.' },
]

const REASONS = [
  { icon: ShieldCheck, title: '1-year guarantee', text: 'Every VIENTo sealing machine is covered by a one-year manufacturer guarantee.' },
  { icon: Wrench, title: 'Genuine spare parts', text: 'Heating elements and Teflon cloth made for our machines, ready to ship.' },
  { icon: Headphones, title: 'Real setup support', text: 'Help choosing the right sealer and step-by-step maintenance guidance.' },
  { icon: Truck, title: 'Pan-India delivery', text: 'Securely packed and dispatched to shops, kitchens and factories across India.' },
]

export default function HomePage() {
  const { products, loading, error, reload } = useCatalog()
  const productsFor = (id: DepartmentId) => {
    const ids = DEPARTMENTS.find((d) => d.id === id)?.categoryIds ?? []
    return products.filter((p) => ids.includes(p.categoryId)).sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
  }
  const countFor = (id: DepartmentId) => productsFor(id).length

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-gold-100/60 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute top-1/2 -left-48 h-[420px] w-[420px] rounded-full bg-navy-100/60 blur-3xl" aria-hidden />
        <div className="container-page relative grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <p className="eyebrow">Poly sealing machines &amp; packaging equipment</p>
            <h1 className="mt-4 text-4xl leading-[1.08] font-extrabold sm:text-5xl lg:text-[3.6rem]">
              Reliable <span className="relative whitespace-nowrap text-navy-700">Business Tools</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              From a single sweet shop counter to a full packing line, VIENTo sealers give you clean, airtight seals in seconds, with adjustable heat, genuine spares and a one-year guarantee.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/collections/power-tools" className="btn btn-primary btn-lg group">
                Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link to="/products?category=spare-parts" className="btn btn-outline btn-lg">
                Spare parts
              </Link>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200 pt-8">
              {[
                ['2–3 s', 'per seal'],
                ['8', 'heat levels'],
                ['1 yr', 'guarantee'],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">{v}</dd>
                  <dd className="mt-1 text-sm text-slate-500">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="animate-fade-up relative [animation-delay:120ms]">
            <div className="relative mx-auto max-w-lg">
              <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-ember-400/30 to-gold-300/30 blur-2xl" aria-hidden />
              <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-navy-900/15">
                <img src="/images/products/sealer-orange-studio.jpeg" alt="VIENTo orange poly sealing machine" className="aspect-square w-full scale-[1.06] object-cover" />
              </div>
              <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl shadow-navy-900/10 sm:-left-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ember-500/10 text-ember-600">
                  <Zap className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-navy-900">No warm-up needed</p>
                  <p className="text-xs text-slate-500">Instant electronic heating</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-2 flex items-center gap-2 rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white shadow-lg sm:-right-6">
                <BadgeCheck className="h-4 w-4 text-gold-300" aria-hidden /> 1-year guarantee
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="container-page py-20" aria-labelledby="departments-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Browse the range</p>
            <h2 id="departments-heading" className="mt-2 text-3xl font-extrabold">
              Shop by category
            </h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-navy-900">
            View all products <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {DEPARTMENTS.map((d) => {
            const Icon = DEPARTMENT_ICONS[d.id]
            const count = countFor(d.id)
            return (
              <Link
                key={d.id}
                to={`/collections/${d.id}`}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-navy-900 shadow-lg shadow-navy-900/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:aspect-[4/3] md:aspect-[4/5]"
              >
                {d.image ? (
                  <img src={d.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" aria-hidden>
                    <Icon className="h-28 w-28 text-gold-300/25 transition duration-500 group-hover:scale-110" strokeWidth={1.25} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/35 to-transparent" aria-hidden />
                <div className="relative p-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-gold-300 backdrop-blur">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-2xl font-extrabold text-white">{d.name}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-navy-100">{d.description}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300">
                    {loading ? '…' : count ? `Explore ${count} product${count === 1 ? '' : 's'}` : 'Coming soon'}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* One section per department */}
      {DEPARTMENTS.map((d, i) => {
        const items = productsFor(d.id).slice(0, 4)
        const Icon = DEPARTMENT_ICONS[d.id]
        return (
          <section key={d.id} className={i % 2 === 0 ? 'bg-slate-50 py-20' : 'py-20'} aria-labelledby={`dept-${d.id}-heading`}>
            <div className="container-page">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="eyebrow inline-flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" aria-hidden /> {d.name}
                  </p>
                  <h2 id={`dept-${d.id}-heading`} className="mt-2 text-3xl font-extrabold">
                    {DEPARTMENT_HEADINGS[d.id]}
                  </h2>
                  <p className="mt-2 text-slate-600">{d.description}</p>
                </div>
                <Link to={`/collections/${d.id}`} className="btn btn-outline">
                  Explore {d.name} <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {error ? (
                  <div className="col-span-full">
                    <ErrorState message={error} onRetry={reload} />
                  </div>
                ) : loading ? (
                  Array.from({ length: 4 }, (_, k) => <SkeletonCard key={k} />)
                ) : items.length ? (
                  items.map((p) => <ProductCard key={p.id} product={p} />)
                ) : (
                  <div className="card col-span-full flex flex-col items-center gap-3 px-6 py-14 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-300">
                      <Icon className="h-7 w-7" aria-hidden />
                    </span>
                    <h3 className="text-lg font-bold">Coming soon</h3>
                    <p className="max-w-md text-sm text-slate-500">We are curating the {d.name} range. Check back soon, or contact us if you are looking for something specific.</p>
                    <Link to="/contact" className="btn btn-primary btn-sm mt-2">
                      Contact us
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        )
      })}

      {/* Benefits */}
      <section className="container-page grid items-center gap-14 py-24 lg:grid-cols-2" aria-labelledby="benefits-heading">
        <div className="relative order-2 lg:order-1">
          <div className="overflow-hidden rounded-[2rem] shadow-xl shadow-navy-900/10">
            <img src="/images/products/sealer-orange-features.jpeg" alt="VIENTo sealing machine feature highlights" className="w-full" loading="lazy" />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <p className="eyebrow">Built for daily packing</p>
          <h2 id="benefits-heading" className="mt-2 text-3xl font-extrabold sm:text-4xl">
            A better seal, every single time
          </h2>
          <p className="mt-4 text-slate-600">Every VIENTo sealer is designed around four things our customers ask for most.</p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <div key={b.title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ember-500/10 text-ember-600">
                  <b.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-bold">{b.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="relative overflow-hidden bg-navy-950 py-24 text-white" aria-labelledby="why-heading">
        <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" aria-hidden />
        <div className="container-page relative">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold-300">Why choose VIENTo</p>
            <h2 id="why-heading" className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              Equipment you can rely on, from people who answer the phone
            </h2>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((r) => (
              <div key={r.title} className="bg-navy-950 p-8 transition hover:bg-navy-900">
                <r.icon className="h-7 w-7 text-gold-300" aria-hidden />
                <h3 className="mt-5 text-lg font-bold text-white">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-200">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-page py-24" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">What customers say</p>
          <h2 id="testimonials-heading" className="mt-2 text-3xl font-extrabold">
            Trusted by growing businesses
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            <span className="demo-badge mr-1.5">Demo content</span> These testimonials are illustrative samples for the client presentation.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {DEMO_TESTIMONIALS.map((t) => (
            <figure key={t.name} className="card relative p-8">
              <Quote className="h-8 w-8 text-gold-300" aria-hidden />
              <blockquote className="mt-4 leading-relaxed text-slate-700">“{t.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
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

      {/* CTA */}
      <section className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-gold-300 via-gold-400 to-gold-500 px-8 py-14 sm:px-14">
          <Gauge className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 text-white/15" aria-hidden />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-extrabold text-navy-950">Ready to upgrade your packing counter?</h2>
            <p className="mt-3 text-navy-900/80">Pick the sealer that fits your volume, add a spare element kit, and you are set for the year ahead.</p>
            <Link to="/products" className="btn btn-primary btn-lg mt-8">
              Browse sealing machines <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
