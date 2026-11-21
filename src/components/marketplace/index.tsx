import { Link } from 'react-router-dom'
import { Baby, Book, Car, CookingPot, Dumbbell, Footprints, Gem, Gift, HeartPulse, House, PawPrint, Shirt, ShoppingBag, Smartphone, Sparkles, Wrench, type LucideIcon } from 'lucide-react'
import type { Category, CategoryIcon as CategoryIconKey, Seller, SellerStatus } from '@/types'
import { cn } from '@/lib/format'

export const CATEGORY_ICON_MAP: Record<CategoryIconKey, LucideIcon> = {
  shirt: Shirt,
  sparkles: Sparkles,
  baby: Baby,
  gem: Gem,
  'heart-pulse': HeartPulse,
  house: House,
  'cooking-pot': CookingPot,
  wrench: Wrench,
  smartphone: Smartphone,
  footprints: Footprints,
  dumbbell: Dumbbell,
  gift: Gift,
  book: Book,
  car: Car,
  paw: PawPrint,
  'shopping-bag': ShoppingBag,
}

/** Colour palette offered when an admin creates a category. */
export const CATEGORY_COLORS = ['#db2777', '#e11d48', '#ea580c', '#d97706', '#ca8a04', '#16a34a', '#059669', '#0891b2', '#2563eb', '#4f46e5', '#7c3aed', '#9333ea', '#c026d3', '#0b1f45']

/** Translucent tint of a hex colour, for chip and bubble backgrounds. */
export const tint = (hex: string, alpha = 0.12) =>
  `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`

export function CategoryIcon({ category, className }: { category: Pick<Category, 'icon'>; className?: string }) {
  const Icon = CATEGORY_ICON_MAP[category.icon] ?? ShoppingBag
  return <Icon className={className} aria-hidden />
}

/** Round coloured icon bubble, used in the category strip and admin tables. */
export function CategoryBubble({ category, size = 'md' }: { category: Pick<Category, 'icon' | 'color'>; size?: 'sm' | 'md' | 'lg' }) {
  const box = { sm: 'h-8 w-8', md: 'h-12 w-12', lg: 'h-16 w-16 sm:h-20 sm:w-20' }[size]
  const icon = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-7 w-7 sm:h-9 sm:w-9' }[size]
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-full', box)} style={{ backgroundColor: tint(category.color, 0.14), color: category.color }}>
      <CategoryIcon category={category} className={icon} />
    </span>
  )
}

/** Small coloured text label for a product's category. */
export function CategoryLabel({ category, className }: { category?: Pick<Category, 'name' | 'color'>; className?: string }) {
  if (!category) return null
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase', className)} style={{ color: category.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: category.color }} aria-hidden />
      {category.name}
    </span>
  )
}

/** Toggle chip coloured with the category accent when selected. */
export function CategoryChip({ category, active, onClick }: { category: Pick<Category, 'name' | 'color' | 'icon'>; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition"
      style={active ? { backgroundColor: category.color, borderColor: category.color, color: '#fff' } : { borderColor: tint(category.color, 0.35), color: category.color, backgroundColor: tint(category.color, 0.06) }}
    >
      <CategoryIcon category={category} className="h-3.5 w-3.5" />
      {category.name}
    </button>
  )
}

export const shopInitials = (name: string) =>
  name
    .replace(/\(.*?\)/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')

export function SellerAvatar({ seller, size = 'md' }: { seller: Pick<Seller, 'shopName' | 'color'>; size?: 'sm' | 'md' | 'lg' }) {
  const box = { sm: 'h-8 w-8 text-[11px]', md: 'h-11 w-11 text-sm', lg: 'h-16 w-16 text-xl' }[size]
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-xl font-extrabold text-white', box)} style={{ backgroundColor: seller.color }} aria-hidden>
      {shopInitials(seller.shopName)}
    </span>
  )
}

/** "Sold by" link to the seller's shop page. */
export function SoldBy({ seller, className }: { seller?: Seller; className?: string }) {
  if (!seller) return null
  return (
    <p className={cn('text-xs text-slate-500', className)}>
      Sold by{' '}
      <Link to={`/sellers/${seller.slug}`} className="font-semibold text-navy-800 hover:underline">
        {seller.shopName}
      </Link>
    </p>
  )
}

const SELLER_STATUS_STYLES: Record<SellerStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
  suspended: 'bg-slate-100 text-slate-600 ring-slate-300',
}

export const SELLER_STATUS_LABELS: Record<SellerStatus, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
}

export function SellerStatusBadge({ status }: { status: SellerStatus }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1', SELLER_STATUS_STYLES[status])}>{SELLER_STATUS_LABELS[status]}</span>
}
