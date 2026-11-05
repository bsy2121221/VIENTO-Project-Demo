import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/format'

type ToastKind = 'success' | 'error' | 'info'
interface Toast {
  id: number
  kind: ToastKind
  title: string
  description?: string
}

interface ToastApi {
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info }
const ACCENTS = { success: 'text-emerald-600', error: 'text-red-600', info: 'text-navy-700' }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback(
    (kind: ToastKind, title: string, description?: string) => {
      const id = nextId.current++
      setToasts((t) => [...t.slice(-3), { id, kind, title, description }])
      setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3800)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (t, d) => push('success', t, d),
      error: (t, d) => push('error', t, d),
      info: (t, d) => push('info', t, d),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end">
        {toasts.map((t) => {
          const Icon = ICONS[t.kind]
          return (
            <div
              key={t.id}
              role={t.kind === 'error' ? 'alert' : 'status'}
              className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-navy-900/10"
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', ACCENTS[t.kind])} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-navy-900">{t.title}</p>
                {t.description && <p className="mt-0.5 text-sm text-slate-600">{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="rounded p-0.5 text-slate-400 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-navy-600" aria-label="Dismiss notification">
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
