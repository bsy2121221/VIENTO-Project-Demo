import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogIn, LogOut, Mail, MapPin, Menu, Phone, Receipt, Search, ShieldCheck, ShoppingBag, Truck, User, UserPlus, X } from 'lucide-react'
import { Logo } from '@/components/ui'
import { useCart } from '@/context/CartContext'
import { useCustomerAuth } from '@/context/CustomerAuthContext'
import { useToast } from '@/context/ToastContext'
import { CATEGORIES, DEPARTMENTS } from '@/data/seed'
import { cn } from '@/lib/format'

const NAV = [
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
]

const ACCOUNT_LINKS = [
  { to: '/orders', label: 'My Orders', icon: Receipt },
  { to: '/track', label: 'Track Order', icon: Truck },
]

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')

function AccountMenu() {
  const { user, logout } = useCustomerAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const signOut = () => {
    logout()
    setOpen(false)
    toast.success('Signed out', 'See you again soon.')
    if (location.pathname.startsWith('/orders')) navigate('/')
  }

  const item = 'flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-navy-900 transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn('flex items-center gap-2 rounded-full p-1.5 text-navy-900 transition hover:bg-navy-50', !user && 'p-2.5', open && 'bg-navy-50')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="account-menu"
        aria-label={user ? `Account menu for ${user.name}` : 'Account menu'}
      >
        {user ? (
          <>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-gold-300">{initials(user.name)}</span>
            <span className="hidden max-w-[7rem] truncate text-sm font-semibold xl:inline">{user.name.split(' ')[0]}</span>
            <ChevronDown className={cn('hidden h-3.5 w-3.5 transition xl:block', open && 'rotate-180')} aria-hidden />
          </>
        ) : (
          <User className="h-5 w-5" />
        )}
      </button>
      <div
        id="account-menu"
        role="menu"
        className={cn(
          'absolute top-full right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-navy-900/10 transition duration-150',
          open ? 'visible scale-100 opacity-100' : 'invisible pointer-events-none scale-95 opacity-0',
        )}
      >
        {user ? (
          <>
            <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
              <p className="truncate text-sm font-bold text-navy-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
            <div className="py-1">
              {ACCOUNT_LINKS.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} role="menuitem" className={item}>
                  <Icon className="h-4 w-4 text-slate-400" aria-hidden /> {label}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-2 p-4">
            <p className="text-sm font-bold text-navy-900">Welcome to VIENTo</p>
            <p className="text-xs text-slate-500">Sign in to see your orders and track deliveries.</p>
            <div className="flex gap-2 pt-1">
              <Link to="/login" state={{ from: location.pathname + location.search }} role="menuitem" className="btn btn-primary btn-sm flex-1">
                <LogIn className="h-4 w-4" aria-hidden /> Sign in
              </Link>
              <Link to="/register" state={{ from: location.pathname + location.search }} role="menuitem" className="btn btn-outline btn-sm flex-1">
                <UserPlus className="h-4 w-4" aria-hidden /> Join
              </Link>
            </div>
          </div>
        )}
        {user && (
          <div className="border-t border-slate-100 py-1">
            <button type="button" role="menuitem" onClick={signOut} className={cn(item, 'w-full text-red-600')}>
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

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
  const [exploreOpen, setExploreOpen] = useState(false)
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const exploreActive = location.pathname.startsWith('/collections')

  useEffect(() => {
    setOpen(false)
    setExploreOpen(false)
    setMobileExploreOpen(false)
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
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/products" className={linkClass}>
            Shop All
          </NavLink>
          <div
            className="relative"
            onMouseEnter={() => setExploreOpen(true)}
            onMouseLeave={() => setExploreOpen(false)}
            onFocus={() => setExploreOpen(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setExploreOpen(false)
            }}
          >
            <button
              type="button"
              className={cn(
                'relative inline-flex items-center gap-1 py-2 text-sm font-medium transition-colors',
                exploreOpen || exploreActive ? 'text-navy-900' : 'text-slate-600 hover:text-navy-900',
                exploreActive && 'after:absolute after:inset-x-0 after:-bottom-[1px] after:h-0.5 after:rounded after:bg-gold-400',
              )}
              aria-haspopup="menu"
              aria-expanded={exploreOpen}
              aria-controls="nav-explore-menu"
            >
              Explore <ChevronDown className={cn('h-3.5 w-3.5 transition duration-200', exploreOpen && 'rotate-180')} aria-hidden />
            </button>
            <div
              id="nav-explore-menu"
              role="menu"
              aria-label="Explore categories"
              className={cn(
                'absolute top-full left-0 z-40 min-w-[12rem] origin-top pt-2 transition duration-200',
                exploreOpen ? 'visible scale-100 opacity-100' : 'invisible pointer-events-none scale-95 opacity-0',
              )}
            >
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-navy-900/10">
                {DEPARTMENTS.map((d) => (
                  <Link
                    key={d.id}
                    to={`/collections/${d.id}`}
                    role="menuitem"
                    className="block px-4 py-2.5 text-sm font-medium text-navy-900 transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                  >
                    {d.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkClass}>
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
          <AccountMenu />
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
            <NavLink to="/" end className={({ isActive }) => cn('block rounded-lg px-3 py-2.5 font-medium', isActive ? 'bg-navy-50 text-navy-900' : 'text-slate-700 hover:bg-slate-50')}>
              Home
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => cn('block rounded-lg px-3 py-2.5 font-medium', isActive ? 'bg-navy-50 text-navy-900' : 'text-slate-700 hover:bg-slate-50')}>
              Shop All
            </NavLink>
            <div>
              <button
                type="button"
                className={cn('flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-medium', exploreActive || mobileExploreOpen ? 'bg-navy-50 text-navy-900' : 'text-slate-700 hover:bg-slate-50')}
                aria-expanded={mobileExploreOpen}
                onClick={() => setMobileExploreOpen((v) => !v)}
              >
                Explore <ChevronDown className={cn('h-4 w-4 transition', mobileExploreOpen && 'rotate-180')} aria-hidden />
              </button>
              {mobileExploreOpen && (
                <div className="mt-1 space-y-1 border-l border-slate-200 pl-3 ml-3">
                  {DEPARTMENTS.map((d) => (
                    <Link key={d.id} to={`/collections/${d.id}`} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      {d.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => cn('block rounded-lg px-3 py-2.5 font-medium', isActive ? 'bg-navy-50 text-navy-900' : 'text-slate-700 hover:bg-slate-50')}>
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
            <li><Link to="/about" className="hover:text-gold-300">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-gold-300">Contact Us</Link></li>
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
