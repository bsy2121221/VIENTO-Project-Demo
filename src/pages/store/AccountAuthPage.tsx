import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, LogIn, UserPlus } from 'lucide-react'
import { Field, Spinner } from '@/components/ui'
import { useCustomerAuth } from '@/context/CustomerAuthContext'
import { useToast } from '@/context/ToastContext'
import { DEMO_CUSTOMER } from '@/services/customerAuthService'

type Mode = 'login' | 'register'
type Form = { name: string; email: string; phone: string; password: string }
type Errors = Partial<Record<keyof Form, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const validate = (mode: Mode, f: Form): Errors => {
  const e: Errors = {}
  if (mode === 'register' && f.name.trim().length < 2) e.name = 'Enter your full name.'
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address.'
  if (mode === 'register' && !/^[6-9]\d{9}$/.test(f.phone.replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''))) e.phone = 'Enter a valid 10-digit Indian mobile number.'
  if (mode === 'login' && !f.password) e.password = 'Enter your password.'
  if (mode === 'register' && f.password.length < 6) e.password = 'Use at least 6 characters.'
  return e
}

export default function AccountAuthPage({ mode }: { mode: Mode }) {
  const { user, login, register } = useCustomerAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/orders'
  const [form, setForm] = useState<Form>({ name: '', email: '', phone: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [error, setError] = useState<string | null>(null)
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  if (user && !busy) return <Navigate to={from} replace />

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(mode, form)
    setErrors(errs)
    setError(null)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      const s = mode === 'login' ? await login(form.email, form.password) : await register(form)
      toast.success(mode === 'login' ? `Welcome back, ${s.name.split(' ')[0]}` : 'Account created', mode === 'login' ? 'You are signed in to the VIENTo demo store.' : 'You are now signed in.')
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setBusy(false)
    }
  }

  const input = (k: keyof Form) => ({
    id: `acct-${k}`,
    className: 'input',
    value: form[k],
    onChange: set(k),
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `acct-${k}-error` : undefined,
  })

  const isLogin = mode === 'login'

  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold sm:text-3xl">{isLogin ? 'Sign in to your account' : 'Create your account'}</h1>
          <p className="mt-2 text-sm text-slate-500">{isLogin ? 'See your orders and track deliveries in one place.' : 'Save your details for faster checkout and order tracking.'}</p>

          <form onSubmit={submit} noValidate className="mt-7 space-y-5">
            {!isLogin && (
              <Field label="Full name" htmlFor="acct-name" error={errors.name}>
                <input {...input('name')} autoComplete="name" />
              </Field>
            )}
            <Field label="Email address" htmlFor="acct-email" error={errors.email}>
              <input {...input('email')} type="email" autoComplete="email" />
            </Field>
            {!isLogin && (
              <Field label="Mobile number" htmlFor="acct-phone" error={errors.phone}>
                <input {...input('phone')} type="tel" autoComplete="tel" inputMode="numeric" />
              </Field>
            )}
            <Field label="Password" htmlFor="acct-password" error={errors.password} hint={isLogin ? undefined : 'At least 6 characters.'}>
              <div className="relative">
                <input {...input('password')} type={show ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'} className="input pr-11" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:text-navy-900" aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={busy}>
              {busy ? <Spinner className="h-5 w-5" /> : isLogin ? <LogIn className="h-5 w-5" aria-hidden /> : <UserPlus className="h-5 w-5" aria-hidden />}
              {isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {isLogin ? 'New to VIENTo? ' : 'Already have an account? '}
            <Link to={isLogin ? '/register' : '/login'} state={location.state} className="font-semibold text-navy-700 underline-offset-2 hover:underline">
              {isLogin ? 'Create an account' : 'Sign in'}
            </Link>
          </p>
        </div>

        {isLogin && (
          <div className="mt-6 rounded-xl border border-gold-200 bg-gold-50 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-gold-700">
              <KeyRound className="h-4 w-4" aria-hidden /> Demo customer account
            </p>
            <dl className="mt-3 space-y-1 font-mono text-sm text-navy-900">
              <div className="flex gap-2">
                <dt className="text-slate-500">Email:</dt>
                <dd>{DEMO_CUSTOMER.email}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-slate-500">Password:</dt>
                <dd>{DEMO_CUSTOMER.password}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="btn btn-outline btn-sm mt-4"
              onClick={() => {
                setForm((f) => ({ ...f, email: DEMO_CUSTOMER.email, password: DEMO_CUSTOMER.password }))
                setErrors({})
              }}
            >
              Use demo account
            </button>
            <p className="mt-3 text-xs text-gold-700">For demonstration only. Accounts are stored in this browser and are not real authentication.</p>
          </div>
        )}
      </div>
    </div>
  )
}
