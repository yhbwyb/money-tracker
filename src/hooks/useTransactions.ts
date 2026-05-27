import { useLiveQuery } from 'dexie-react-hooks'
import db, { type Transaction } from '../db'
import { getMonthRange } from '../utils/format'

export function useTransactions(year?: number, month?: number) {
  const range = year != null && month != null ? getMonthRange(year, month) : null

  const transactions = useLiveQuery(
    () => {
      if (range) {
        return db.transactions
          .where('date')
          .between(range.start, range.end, true, true)
          .reverse()
          .sortBy('createdAt')
      }
      return db.transactions.orderBy('createdAt').reverse().toArray()
    },
    [year, month]
  )

  return {
    transactions: transactions ?? [],
    addTransaction: async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
      await db.transactions.add({ ...data, createdAt: Date.now() })
    },
    deleteTransaction: async (id: number) => {
      await db.transactions.delete(id)
    },
  }
}
