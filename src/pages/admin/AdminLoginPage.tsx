import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, KeyRound, LogIn } from 'lucide-react'
import { Field, Logo, Spinner } from '@/components/ui'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useToast } from '@/context/ToastContext'
import { DEMO_ADMIN } from '@/services/authService'

export default function AdminLoginPage() {
  const { session, login } = useAdminAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  if (session) return <Navigate to={from} replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof fieldErrors = {}
    if (!email.trim()) errs.email = 'Enter the admin email.'
    if (!password) errs.password = 'Enter the password.'
    setFieldErrors(errs)
    setError(null)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      await login(email, password)
      toast.success('Welcome back', 'Signed in to the VIENTo demo admin.')
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.')
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy-950 lg:block">
        <img src="/images/products/sealer-blue-features.jpeg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo light />
          <div>
            <h2 className="max-w-md text-4xl font-extrabold text-white">Manage products, inventory and orders in one place.</h2>
            <p className="mt-4 max-w-md text-navy-200">The VIENTo admin dashboard demo. Every change here is reflected on the storefront immediately.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-900">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to store
          </Link>
          <div className="mt-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold">Admin sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to the demo admin dashboard.</p>

          <form onSubmit={submit} noValidate className="mt-8 space-y-5">
            <Field label="Email" htmlFor="admin-email" error={fieldErrors.email}>
              <input id="admin-email" type="email" autoComplete="username" className="input" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={fieldErrors.email ? true : undefined} />
            </Field>
            <Field label="Password" htmlFor="admin-password" error={fieldErrors.password}>
              <div className="relative">
                <input id="admin-password" type={show ? 'text' : 'password'} autoComplete="current-password" className="input pr-11" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={fieldErrors.password ? true : undefined} />
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
              {busy ? <Spinner className="h-5 w-5" /> : <LogIn className="h-5 w-5" aria-hidden />} Sign in
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-gold-200 bg-gold-50 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-gold-700">
              <KeyRound className="h-4 w-4" aria-hidden /> Demo credentials
            </p>
            <dl className="mt-3 space-y-1 font-mono text-sm text-navy-900">
              <div className="flex gap-2">
                <dt className="text-slate-500">Email:</dt>
                <dd>{DEMO_ADMIN.email}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-slate-500">Password:</dt>
                <dd>{DEMO_ADMIN.password}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="btn btn-outline btn-sm mt-4"
              onClick={() => {
                setEmail(DEMO_ADMIN.email)
                setPassword(DEMO_ADMIN.password)
                setFieldErrors({})
              }}
            >
              Use demo credentials
            </button>
            <p className="mt-3 text-xs text-gold-700">For demonstration only. This is not real authentication and must not be used in production.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
