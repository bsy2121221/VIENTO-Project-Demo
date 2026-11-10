import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Gift, Mail, MapPin, Phone, Send, ShieldCheck, Truck, Wrench } from 'lucide-react'
import { Breadcrumbs, DemoNotice, Field, Spinner } from '@/components/ui'
import { useCustomerAuth } from '@/context/CustomerAuthContext'
import { useToast } from '@/context/ToastContext'
import { latency } from '@/services/mockDb'

/* ---------- About Us ---------- */
const VALUES = [
  { icon: Wrench, title: 'Built for daily use', body: 'Our sealers are made for shop counters and packing lines that run all day, with genuine spare parts always in stock.' },
  { icon: Gift, title: 'Handcrafted décor', body: 'Our Home Décor & Gifts range brings hand-beaded cushions, placemats and runners made by skilled artisans.' },
  { icon: ShieldCheck, title: '1-year guarantee', body: 'Every VIENTo machine is backed by a one-year manufacturer guarantee and responsive after-sales support.' },
  { icon: Truck, title: 'Pan-India delivery', body: 'We ship across India, with free delivery on orders above ₹2,000 and tracking on every order.' },
]

export function AboutPage() {
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About Us' }]} />
      <section className="mt-8 grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow">About VIENTo</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Packaging tools and handcrafted décor, made to last.</h1>
          <p className="mt-5 leading-relaxed text-slate-600">
            VIENTo started with one goal: give small businesses packaging equipment that is simple, reliable and fairly priced. Today our poly sealers, impulse sealers and band sealers are used by
            sweet shops, bakeries, spice packers and wholesalers across India.
          </p>
          <p className="mt-4 leading-relaxed text-slate-600">
            We have since added a Home Décor &amp; Gifts range of hand-beaded pieces for homes, festivals and corporate gifting, chosen with the same care for quality.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/products" className="btn btn-primary">
              Shop products
            </Link>
            <Link to="/contact" className="btn btn-outline">
              Contact us
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <img src="/images/products/sealer-orange-studio.jpeg" alt="VIENTo orange poly sealing machine" className="aspect-square w-full rounded-2xl object-cover shadow-lg" />
          <img src="/images/products/decor-placemat-fern-ivory.jpeg" alt="Hand-beaded ivory and gold fern placemat" className="mt-8 aspect-square w-full rounded-2xl object-cover shadow-lg" />
        </div>
      </section>

      <section className="mt-16" aria-labelledby="values-heading">
        <h2 id="values-heading" className="text-2xl font-extrabold">
          What we stand for
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-gold-300">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-bold text-navy-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <DemoNotice className="mt-10">Sample company text prepared for the demo. Final wording will be supplied by VIENTo.</DemoNotice>
    </div>
  )
}

/* ---------- Contact Us ---------- */
type ContactForm = { name: string; email: string; phone: string; message: string }
type ContactErrors = Partial<Record<keyof ContactForm, string>>

export function ContactPage() {
  const { user } = useCustomerAuth()
  const toast = useToast()
  const blank = (): ContactForm => ({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '', message: '' })
  const [form, setForm] = useState<ContactForm>(blank)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: ContactErrors = {}
    if (form.name.trim().length < 2) errs.name = 'Enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errs.email = 'Enter a valid email address.'
    if (form.message.trim().length < 10) errs.message = 'Tell us a little more (at least 10 characters).'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    await latency(700)
    setBusy(false)
    setForm({ ...blank(), message: '' })
    toast.success('Message sent', 'Thanks for reaching out. Our team will reply within one business day. (Demo: no message was actually sent.)')
  }

  const input = (k: keyof ContactForm) => ({
    id: `contact-${k}`,
    className: 'input',
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value })),
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `contact-${k}-error` : undefined,
  })

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact Us' }]} />
      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-extrabold">Contact us</h1>
        <p className="mt-1 text-slate-600">Questions about a product, a bulk order or an existing order? We are happy to help.</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={submit} noValidate className="card space-y-5 p-6 sm:p-8 lg:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="contact-name" error={errors.name}>
              <input {...input('name')} autoComplete="name" />
            </Field>
            <Field label="Email address" htmlFor="contact-email" error={errors.email}>
              <input {...input('email')} type="email" autoComplete="email" />
            </Field>
          </div>
          <Field label="Mobile number (optional)" htmlFor="contact-phone">
            <input {...input('phone')} type="tel" autoComplete="tel" />
          </Field>
          <Field label="Message" htmlFor="contact-message" error={errors.message}>
            <textarea {...input('message')} rows={5} placeholder="How can we help?" />
          </Field>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" aria-hidden />} Send message
          </button>
        </form>

        <aside className="space-y-4">
          {[
            { icon: MapPin, label: 'Address', value: 'VIENTo Packaging Solutions, Industrial Area Phase II, India' },
            { icon: Phone, label: 'Phone', value: '+91 90000 00000 (demo)' },
            { icon: Mail, label: 'Email', value: 'support@vientodemo.com' },
            { icon: Clock, label: 'Support hours', value: 'Mon–Sat, 10 AM – 7 PM IST' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card flex items-start gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-navy-900">{value}</p>
              </div>
            </div>
          ))}
          <DemoNotice>Sample contact details. The form does not send real messages in this demo.</DemoNotice>
        </aside>
      </div>
    </div>
  )
}
