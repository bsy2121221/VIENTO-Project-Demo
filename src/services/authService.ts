// DEMO ONLY. Credentials are checked in the browser and are not a security boundary.
// Replace with POST /api/auth/login (JWT or cookie auth) when the backend is added.
import { ApiError, latency } from './mockDb'

export const DEMO_ADMIN = { email: 'admin@vientodemo.com', password: 'Demo@123', name: 'Demo Admin' } as const

const SESSION_KEY = 'viento.demo.v1.adminSession'

export interface AdminSession {
  email: string
  name: string
  signedInAt: string
}

export const authService = {
  async login(email: string, password: string): Promise<AdminSession> {
    await latency(600)
    if (email.trim().toLowerCase() !== DEMO_ADMIN.email || password !== DEMO_ADMIN.password)
      throw new ApiError('Incorrect email or password. Use the demo credentials shown below.', 401)
    const session = { email: DEMO_ADMIN.email, name: DEMO_ADMIN.name, signedInAt: new Date().toISOString() }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return session
  },
  logout() {
    localStorage.removeItem(SESSION_KEY)
  },
  current(): AdminSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as AdminSession) : null
    } catch {
      return null
    }
  },
}
