import { useState } from 'react'
import { BarChart3, Table2 } from 'lucide-react'
import { cn, formatPrice } from '@/lib/format'

export interface MonthPoint {
  label: string
  revenue: number
  orders: number
}

const compact = (v: number) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)

/** Single-series bar chart: monthly demo revenue. Hover or focus a bar for details. */
export default function SalesChart({ data }: { data: MonthPoint[] }) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(...data.map((d) => d.revenue), 1)
  // 20% headroom keeps the tooltip of the tallest bar clear of the view toggle.
  const niceMax = Math.ceil((max * 1.2) / 20000) * 20000
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * niceMax)

  return (
    <div>
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5" role="group" aria-label="Chart view">
          {(['chart', 'table'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={cn('inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium', view === v ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>
              {v === 'chart' ? <BarChart3 className="h-3.5 w-3.5" aria-hidden /> : <Table2 className="h-3.5 w-3.5" aria-hidden />}
              {v === 'chart' ? 'Chart' : 'Table'}
            </button>
          ))}
        </div>
      </div>

      {view === 'table' ? (
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="py-2 font-medium">Month</th>
              <th className="py-2 text-right font-medium">Orders</th>
              <th className="py-2 text-right font-medium">Revenue (demo)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label} className="border-b border-slate-100">
                <td className="py-2 text-navy-900">{d.label}</td>
                <td className="py-2 text-right tabular-nums">{d.orders}</td>
                <td className="py-2 text-right font-semibold tabular-nums text-navy-900">{formatPrice(d.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="mt-4 flex gap-3">
          {/* Y axis */}
          <div className="relative h-64 w-10 shrink-0 text-right text-[11px] text-slate-400" aria-hidden>
            {ticks.map((t) => (
              <span key={t} className="absolute right-0 tabular-nums" style={{ bottom: `${(t / niceMax) * 100}%`, transform: 'translateY(50%)' }}>
                {compact(t)}
              </span>
            ))}
          </div>
          <div className="relative flex-1">
            {/* Grid */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64" aria-hidden>
              {ticks.map((t) => (
                <div key={t} className={cn('absolute inset-x-0 border-t', t === 0 ? 'border-slate-300' : 'border-dashed border-slate-100')} style={{ bottom: `${(t / niceMax) * 100}%` }} />
              ))}
            </div>
            <ul className="relative flex h-64 items-end justify-around gap-2" aria-label="Monthly revenue, sample data">
              {data.map((d, i) => {
                const h = (d.revenue / niceMax) * 100
                const isActive = active === i
                return (
                  <li key={d.label} className="relative flex h-full flex-1 items-end justify-center">
                    <button
                      className="group flex h-full w-full max-w-16 items-end justify-center focus:outline-none"
                      onMouseEnter={() => setActive(i)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(i)}
                      onBlur={() => setActive(null)}
                      aria-label={`${d.label}: ${formatPrice(d.revenue)} from ${d.orders} orders`}
                    >
                      <span
                        className={cn('w-full max-w-9 rounded-t-[4px] transition-all duration-300', i === data.length - 1 ? 'bg-gold-400' : 'bg-navy-800', isActive ? 'opacity-100' : active !== null ? 'opacity-50' : 'opacity-100', 'group-focus-visible:ring-2 group-focus-visible:ring-gold-400 group-focus-visible:ring-offset-2')}
                        style={{ height: `${Math.max(h, 1)}%` }}
                      />
                    </button>
                    {isActive && (
                      <div className="animate-scale-in pointer-events-none absolute z-10 -translate-y-2 rounded-lg bg-navy-950 px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg" style={{ bottom: `${h}%` }} role="tooltip">
                        <p className="font-semibold">{d.label}</p>
                        <p className="text-navy-200">
                          {formatPrice(d.revenue)} · {d.orders} orders
                        </p>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
            <div className="mt-2 flex justify-around gap-2 text-xs text-slate-500" aria-hidden>
              {data.map((d, i) => (
                <span key={d.label} className={cn('flex-1 text-center', i === data.length - 1 && 'font-semibold text-navy-900')}>
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-slate-500">Earlier months use mock baseline figures; demo orders placed in each month are added on top. Current month highlighted in gold.</p>
    </div>
  )
}
