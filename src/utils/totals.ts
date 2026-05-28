import type { Transaction } from '../db'

export function computeTotals(transactions: Transaction[]) {
  let publicTotal = 0
  let privateTotal = 0
  for (const t of transactions) {
    if (t.accountType === 'public') publicTotal += t.amount
    else privateTotal += t.amount
  }
  return { publicTotal, privateTotal, total: publicTotal + privateTotal }
}
