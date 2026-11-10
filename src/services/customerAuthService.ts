// DEMO ONLY. Customer accounts live in this browser's localStorage and passwords are stored in plain text.
// Replace with POST /api/customers/register and POST /api/customers/login (JWT or cookie auth) when the backend is added.
import { ApiError, latency } from './mockDb'

export interface CustomerSession {
  name: string
  email: string
  phone: string
  signedInAt: string
}

interface CustomerAccount {
  name: string
  email: string
  phone: string
  password: string
}

/** Matches the "Rahul Mehta (Demo)" seed order, so My Orders has history straight away. */
export const DEMO_CUSTOMER = { name: 'Rahul Mehta', email: 'rahul.demo@example.com', phone: '9876500022', password: 'Demo@123' } as const

const ACCOUNTS_KEY = 'viento.demo.v1.customers'
const SESSION_KEY = 'viento.demo.v1.customerSession'

const readAccounts = (): CustomerAccount[] => {
  try {
    const list = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]') as CustomerAccount[]
    return list.some((a) => a.email === DEMO_CUSTOMER.email) ? list : [{ ...DEMO_CUSTOMER }, ...list]
  } catch {
    return [{ ...DEMO_CUSTOMER }]
  }
}

const startSession = (a: CustomerAccount): CustomerSession => {
  const session = { name: a.name, email: a.email, phone: a.phone, signedInAt: new Date().toISOString() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export const customerAuthService = {
  async login(email: string, password: string): Promise<CustomerSession> {
    await latency(600)
    const account = readAccounts().find((a) => a.email === email.trim().toLowerCase())
    if (!account || account.password !== password) throw new ApiError('Incorrect email or password. Try the demo account shown below.', 401)
    return startSession(account)
  },
  async register(input: { name: string; email: string; phone: string; password: string }): Promise<CustomerSession> {
    await latency(700)
    const accounts = readAccounts()
    const email = input.email.trim().toLowerCase()
    if (accounts.some((a) => a.email === email)) throw new ApiError('An account with this email already exists. Please sign in instead.', 409)
    const account = { name: input.name.trim(), email, phone: input.phone.replace(/[\s-]/g, ''), password: input.password }
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]))
    return startSession(account)
  },
  logout() {
    localStorage.removeItem(SESSION_KEY)
  },
  current(): CustomerSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as CustomerSession) : null
    } catch {
      return null
    }
  },
}
