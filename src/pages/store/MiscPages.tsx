import { Link, NavLink, useParams } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Breadcrumbs, DemoNotice, EmptyState } from '@/components/ui'
import { cn } from '@/lib/format'

const POLICIES: Record<string, { title: string; sections: Array<[string, string]> }> = {
  shipping: {
    title: 'Shipping Policy',
    sections: [
      ['Dispatch time', 'Orders placed before 4 PM on a business day are packed and dispatched within 24 hours. Orders placed on Sundays and public holidays are dispatched the next business day.'],
      ['Delivery timelines', 'Metro cities usually receive orders in 2–4 business days and other locations in 4–7 business days. A tracking number is shared once the order is handed to the courier.'],
      ['Shipping charges', 'Shipping is free for orders of ₹2,000 and above. A flat charge of ₹99 applies to smaller orders.'],
      ['Damaged in transit', 'If the outer carton is visibly damaged, please record an unboxing video and contact support within 48 hours so we can arrange a replacement.'],
    ],
  },
  returns: {
    title: 'Returns & Warranty',
    sections: [
      ['1-year guarantee', 'VIENTo sealing machines carry a one-year manufacturer guarantee against manufacturing defects from the date of delivery.'],
      ['What is covered', 'Electrical faults, defective timer circuits and body defects are covered. Heating elements and Teflon cloth are consumables and are not covered under warranty.'],
      ['Returns', 'Unused products in original packaging can be returned within 7 days of delivery. Spare parts that have been installed cannot be returned.'],
      ['How to raise a request', 'Contact support with your order number, a short description and a photo or video of the issue. Our team responds within one business day.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['Information we collect', 'We collect the name, contact details and shipping address you provide at checkout so that we can deliver your order and keep you updated.'],
      ['How we use it', 'Your details are used only to process orders, provide support and send service updates. We do not sell personal information.'],
      ['Payments', 'Payments in the live store will be handled by a certified payment gateway. VIENTo will not store card details on its servers.'],
      ['This demo', 'In this demonstration, all information stays in your own browser’s local storage and is never sent to a server.'],
    ],
  },
  terms: {
    title: 'Terms of Use',
    sections: [
      ['Demo website', 'This website is a client demonstration. Products, prices, stock levels, orders and testimonials are sample data and do not represent real offers.'],
      ['Orders', 'Orders placed here are simulated. No goods will be shipped and no payment will be collected.'],
      ['Product information', 'Specifications are provided for illustration and will be confirmed by VIENTo before the production launch.'],
    ],
  },
}

export function PolicyPage() {
  const { slug = '' } = useParams()
  const policy = POLICIES[slug]
  if (!policy) return <NotFoundPage />
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: policy.title }]} />
      <div className="mt-8 grid gap-10 lg:grid-cols-4">
        <nav aria-label="Policies" className="lg:col-span-1">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {Object.entries(POLICIES).map(([key, p]) => (
              <li key={key}>
                <NavLink to={`/policies/${key}`} className={({ isActive }) => cn('block rounded-lg px-3 py-2 text-sm font-medium', isActive ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>
                  {p.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <article className="lg:col-span-3">
          <h1 className="text-3xl font-extrabold">{policy.title}</h1>
          <DemoNotice className="mt-4">Sample policy text prepared for the demo. Final wording will be supplied by VIENTo.</DemoNotice>
          <div className="mt-8 space-y-8">
            {policy.sections.map(([h, body]) => (
              <section key={h}>
                <h2 className="text-lg font-bold">{h}</h2>
                <p className="mt-2 leading-relaxed text-slate-600">{body}</p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="container-page py-20">
      <EmptyState
        icon={<Compass className="h-8 w-8" />}
        title="Page not found"
        description="The page you are looking for doesn't exist or has moved."
        action={
          <div className="flex gap-3">
            <Link to="/" className="btn btn-primary">
              Go home
            </Link>
            <Link to="/products" className="btn btn-outline">
              Shop products
            </Link>
          </div>
        }
      />
    </div>
  )
}
