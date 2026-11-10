import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Car,
  Clock,
  Fan,
  Feather,
  Gem,
  HandHeart,
  Headphones,
  House,
  Laptop,
  Leaf,
  Lock,
  Mail,
  Phone,
  RotateCcw,
  ShieldCheck,
  Truck,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/format'

const IMG = '/images/products'
const BANNER = '/images/banner'

/* ---------- "See all collection" button ---------- */
export function SeeAllButton({ to, label = 'See all collection' }: { to: string; label?: string }) {
  return (
    <div className="mt-10 text-center">
      <Link to={to} className="btn btn-lg group rounded-full border-2 border-navy-900 bg-white px-10 font-bold text-navy-900 hover:bg-navy-900 hover:text-white">
        {label} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
      </Link>
    </div>
  )
}

/* ---------- Trust icons, shown at the bottom of the homepage just above the footer ---------- */
const TRUST = [
  { icon: BadgeCheck, title: '100% Genuine', text: 'Direct from VIENTo' },
  { icon: Truck, title: 'Free Shipping', text: 'On orders above ₹2,000' },
  { icon: Banknote, title: 'Cash on Delivery', text: 'Pay when it arrives' },
  { icon: RotateCcw, title: '7-Day Returns', text: 'Easy return & exchange' },
  { icon: ShieldCheck, title: '1-Year Warranty', text: 'On all VIENTo machines' },
  { icon: Lock, title: 'Secure Checkout', text: 'UPI, cards & net banking' },
]

export function TrustBar() {
  return (
    <section className="container-page" aria-label="Why shop with VIENTo">
      <ul className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 lg:grid-cols-6">
        {TRUST.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex flex-col items-center gap-2 bg-white px-2 py-4 text-center sm:flex-row sm:gap-3 sm:px-5 sm:text-left lg:flex-col lg:gap-2 lg:px-3 lg:py-5 lg:text-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600 ring-1 ring-gold-200">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-xs leading-tight font-bold text-navy-900 sm:text-sm">{title}</span>
              <span className="mt-0.5 hidden text-xs text-slate-500 sm:block">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- Two side-by-side promotional banners ---------- */
const startingPrice = (products: Product[], categoryId: Product['categoryId']) => {
  const prices = products.filter((p) => p.categoryId === categoryId).map((p) => p.price)
  return prices.length ? Math.min(...prices) : null
}

export function PromoBanners({ products }: { products: Product[] }) {
  const decorFrom = startingPrice(products, 'home-decor-gifts')
  const kitchenFrom = startingPrice(products, 'home-kitchen')

  return (
    <section className="container-page py-6" aria-label="Featured collections">
      <div className="grid gap-5 md:grid-cols-2">
        {/* Home Decoration: full-bleed photo */}
        <Link to="/collections/home-decor-gifts" className="group relative flex min-h-[300px] items-end overflow-hidden rounded-[1.75rem] bg-navy-950 sm:min-h-[340px]">
          <img src={`${IMG}/decor-placemat-fern-ivory.jpeg`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" aria-hidden />
          <div className="relative max-w-xs p-7 sm:p-9">
            <p className="text-xs font-bold tracking-[0.25em] text-gold-300 uppercase">Home Decoration</p>
            <h3 className="mt-3 text-2xl leading-tight font-extrabold text-white sm:text-3xl">Handcrafted for every room</h3>
            <p className="mt-2 text-sm text-white/80">Hand-beaded cushions, placemats &amp; table runners.</p>
            {decorFrom && (
              <p className="mt-4 text-sm text-white/80">
                Starting at <span className="text-xl font-extrabold text-gold-300">{formatPrice(decorFrom)}</span>
              </p>
            )}
            <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-navy-900 transition group-hover:bg-gold-300">
              Shop Décor <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </div>
        </Link>

        {/* Home & Kitchen: cut-out on a warm backdrop */}
        <Link
          to="/collections/home-kitchen"
          className="group relative flex min-h-[300px] items-center overflow-hidden rounded-[1.75rem] sm:min-h-[340px]"
          style={{ background: 'radial-gradient(circle at 78% 55%, #fffaf0 0%, #f3e9d6 45%, #e2c79a 100%)' }}
        >
          <img
            src={`${BANNER}/thali.webp`}
            alt=""
            loading="lazy"
            className="absolute top-1/2 -right-[14%] w-[66%] -translate-y-1/2 sm:-right-[8%] sm:w-[62%] drop-shadow-[0_24px_24px_rgba(59,34,12,0.35)] transition duration-700 group-hover:scale-105 group-hover:-rotate-3"
          />
          <div className="relative max-w-[62%] p-6 sm:max-w-[55%] sm:p-9">
            <p className="text-xs font-bold tracking-[0.25em] text-gold-700 uppercase">Home &amp; Kitchen</p>
            <h3 className="mt-3 text-2xl leading-tight font-extrabold text-navy-950 sm:text-3xl">Festive dining, golden thali sets</h3>
            <p className="mt-2 text-sm text-navy-800/80">Mirror-polished dinnerware with engraved detail.</p>
            {kitchenFrom && (
              <p className="mt-4 text-sm text-navy-800/80">
                Starting at <span className="text-xl font-extrabold text-red-600">{formatPrice(kitchenFrom)}</span>
              </p>
            )}
            <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-bold whitespace-nowrap text-white transition group-hover:bg-navy-700">
              Shop Kitchen <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}

/* ---------- Full-width Power Tools feature banner with spec icons ---------- */
const BLOWER_SLUG = 'viento-electric-air-blower-700w'
const SPECS = [
  { icon: Zap, value: '700 W', label: 'Power' },
  { icon: Fan, value: '16,000', label: 'RPM' },
  { icon: Wind, value: '2.8 m³', label: 'Air flow / min' },
  { icon: Feather, value: '1.3 kg', label: 'Lightweight' },
]
const USES = [
  { icon: House, label: 'Home' },
  { icon: Car, label: 'Car' },
  { icon: Wrench, label: 'Workshop' },
  { icon: Laptop, label: 'Electronics' },
  { icon: Leaf, label: 'Garden' },
]

export function PowerToolsBanner({ products }: { products: Product[] }) {
  const blower = products.find((p) => p.slug === BLOWER_SLUG)
  const discount = blower?.compareAtPrice ? Math.round((1 - blower.price / blower.compareAtPrice) * 100) : 0

  return (
    <section className="container-page py-16" aria-labelledby="power-banner-heading">
      <div
        className="relative grid items-center gap-8 overflow-hidden rounded-[2rem] px-7 py-10 sm:px-12 lg:grid-cols-2 lg:py-14"
        style={{ background: 'radial-gradient(circle at 80% 50%, rgba(220,38,38,0.35), transparent 45%), linear-gradient(135deg, #071431 0%, #0b1f45 60%, #1c0d14 100%)' }}
      >
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
            <Zap className="h-3.5 w-3.5" aria-hidden /> New in Power Tools
          </p>
          <h2 id="power-banner-heading" className="mt-5 text-4xl leading-[1.05] font-extrabold text-white sm:text-5xl">
            Blow strong.
            <br />
            <span className="text-gold-300">Clean fast.</span>
          </h2>
          <p className="mt-4 text-lg text-navy-100">VIENTo Electric Air Blower 700W. One blower, multiple uses.</p>

          <ul className="mt-7 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
            {SPECS.map(({ icon: Icon, value, label }) => (
              <li key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur">
                <Icon className="mx-auto h-6 w-6 text-gold-300" aria-hidden />
                <p className="mt-2 text-base font-extrabold text-white">{value}</p>
                <p className="text-[11px] text-navy-200">{label}</p>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs font-semibold tracking-wider text-navy-200 uppercase">Ideal for</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {USES.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                <Icon className="h-3.5 w-3.5 text-gold-300" aria-hidden /> {label}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {blower && (
              <p className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{formatPrice(blower.price)}</span>
                {blower.compareAtPrice && <span className="text-sm text-navy-300 line-through">{formatPrice(blower.compareAtPrice)}</span>}
                {discount > 0 && <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">-{discount}%</span>}
              </p>
            )}
            <Link to={blower ? `/products/${blower.slug}` : '/collections/power-tools'} className="btn btn-gold btn-lg rounded-full">
              Buy now <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/collections/power-tools" className="text-sm font-semibold text-white underline-offset-4 hover:underline">
              Shop all Power Tools
            </Link>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="absolute h-64 w-64 rounded-full bg-red-500/30 blur-3xl sm:h-80 sm:w-80" aria-hidden />
          <img
            src={`${BANNER}/blower.webp`}
            alt="VIENTo Electric Air Blower 700W"
            loading="lazy"
            className="relative w-full max-w-xl -rotate-6 drop-shadow-[0_30px_30px_rgba(0,0,0,0.5)] transition duration-700 hover:rotate-0"
          />
        </div>
      </div>
    </section>
  )
}

/* ---------- The VIENTo promise ---------- */
const PROMISE = [
  { icon: Gem, title: 'Premium Quality', text: 'Every product is quality-checked before it leaves our warehouse.' },
  { icon: HandHeart, title: 'Handcrafted by Artisans', text: 'Our décor and dinnerware are finished by skilled Indian craftspeople.' },
  { icon: Wrench, title: 'Genuine Spare Parts', text: 'Elements, Teflon cloth and accessories made for VIENTo machines.' },
  { icon: Headphones, title: 'Real Human Support', text: 'Help choosing, setting up and caring for every purchase.' },
]

export function PromiseSection() {
  return (
    <section className="py-20" style={{ background: 'linear-gradient(135deg, #fbf7ef 0%, #f5ebc8 100%)' }} aria-labelledby="promise-heading">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">The VIENTo promise</p>
          <h2 id="promise-heading" className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Made to last. Priced to make sense.
          </h2>
          <p className="mt-3 text-slate-600">The same promise on every product, whichever range you shop.</p>
        </div>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISE.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl bg-white p-7 text-center shadow-sm ring-1 ring-gold-200/60 transition hover:-translate-y-1 hover:shadow-lg">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-gold-300">
                <Icon className="h-8 w-8" aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------- Customer support ---------- */
const SUPPORT = [
  { icon: Mail, title: 'Email Support', text: 'We reply within 24 hours.', value: 'support@vientodemo.com' },
  { icon: Phone, title: 'Call Us', text: 'Speak directly with our team.', value: '+91 90000 00000 (demo)' },
  { icon: Clock, title: 'Support Hours', text: 'Monday to Saturday.', value: '10:00 AM – 7:00 PM IST' },
]

export function SupportSection() {
  return (
    <section className="container-page py-20" aria-labelledby="support-heading">
      <div className="rounded-[2rem] bg-navy-950 px-7 py-12 sm:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
          <p className="eyebrow text-gold-300">We are here to help</p>
          <h2 id="support-heading" className="mt-2 text-3xl font-extrabold text-white">
            Customer support
          </h2>
          <p className="mt-3 text-navy-200">Questions about a product, a bulk order or tracking a delivery? Reach us whichever way suits you.</p>
          </div>
          <Link to="/contact" className="btn btn-gold rounded-full">
            Contact us <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {SUPPORT.map(({ icon: Icon, title, text, value }) => (
            <li key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Icon className="h-6 w-6 text-gold-300" aria-hidden />
              <h3 className="mt-4 font-bold text-white">{title}</h3>
              <p className="mt-1 text-xs text-navy-300">{text}</p>
              <p className="mt-3 text-sm font-semibold break-words text-white">{value}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
