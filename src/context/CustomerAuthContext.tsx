import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { customerAuthService, type CustomerSession } from '@/services/customerAuthService'

interface CustomerAuthState {
  user: CustomerSession | null
  login: (email: string, password: string) => Promise<CustomerSession>
  register: (input: { name: string; email: string; phone: string; password: string }) => Promise<CustomerSession>
  logout: () => void
}

const CustomerAuthContext = createContext<CustomerAuthState | null>(null)

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerSession | null>(customerAuthService.current)

  const value = useMemo<CustomerAuthState>(
    () => ({
      user,
      async login(email, password) {
        const s = await customerAuthService.login(email, password)
        setUser(s)
        return s
      },
      async register(input) {
        const s = await customerAuthService.register(input)
        setUser(s)
        return s
      },
      logout() {
        customerAuthService.logout()
        setUser(null)
      },
    }),
    [user],
  )

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>
}

export const useCustomerAuth = () => {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be used inside CustomerAuthProvider')
  return ctx
}

/** Sends signed-out visitors to /login and brings them back afterwards. */
export function RequireCustomer({ children }: { children: ReactNode }) {
  const { user } = useCustomerAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return <>{children}</>
}
