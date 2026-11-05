import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Banknote, CreditCard, Lock, ShoppingBag, Smartphone, Sparkles } from 'lucide-react'
import { Breadcrumbs, DemoNotice, EmptyState, Field, PageLoader, ProductImage, Spinner } from '@/components/ui'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { OrderSummary } from './CartPage'
import type { PaymentMethod, ShippingAddress } from '@/types'
import { cn, formatPrice } from '@/lib/format'

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const PAYMENT_OPTIONS: Array<{ id: PaymentMethod; title: string; description: string; icon: typeof CreditCard }> = [
  { id: 'demo-card', title: 'Simulated card payment', description: 'Instantly approved. No card details are requested or stored.', icon: CreditCard },
  { id: 'demo-upi', title: 'Simulated UPI payment', description: 'Instantly approved demo UPI transaction.', icon: Smartphone },
  { id: 'cod', title: 'Cash on delivery', description: 'Payment marked as pending until delivery.', icon: Banknote },
]

type FormState = Required<Omit<ShippingAddress, 'addressLine2'>> & { addressLine2: string }
type Errors = Partial<Record<keyof FormState, string>>

const EMPTY: FormState = { fullName: '', email: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '' }
const SAMPLE: FormState = { fullName: 'Arjun Verma', email: 'arjun.verma@example.com', phone: '9812345678', addressLine1: '42, MG Road, Near City Mall', addressLine2: 'Shop No. 3', city: 'Pune', state: 'Maharashtra', postalCode: '411001' }

const validate = (f: FormState): Errors => {
  const e: Errors = {}
  if (f.fullName.trim().length < 2) e.fullName = 'Enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email address.'
  if (!/^[6-9]\d{9}$/.test(f.phone.replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''))) e.phone = 'Enter a valid 10-digit Indian mobile number.'
  if (f.addressLine1.trim().length < 5) e.addressLine1 = 'Enter your street address.'
  if (f.city.trim().length < 2) e.city = 'Enter your city.'
  if (!f.state) e.state = 'Select your state.'
  if (!/^[1-9]\d{5}$/.test(f.postalCode.trim())) e.postalCode = 'Enter a valid 6-digit PIN code.'
  return e
}

export default function CheckoutPage() {
  const cart = useCart()
  const { placeOrder, loading } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState(false)
  const [payment, setPayment] = useState<PaymentMethod>('demo-card')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  if (loading) return <PageLoader label="Preparing checkout…" />

  if (cart.lines.length === 0 && !submitting)
    return (
      <div className="container-page py-16">
        <div className="card">
          <EmptyState
            icon={<ShoppingBag className="h-8 w-8" />}
            title="Nothing to check out yet"
            description="Your cart is empty. Add a product to place a demo order."
            action={
              <Link to="/products" className="btn btn-primary">
                Browse products
              </Link>
            }
          />
        </div>
      </div>
    )

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const next = { ...form, [key]: e.target.value }
    setForm(next)
    if (touched) setErrors(validate(next))
  }

  const inputProps = (key: keyof FormState) => ({
    id: key,
    name: key,
    value: form[key],
    onChange: set(key),
    className: 'input',
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `${key}-error` : undefined,
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    setSubmitError(null)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast.error('Please check your details', 'Some required fields need attention.')
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus()
      return
    }
    setSubmitting(true)
    try {
      const order = await placeOrder({
        customer: { ...form, phone: form.phone.replace(/[\s-]/g, ''), addressLine2: form.addressLine2 || undefined },
        items: cart.lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        paymentMethod: payment,
      })
      navigate(`/order-confirmation/${order.orderNumber}`, { replace: true })
      cart.clear()
      toast.success('Demo order placed', `Order ${order.orderNumber} has been created.`)
    } catch (err) {
      setSubmitting(false)
      const message = err instanceof Error ? err.message : 'Unable to place the order. Please try again.'
      setSubmitError(message)
      toast.error('Order not placed', message)
    }
  }

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">Checkout</h1>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => { setForm(SAMPLE); setErrors({}) }}>
          <Sparkles className="h-3.5 w-3.5" aria-hidden /> Fill sample details
        </button>
      </div>
      <DemoNotice className="mt-6">This is a <strong>demo checkout</strong>. No real payment is processed and no card information is collected. Placing an order creates a sample order and reduces demo stock.</DemoNotice>

      <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="card p-6 sm:p-8" aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="text-lg font-bold">
              1. Contact details
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
                  <input {...inputProps('fullName')} autoComplete="name" />
                </Field>
              </div>
              <Field label="Email address" htmlFor="email" error={errors.email} hint="Used to look up your order later.">
                <input {...inputProps('email')} type="email" autoComplete="email" />
              </Field>
              <Field label="Phone number" htmlFor="phone" error={errors.phone}>
                <input {...inputProps('phone')} type="tel" autoComplete="tel" placeholder="10-digit mobile" />
              </Field>
            </div>
          </section>

          <section className="card p-6 sm:p-8" aria-labelledby="shipping-heading">
            <h2 id="shipping-heading" className="text-lg font-bold">
              2. Shipping address
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Address line 1" htmlFor="addressLine1" error={errors.addressLine1}>
                  <input {...inputProps('addressLine1')} autoComplete="address-line1" placeholder="House / shop number, street" />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Address line 2 (optional)" htmlFor="addressLine2">
                  <input {...inputProps('addressLine2')} autoComplete="address-line2" placeholder="Landmark, area" />
                </Field>
              </div>
              <Field label="City" htmlFor="city" error={errors.city}>
                <input {...inputProps('city')} autoComplete="address-level2" />
              </Field>
              <Field label="State" htmlFor="state" error={errors.state}>
                <select {...inputProps('state')} autoComplete="address-level1">
                  <option value="">Select state</option>
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="PIN code" htmlFor="postalCode" error={errors.postalCode}>
                <input {...inputProps('postalCode')} inputMode="numeric" maxLength={6} autoComplete="postal-code" />
              </Field>
            </div>
          </section>

          <section className="card p-6 sm:p-8" aria-labelledby="payment-heading">
            <div className="flex items-center justify-between">
              <h2 id="payment-heading" className="text-lg font-bold">
                3. Payment method
              </h2>
              <span className="demo-badge">Simulated</span>
            </div>
            <div className="mt-6 grid gap-3" role="radiogroup" aria-labelledby="payment-heading">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={cn('flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition', payment === opt.id ? 'border-navy-900 bg-navy-50/50' : 'border-slate-200 hover:border-slate-300')}
                >
                  <input type="radio" name="payment" value={opt.id} checked={payment === opt.id} onChange={() => setPayment(opt.id)} className="mt-1 h-4 w-4 accent-navy-900" />
                  <opt.icon className="mt-0.5 h-5 w-5 shrink-0 text-navy-700" aria-hidden />
                  <span>
                    <span className="block font-semibold text-navy-900">{opt.title}</span>
                    <span className="block text-sm text-slate-500">{opt.description}</span>
                  </span>
                </label>
              ))}
            </div>
            {payment !== 'cod' && (
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                <Lock className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                Demo mode: the payment will be marked as <strong className="text-navy-900">Paid</strong> automatically. No payment gateway is connected.
              </div>
            )}
          </section>
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-28" aria-label="Order summary">
          <h2 className="text-lg font-bold">Order summary</h2>
          <ul className="mt-5 divide-y divide-slate-100">
            {cart.lines.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-3 py-3">
                <div className="relative shrink-0">
                  <ProductImage src={product.images[0]} alt="" className="h-14 w-14 rounded-lg" />
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-navy-900 px-1 text-[10px] font-bold text-white">{quantity}</span>
                </div>
                <p className="min-w-0 flex-1 text-sm font-medium text-navy-900">{product.name}</p>
                <p className="text-sm font-semibold whitespace-nowrap">{formatPrice(product.price * quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <OrderSummary subtotal={cart.subtotal} shipping={cart.shipping} total={cart.total} />
          </div>
          {submitError && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {submitError}{' '}
              <Link to="/cart" className="font-semibold underline">
                Review cart
              </Link>
            </p>
          )}
          <button type="submit" className="btn btn-gold btn-lg mt-6 w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner className="h-5 w-5" /> Processing demo payment…
              </>
            ) : (
              <>Place Demo Order · {formatPrice(cart.total)}</>
            )}
          </button>
          <p className="mt-3 text-center text-xs text-slate-500">By placing this demo order you agree to the sample <Link to="/policies/terms" className="underline">terms</Link>.</p>
        </aside>
      </form>
    </div>
  )
}
