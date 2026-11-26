import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { BadgeCheck, CheckCircle2, ClipboardList, IndianRupee, MapPin, PackageCheck, PackageSearch, Rocket, Store, Truck, Users } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import InfiniteProductGrid, { PRODUCT_GRID } from '@/components/product/InfiniteProductGrid'
import { CategoryIcon, SellerAvatar, tint } from '@/components/marketplace'
import { Breadcrumbs, EmptyState, ErrorState, Field, PageLoader, SkeletonCard, Spinner } from '@/components/ui'
import { useCatalog, useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { DEFAULT_COMMISSION } from '@/services/sellerService'
import { cn, formatDate } from '@/lib/format'
import type { Seller, SellerApplication } from '@/types'

/* ======================================================================
   /sell: marketing page + seller application form
   ====================================================================== */

const STEPS = [
  { icon: ClipboardList, title: 'Apply', text: 'Tell us about your business and what you sell.' },
  { icon: BadgeCheck, title: 'Get verified', text: 'Our team reviews your details, usually within 48 hours.' },
  { icon: PackageCheck, title: 'List products', text: 'Add your catalogue with photos, prices and stock.' },
  { icon: Rocket, title: 'Start selling', text: 'Receive orders, ship them and get paid.' },
]

const PERKS = [
  { icon: Users, title: 'Customers across India', color: '#db2777' },
  { icon: IndianRupee, title: `${DEFAULT_COMMISSION}% standard commission`, color: '#9333ea' },
  { icon: Truck, title: 'Shipping support', color: '#2563eb' },
  { icon: Store, title: 'Your own shop page', color: '#ea580c' },
]

type FormValues = Omit<SellerApplication, 'categoryIds'> & { categoryIds: string[]; agree: boolean }
type Errors = Partial<Record<keyof FormValues, string>>

const EMPTY: FormValues = { shopName: '', ownerName: '', email: '', phone: '', city: '', state: '', gstin: '', categoryIds: [], description: '', agree: false }

const validate = (v: FormValues): Errors => {
  const e: Errors = {}
  if (v.shopName.trim().length < 3) e.shopName = 'Enter your shop or brand name (at least 3 characters).'
  if (v.ownerName.trim().length < 2) e.ownerName = 'Enter the owner or contact person name.'
  if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = 'Enter a valid email address.'
  if (!/^[6-9]\d{9}$/.test(v.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter a valid 10-digit Indian mobile number.'
  if (!v.city.trim()) e.city = 'Enter your city.'
  if (!v.state.trim()) e.state = 'Enter your state.'
  if (v.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(v.gstin.trim())) e.gstin = 'GSTIN should be 15 characters, e.g. 08ABCDE1234F1Z5. Leave blank if you do not have one yet.'
  if (v.categoryIds.length === 0) e.categoryIds = 'Choose at least one category you want to sell in.'
  if (v.description.trim().length < 20) e.description = 'Tell us a little about your products (at least 20 characters).'
  if (!v.agree) e.agree = 'Please accept the seller terms to continue.'
  return e
}

export function SellPage() {
  const { categories } = useCatalog()
  const { applyAsSeller } = useStore()
  const toast = useToast()
  const [params] = useSearchParams()
  const preselected = params.get('category')
  const [values, setValues] = useState<FormValues>(() => ({ ...EMPTY, categoryIds: preselected ? [preselected] : [] }))
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState<Seller | null>(null)

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const text = (key: Exclude<keyof FormValues, 'categoryIds' | 'agree'>) => ({
    id: `sell-${key}`,
    value: values[key] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key, e.target.value),
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `sell-${key}-error` : undefined,
    className: 'input',
  })

  const toggleCategory = (id: string) =>
    set('categoryIds', values.categoryIds.includes(id) ? values.categoryIds.filter((c) => c !== id) : [...values.categoryIds, id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(`sell-${Object.keys(found)[0]}`)?.focus()
      return
    }
    setBusy(true)
    try {
      const { agree: _agree, ...application } = values
      const seller = await applyAsSeller(application)
      setSubmitted(seller)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      toast.error('Could not submit application', err instanceof Error ? err.message : 'Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-rainbow relative overflow-hidden text-white">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-white/10" aria-hidden />
        <div className="absolute -right-24 -bottom-40 h-96 w-96 rounded-full bg-white/10" aria-hidden />
        <div className="container-page relative py-14 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wider uppercase">
            <Store className="h-3.5 w-3.5" aria-hidden /> VIENTo for sellers
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl leading-[1.1] font-extrabold text-white sm:text-5xl">Grow your business on India's colourful marketplace</h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">List your products in {categories.length}+ categories and reach new customers. No setup fee. Pay a small commission only when you sell.</p>
          <ul className="mt-8 flex flex-wrap gap-3">
            {PERKS.map(({ icon: Icon, title }) => (
              <li key={title} className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                <Icon className="h-4 w-4" aria-hidden /> {title}
              </li>
            ))}
          </ul>
          <a href="#apply" className="btn btn-lg mt-8 rounded-full bg-white font-bold text-navy-900 hover:bg-white/90">
            Apply now
          </a>
        </div>
      </section>

      {/* Steps */}
      <section className="container-page py-14" aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="text-center text-2xl font-extrabold sm:text-3xl">
          Start selling in 4 simple steps
        </h2>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text: body }, i) => (
            <li key={title} className="card relative p-6">
              <span className="absolute top-5 right-5 text-4xl font-extrabold text-slate-100">{i + 1}</span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ backgroundColor: PERKS[i].color }}>
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Application */}
      <section id="apply" className="scroll-mt-32 bg-slate-50 py-14" aria-labelledby="apply-heading">
        <div className="container-page max-w-3xl">
          {submitted ? (
            <div className="card p-8 text-center sm:p-12" role="status">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-9 w-9" aria-hidden />
              </span>
              <h2 className="mt-5 text-2xl font-extrabold">Application received!</h2>
              <p className="mx-auto mt-2 max-w-md text-slate-600">
                Thank you, {submitted.ownerName}. <strong>{submitted.shopName}</strong> is now <strong>pending review</strong>. Our seller team will contact you at {submitted.email} within 48 hours.
              </p>
              <p className="mt-4 text-xs text-slate-500">
                <span className="demo-badge mr-1.5">Demo</span> Open the admin panel → Sellers to approve this application.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link to="/" className="btn btn-primary rounded-full">
                  Back to home
                </Link>
                <button
                  type="button"
                  className="btn btn-outline rounded-full"
                  onClick={() => {
                    setSubmitted(null)
                    setValues(EMPTY)
                  }}
                >
                  Submit another application
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="card p-6 sm:p-10">
              <h2 id="apply-heading" className="text-2xl font-extrabold">
                Seller application
              </h2>
              <p className="mt-1 text-sm text-slate-500">All fields are required unless marked optional.</p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field label="Shop / brand name" htmlFor="sell-shopName" error={errors.shopName}>
                  <input {...text('shopName')} placeholder="e.g. Jaipur Bandhej House" autoComplete="organization" />
                </Field>
                <Field label="Owner / contact person" htmlFor="sell-ownerName" error={errors.ownerName}>
                  <input {...text('ownerName')} autoComplete="name" />
                </Field>
                <Field label="Business email" htmlFor="sell-email" error={errors.email}>
                  <input {...text('email')} type="email" autoComplete="email" />
                </Field>
                <Field label="Mobile number" htmlFor="sell-phone" error={errors.phone}>
                  <input {...text('phone')} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile" />
                </Field>
                <Field label="City" htmlFor="sell-city" error={errors.city}>
                  <input {...text('city')} autoComplete="address-level2" />
                </Field>
                <Field label="State" htmlFor="sell-state" error={errors.state}>
                  <input {...text('state')} autoComplete="address-level1" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="GSTIN (optional)" htmlFor="sell-gstin" error={errors.gstin} hint="Required before your first payout. You can add it later.">
                    <input {...text('gstin')} className="input uppercase" maxLength={15} />
                  </Field>
                </div>
              </div>

              <fieldset className="mt-6">
                <legend className="label">What will you sell?</legend>
                <div id="sell-categoryIds" tabIndex={-1} className="mt-1 flex flex-wrap gap-2 focus:outline-none" role="group" aria-describedby={errors.categoryIds ? 'sell-categoryIds-error' : undefined}>
                  {categories.map((c) => {
                    const on = values.categoryIds.includes(c.id)
                    return (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleCategory(c.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition"
                        style={on ? { backgroundColor: c.color, borderColor: c.color, color: '#fff' } : { borderColor: tint(c.color, 0.35), color: c.color, backgroundColor: tint(c.color, 0.05) }}
                      >
                        {on ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : <CategoryIcon category={c} className="h-3.5 w-3.5" />}
                        {c.name}
                      </button>
                    )
                  })}
                </div>
                {errors.categoryIds && (
                  <p id="sell-categoryIds-error" className="field-error">
                    {errors.categoryIds}
                  </p>
                )}
              </fieldset>

              <div className="mt-6">
                <Field label="About your products" htmlFor="sell-description" error={errors.description}>
                  <textarea {...text('description')} rows={4} placeholder="What do you make or sell? Roughly how many products? Do you ship yourself?" />
                </Field>
              </div>

              <label className="mt-6 flex items-start gap-3 text-sm text-slate-700">
                <input
                  id="sell-agree"
                  type="checkbox"
                  checked={values.agree}
                  onChange={(e) => set('agree', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-navy-900"
                  aria-invalid={errors.agree ? true : undefined}
                />
                <span>
                  I confirm the details are correct and agree to the seller terms, including a {DEFAULT_COMMISSION}% standard commission per order (demo terms).
                </span>
              </label>
              {errors.agree && <p className="field-error">{errors.agree}</p>}

              <button type="submit" className="bg-rainbow btn btn-lg mt-8 w-full rounded-full font-bold text-white" disabled={busy}>
                {busy ? <Spinner className="h-5 w-5" /> : <Store className="h-5 w-5" aria-hidden />} {busy ? 'Submitting…' : 'Submit application'}
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">Demo only: applications are saved in this browser and no data is sent anywhere.</p>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

/* ======================================================================
   /sellers/:slug: public shop page for an approved seller
   ====================================================================== */

export function SellerShopPage() {
  const { slug } = useParams()
  const { products, sellers, categories, loading, error, reload } = useCatalog()
  const [category, setCategory] = useState('all')
  const seller = sellers.find((s) => s.slug === slug)

  const own = useMemo(() => products.filter((p) => p.sellerId === seller?.id), [products, seller])
  const ownCategories = categories.filter((c) => own.some((p) => p.categoryId === c.id))
  const shown = category === 'all' ? own : own.filter((p) => p.categoryId === category)

  if (error) return <ErrorState message={error} onRetry={reload} />
  if (loading) return <PageLoader label="Loading shop…" />
  if (!seller)
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<Store className="h-8 w-8" />}
          title="Shop not found"
          description="This seller may not be active on VIENTo right now."
          action={
            <Link to="/products" className="btn btn-primary">
              Browse all products
            </Link>
          }
        />
      </div>
    )

  return (
    <div>
      <div className="border-b border-slate-200" style={{ background: `linear-gradient(120deg, ${tint(seller.color, 0.16)} 0%, ${tint(seller.color, 0.04)} 55%, #fff 100%)` }}>
        <div className="container-page py-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Sellers' }, { label: seller.shopName }]} />
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <SellerAvatar seller={seller} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 text-3xl font-extrabold">
                {seller.shopName}
                {seller.isOfficial && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 ring-1 ring-sky-200">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Official store
                  </span>
                )}
              </h1>
              <p className="mt-1 max-w-2xl text-slate-600">{seller.description}</p>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden /> {seller.city}, {seller.state}
                </span>
                <span>
                  {own.length} product{own.length === 1 ? '' : 's'}
                </span>
                <span>Selling since {formatDate(seller.createdAt)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        {ownCategories.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter shop by category">
            <button
              type="button"
              onClick={() => setCategory('all')}
              aria-pressed={category === 'all'}
              className={cn('shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold', category === 'all' ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 text-slate-700')}
            >
              All ({own.length})
            </button>
            {ownCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                aria-pressed={category === c.id}
                className="shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold"
                style={category === c.id ? { backgroundColor: c.color, borderColor: c.color, color: '#fff' } : { borderColor: tint(c.color, 0.35), color: c.color }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className={PRODUCT_GRID}>
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="card">
            <EmptyState icon={<PackageSearch className="h-8 w-8" />} title="No products listed yet" description="This seller is setting up their catalogue. Check back soon." />
          </div>
        ) : (
          <InfiniteProductGrid products={shown} resetKey={category} render={(p) => <ProductCard key={p.id} product={p} />} />
        )}
      </div>
    </div>
  )
}
