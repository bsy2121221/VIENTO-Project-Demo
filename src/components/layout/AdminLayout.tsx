import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Boxes, ExternalLink, LayoutDashboard, LogOut, Menu, Package, RotateCcw, ShoppingCart, X } from 'lucide-react'
import { ConfirmDialog, Logo } from '@/components/ui'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { stockLevel } from '@/components/ui'
import { cn } from '@/lib/format'

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { session } = useAdminAuth()
  const location = useLocation()
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

export default function AdminLayout() {
  const { session, logout } = useAdminAuth()
  const { products, orders, resetDemo } = useStore()
  const toast = useToast()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const lowStock = products.filter((p) => stockLevel(p) !== 'in').length
  const openOrders = orders.filter((o) => o.status !== 'Delivered').length

  const NAV = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/inventory', label: 'Inventory', icon: Boxes, badge: lowStock || undefined },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, badge: openOrders || undefined },
  ]

  const doReset = async () => {
    setResetting(true)
    await resetDemo()
    setResetting(false)
    setConfirmReset(false)
    toast.success('Demo data restored', 'Products, inventory, orders and carts are back to their original state.')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo light />
        <span className="demo-badge border-gold-400/40 bg-gold-400/10 text-gold-300">Admin</span>
      </div>
      <nav aria-label="Admin" className="mt-4 flex-1 space-y-1 px-3">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition', isActive ? 'bg-white/10 text-white' : 'text-navy-200 hover:bg-white/5 hover:text-white')}
          >
            <n.icon className="h-[18px] w-[18px]" aria-hidden />
            <span className="flex-1">{n.label}</span>
            {n.badge && <span className="rounded-full bg-gold-400 px-2 py-0.5 text-[11px] font-bold text-navy-950">{n.badge}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-2 border-t border-white/10 p-4">
        <button onClick={() => setConfirmReset(true)} className="flex w-full items-center gap-3 rounded-lg border border-gold-400/30 px-3 py-2.5 text-sm font-semibold text-gold-300 transition hover:bg-gold-400/10">
          <RotateCcw className="h-4 w-4" aria-hidden /> Reset Demo Data
        </button>
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-navy-200 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-4 w-4" aria-hidden /> View storefront
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-navy-950 lg:block">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="animate-fade-up absolute inset-y-0 left-0 w-72 bg-navy-950">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-3 rounded p-1 text-navy-200 hover:text-white" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button className="rounded-lg p-2 text-navy-900 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open admin menu">
            <Menu className="h-5 w-5" />
          </button>
          <p className="hidden text-sm text-slate-500 sm:block">
            <span className="demo-badge mr-2">Demo</span>All revenue, orders, customers and inventory are sample data.
          </p>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-navy-900">{session?.name}</p>
              <p className="text-xs text-slate-500">{session?.email}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-gold-300" aria-hidden>
              DA
            </span>
            <button onClick={logout} className="btn btn-ghost btn-sm" aria-label="Sign out">
              <LogOut className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>
        <main id="main" className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all demo data?"
        message={
          <>
            This restores the original sample products, inventory and orders, and clears the customer cart and order history in this browser. Use it before presenting the demo to a new client.
          </>
        }
        confirmLabel="Reset demo data"
        danger
        busy={resetting}
        onCancel={() => setConfirmReset(false)}
        onConfirm={doReset}
      />
    </div>
  )
}

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
