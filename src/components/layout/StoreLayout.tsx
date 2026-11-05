import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Mail, MapPin, Menu, Phone, Search, ShieldCheck, ShoppingBag, Truck, X } from 'lucide-react'
import { Logo } from '@/components/ui'
import { useCart } from '@/context/CartContext'
import { CATEGORIES } from '@/data/seed'
import { cn } from '@/lib/format'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Shop' },
  { to: '/orders', label: 'My Orders' },
  { to: '/track', label: 'Track Order' },
]

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function Header() {
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.search])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : '/products')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn('relative py-2 text-sm font-medium transition-colors', isActive ? 'text-navy-900 after:absolute after:inset-x-0 after:-bottom-[1px] after:h-0.5 after:rounded after:bg-gold-400' : 'text-slate-600 hover:text-navy-900')

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="bg-navy-950 text-[13px] text-navy-100">
        <div className="container-page flex h-9 items-center justify-between gap-4">
          <p className="truncate">
            <span className="demo-badge mr-2 border-gold-400/40 bg-gold-400/10 text-gold-300">Client demo</span>
            Prices, stock and orders on this site are sample data.
          </p>
          <p className="hidden items-center gap-1.5 md:flex">
            <Truck className="h-3.5 w-3.5 text-gold-300" aria-hidden /> Free shipping on demo orders above ₹2,000
          </p>
        </div>
      </div>
      <div className="container-page flex h-16 items-center gap-6 lg:h-[72px]">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <form onSubmit={submitSearch} role="search" className="ml-auto hidden w-full max-w-xs md:block">
          <label htmlFor="header-search" className="sr-only">
            Search products
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input id="header-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search sealers, parts…" className="input rounded-full bg-slate-50 py-2 pl-9" />
          </div>
        </form>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link to="/cart" className="relative rounded-full p-2.5 text-navy-900 transition hover:bg-navy-50" aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}>
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span key={count} className="animate-scale-in absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1 text-[11px] font-bold text-navy-950">
                {count}
              </span>
            )}
          </Link>
          <button className="rounded-full p-2.5 text-navy-900 hover:bg-navy-50 lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-nav" className="animate-fade-up border-t border-slate-100 bg-white lg:hidden">
          <div className="container-page space-y-1 py-4">
            <form onSubmit={submitSearch} role="search" className="mb-3 md:hidden">
              <label htmlFor="mobile-search" className="sr-only">
                Search products
              </label>
              <input id="mobile-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="input" />
            </form>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cn('block rounded-lg px-3 py-2.5 font-medium', isActive ? 'bg-navy-50 text-navy-900' : 'text-slate-700 hover:bg-slate-50')}>
                {n.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-24 bg-navy-950 text-navy-200">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-300">Poly sealing machines, impulse and band sealers, and genuine spare parts for businesses that care how their products are packed.</p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-navy-300">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-gold-300" aria-hidden /> 1-year guarantee
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-gold-300" aria-hidden /> Pan-India delivery
            </span>
          </div>
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-white">Shop</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link to={`/products?category=${c.id}`} className="hover:text-gold-300">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-white">Customer care</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/orders" className="hover:text-gold-300">My Orders</Link></li>
            <li><Link to="/track" className="hover:text-gold-300">Track an Order</Link></li>
            <li><Link to="/policies/shipping" className="hover:text-gold-300">Shipping Policy</Link></li>
            <li><Link to="/policies/returns" className="hover:text-gold-300">Returns &amp; Warranty</Link></li>
            <li><Link to="/policies/privacy" className="hover:text-gold-300">Privacy Policy</Link></li>
            <li><Link to="/policies/terms" className="hover:text-gold-300">Terms of Use</Link></li>
          </ul>
        </div>
        <div className="lg:col-span-4">
          <h3 className="text-sm font-semibold text-white">Contact us</h3>
          <p className="mt-1 text-xs text-navy-400">Sample contact details for the demo</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden /> VIENTo Packaging Solutions, Industrial Area Phase II, India
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-gold-300" aria-hidden /> +91 90000 00000 (demo)
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-gold-300" aria-hidden /> support@vientodemo.com
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-navy-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} VIENTo. Client demonstration website. No real transactions are processed.</p>
          <Link to="/admin" className="hover:text-gold-300">
            Admin demo →
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only z-[100] rounded bg-navy-900 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
