import { Check, CircleDot, ClipboardCheck, Home, PackageCheck, Truck } from 'lucide-react'
import type { Order } from '@/types'
import { ORDER_STATUSES } from '@/types'
import { cn, formatDateTime } from '@/lib/format'

const ICONS = [ClipboardCheck, Check, PackageCheck, Truck, Home]

export default function OrderTimeline({ order }: { order: Order }) {
  const current = ORDER_STATUSES.indexOf(order.status)
  return (
    <ol className="relative grid gap-0 md:grid-cols-5" aria-label="Order progress">
      {ORDER_STATUSES.map((status, i) => {
        const event = order.statusHistory.find((e) => e.status === status)
        const done = i <= current
        const isCurrent = i === current
        const Icon = ICONS[i]
        return (
          <li key={status} className="relative flex gap-4 pb-8 md:flex-col md:items-center md:pb-0 md:text-center" aria-current={isCurrent ? 'step' : undefined}>
            {i < ORDER_STATUSES.length - 1 && (
              <span
                className={cn('absolute top-11 left-[21px] h-[calc(100%-2.75rem)] w-0.5 md:top-[21px] md:left-[calc(50%+26px)] md:h-0.5 md:w-[calc(100%-52px)]', i < current ? 'bg-navy-900' : 'bg-slate-200')}
                aria-hidden
              />
            )}
            <span
              className={cn(
                'relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition',
                done ? 'border-navy-900 bg-navy-900 text-gold-300' : 'border-slate-200 bg-white text-slate-300',
                isCurrent && 'ring-4 ring-gold-300/50',
              )}
            >
              {isCurrent ? <CircleDot className="h-5 w-5" aria-hidden /> : <Icon className="h-5 w-5" aria-hidden />}
            </span>
            <div className="md:mt-3">
              <p className={cn('text-sm font-bold', done ? 'text-navy-900' : 'text-slate-400')}>{status}</p>
              <p className="mt-0.5 text-xs text-slate-500">{event ? formatDateTime(event.at) : done ? 'Completed' : 'Pending'}</p>
              {isCurrent && event && <p className="mt-1 text-xs text-slate-600 md:max-w-[11rem]">{event.note}</p>}
              <span className="sr-only">{done ? (isCurrent ? '(current step)' : '(completed)') : '(upcoming)'}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
