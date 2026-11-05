// Order numbers the customer has verified (order number + email) in this browser.
const KEY = 'viento.demo.v1.verifiedOrders'

export const readVerified = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export const markVerified = (orderNumber: string) => localStorage.setItem(KEY, JSON.stringify([...new Set([...readVerified(), orderNumber])]))

export const clearVerified = () => localStorage.removeItem(KEY)
