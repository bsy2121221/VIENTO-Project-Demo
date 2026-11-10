import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/format'

const BANNER = '/images/banner'
const COUNTER = 'linear-gradient(to bottom, rgba(243,233,214,0) 0%, rgba(240,228,206,0.9) 28%, #f3e9d6 100%)'

/** One cut-out product per range, arranged on a warm "counter top" like a festive shop window. */
const ITEMS = [
  { label: 'Home Decoration', to: '/collections/home-decor-gifts', src: `${BANNER}/cushion.webp`, alt: 'Hand-beaded coral cushion cover', className: 'right-[4%] bottom-[13%] w-[32%] rotate-[5deg] z-10' },
  { label: 'Home & Kitchen', to: '/collections/home-kitchen', src: `${BANNER}/thali.webp`, alt: 'Golden bronze thali dinner set', className: 'left-[25%] bottom-[9%] w-[50%] z-20' },
  { label: 'Power Tools', to: '/collections/power-tools', src: `${BANNER}/blower.webp`, alt: 'VIENTo red electric air blower', className: 'left-[0%] bottom-[3%] w-[45%] z-30' },
]

/** Soft out-of-focus lights in the background, like diyas and fairy lights. */
const BOKEH = [
  'top-[8%] left-[52%] h-24 w-24',
  'top-[18%] right-[6%] h-32 w-32',
  'top-[4%] right-[30%] h-14 w-14',
  'top-[34%] right-[18%] h-10 w-10',
  'top-[12%] left-[70%] h-8 w-8',
  'bottom-[42%] left-[44%] h-16 w-16',
]

function Divider() {
  return (
    <div className="flex items-center gap-3 text-gold-300" aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-300 sm:w-20" />
      <Sparkles className="h-4 w-4" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-300 sm:w-20" />
    </div>
  )
}

export default function HeroBanner({ maxDiscount }: { maxDiscount: number }) {
  return (
    <section className="container-page pt-6" aria-label="Festive sale">
      <div
        className="relative grid overflow-hidden rounded-[2rem] lg:min-h-[540px] lg:grid-cols-[5fr_7fr]"
        style={{
          background:
            'radial-gradient(circle at 78% 30%, rgba(226,192,91,0.38), transparent 42%), radial-gradient(circle at 8% 100%, rgba(242,107,29,0.28), transparent 38%), linear-gradient(135deg, #071431 0%, #0b1f45 45%, #3b220c 100%)',
        }}
      >
        {BOKEH.map((b) => (
          <span key={b} className={cn('pointer-events-none absolute rounded-full bg-gold-200/40 blur-xl', b)} aria-hidden />
        ))}

        {/* Counter top spanning the whole banner on desktop */}
        <div className="absolute inset-x-0 bottom-0 hidden h-[17%] lg:block" style={{ background: COUNTER }} aria-hidden />

        {/* Copy */}
        <div className="animate-fade-up relative z-40 flex flex-col items-start justify-center px-7 pt-12 pb-4 sm:px-12 lg:py-16">
          <Divider />
          <p className="mt-4 text-sm font-bold tracking-[0.35em] text-gold-200 sm:text-base">FESTIVE SALE</p>
          <h1 className="mt-3 leading-none font-extrabold text-white">
            <span className="block text-2xl tracking-wide sm:text-3xl">{maxDiscount > 0 ? 'UP TO' : 'FESTIVE'}</span>
            <span className="mt-1 block bg-gradient-to-b from-white via-gold-100 to-gold-300 bg-clip-text text-6xl tracking-tight text-transparent sm:text-7xl xl:text-8xl">
              {maxDiscount > 0 ? `${maxDiscount}% OFF` : 'OFFERS'}
            </span>
          </h1>
          <div className="mt-5">
            <Divider />
          </div>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-navy-100 sm:text-lg">
            On <span className="font-semibold text-white">Home Decoration</span>, <span className="font-semibold text-white">Power Tools</span> and{' '}
            <span className="font-semibold text-white">Home &amp; Kitchen</span>. Celebrate with handcrafted pieces and tools that last.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {ITEMS.map((it) => (
              <Link key={it.label} to={it.to} className="rounded-full border border-white/25 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:border-gold-300 hover:bg-gold-300 hover:text-navy-950">
                {it.label}
              </Link>
            ))}
          </div>
          <Link to="/products" className="btn btn-gold btn-lg group relative mt-7 rounded-full px-9 shadow-lg shadow-gold-600/30">
            Shop now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>

        {/* Product scene */}
        <div className="relative h-[230px] sm:h-[360px] lg:h-auto">
          <div className="absolute inset-x-0 bottom-0 h-[30%] lg:hidden" style={{ background: COUNTER }} aria-hidden />
          {ITEMS.map((it) => (
            <Link key={it.label} to={it.to} className={cn('absolute block transition duration-500 hover:-translate-y-2', it.className)} aria-label={`Shop ${it.label}`}>
              <img src={it.src} alt={it.alt} className="w-full drop-shadow-[0_18px_22px_rgba(7,20,49,0.45)]" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
