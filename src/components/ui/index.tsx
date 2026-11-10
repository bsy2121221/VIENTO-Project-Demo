import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ImageOff, Loader2, Minus, Plus, X } from 'lucide-react'
import type { OrderStatus, PaymentStatus, Product } from '@/types'
import { cn } from '@/lib/format'

/* ---------- Brand ---------- */
export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn('group inline-flex shrink-0 items-center rounded-md', className)} aria-label="VIENTo home">
      <img
        src="/images/logo.png"
        alt="VIENTo"
        width={652}
        height={175}
        className={cn('h-8 w-auto transition-opacity group-hover:opacity-85 lg:h-9', light && 'brightness-110')}
      />
    </Link>
  )
}

/* ---------- Feedback ---------- */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin', className)} aria-hidden />
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500" role="status">
      <Spinner className="h-7 w-7 text-navy-700" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card mx-auto my-12 max-w-md p-8 text-center" role="alert">
      <AlertTriangle className="mx-auto h-10 w-10 text-red-500" aria-hidden />
      <h2 className="mt-4 text-lg font-bold">Something went wrong</h2>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
      {onRetry && (
        <button className="btn btn-primary mt-6" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-50 text-navy-700">{icon}</div>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-600">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card overflow-hidden" aria-hidden>
      <div className="aspect-square animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
        <div className="h-9 w-full animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  )
}

/* ---------- Product helpers ---------- */
export function ProductImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    setFailed(false)
  }, [src])
  if (!src || failed)
    return (
      <div className={cn('flex flex-col items-center justify-center gap-2 bg-slate-100 text-slate-400', className)}>
        <ImageOff className="h-8 w-8" aria-hidden />
        <span className="text-xs">Image unavailable</span>
      </div>
    )
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={cn('object-cover', className)} />
}

export type StockLevel = 'in' | 'low' | 'out'
export const stockLevel = (p: Pick<Product, 'stock' | 'lowStockThreshold'>): StockLevel =>
  p.stock <= 0 ? 'out' : p.stock <= p.lowStockThreshold ? 'low' : 'in'

export function StockBadge({ product, showCount = false }: { product: Pick<Product, 'stock' | 'lowStockThreshold'>; showCount?: boolean }) {
  const level = stockLevel(product)
  const styles = {
    in: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    low: 'bg-amber-50 text-amber-800 ring-amber-600/25',
    out: 'bg-slate-100 text-slate-600 ring-slate-400/30',
  }[level]
  const dot = { in: 'bg-emerald-500', low: 'bg-amber-500', out: 'bg-slate-400' }[level]
  const text = { in: 'In stock', low: `Only ${product.stock} left`, out: 'Out of stock' }[level]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', styles)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} aria-hidden />
      {text}
      {showCount && level === 'in' && <span className="text-emerald-600/80">· {product.stock} units (demo)</span>}
    </span>
  )
}

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  'Order Placed': 'bg-slate-100 text-slate-700 ring-slate-400/30',
  Confirmed: 'bg-navy-50 text-navy-700 ring-navy-600/20',
  Processing: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  Shipped: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
}
const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  Pending: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Failed: 'bg-red-50 text-red-700 ring-red-600/20',
  Refunded: 'bg-slate-100 text-slate-700 ring-slate-400/30',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset', ORDER_STATUS_STYLES[status])}>{status}</span>
}
export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset', PAYMENT_STYLES[status])}>{status}</span>
}

/* ---------- Inputs ---------- */
export function QuantitySelector({ value, max, onChange, label = 'Quantity', size = 'md' }: { value: number; max: number; onChange: (v: number) => void; label?: string; size?: 'sm' | 'md' }) {
  const id = useId()
  const btn = cn('flex items-center justify-center text-navy-900 transition hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-30', size === 'sm' ? 'h-8 w-8' : 'h-11 w-11')
  return (
    <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white" role="group" aria-label={label}>
      <button type="button" className={cn(btn, 'rounded-l-lg')} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus className="h-4 w-4" />
      </button>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          if (!Number.isNaN(n)) onChange(Math.max(1, Math.min(max, n)))
        }}
        className={cn('border-x border-slate-200 text-center font-semibold text-navy-900 [appearance:textfield] focus:outline-none', size === 'sm' ? 'h-8 w-10 text-sm' : 'h-11 w-14')}
      />
      <button type="button" className={cn(btn, 'rounded-r-lg')} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

export function Field({ label, error, children, hint, htmlFor }: { label: string; error?: string; hint?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="field-error">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}

/* ---------- Dialogs ---------- */
const FOCUSABLE = ['button', '[href]', 'input', 'select', 'textarea', '[tabindex]'].map((s) => `${s}:not([tabindex="-1"]):not([disabled])`).join(', ')

export function Modal({ open, onClose, title, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; size?: 'md' | 'lg' }) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
      if (e.key === 'Tab' && ref.current) {
        const focusables = ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => (ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? ref.current?.querySelector<HTMLElement>(FOCUSABLE))?.focus())
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previous?.focus()
    }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn('animate-scale-in relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl', size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-md')}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 id={titleId} className="text-lg font-bold">
            {title}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close dialog">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onCancel}
      title={title}
      footer={
        <>
          <button className="btn btn-outline" onClick={onCancel} disabled={busy} data-autofocus>
            Cancel
          </button>
          <button className={cn('btn', danger ? 'btn-danger' : 'btn-primary')} onClick={onConfirm} disabled={busy}>
            {busy && <Spinner className="h-4 w-4" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-slate-600">{message}</div>
    </Modal>
  )
}

/* ---------- Layout bits ---------- */
export function DemoNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start gap-2.5 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-700', className)} role="note">
      <span className="demo-badge mt-0.5 shrink-0">Demo</span>
      <div>{children}</div>
    </div>
  )
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; to?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {item.to ? (
              <Link to={item.to} className="hover:text-navy-900 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-navy-900" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
