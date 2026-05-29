export const CUSTOMER_HISTORY_KEY = 'customerHistory'
export const MAX_CUSTOMER_HISTORY = 20

export function getCustomerHistory(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOMER_HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveCustomerToHistory(customer: string) {
  const trimmed = customer.trim()
  if (!trimmed) return
  const list = getCustomerHistory().filter(n => n !== trimmed)
  list.unshift(trimmed)
  localStorage.setItem(CUSTOMER_HISTORY_KEY, JSON.stringify(list.slice(0, MAX_CUSTOMER_HISTORY)))
}
