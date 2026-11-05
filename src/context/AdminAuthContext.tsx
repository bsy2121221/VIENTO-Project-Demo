import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { authService, type AdminSession } from '@/services/authService'

interface AdminAuthState {
  session: AdminSession | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthState | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(authService.current)

  const value = useMemo<AdminAuthState>(
    () => ({
      session,
      async login(email, password) {
        setSession(await authService.login(email, password))
      },
      logout() {
        authService.logout()
        setSession(null)
      },
    }),
    [session],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return ctx
}
