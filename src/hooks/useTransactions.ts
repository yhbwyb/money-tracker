import { useLiveQuery } from 'dexie-react-hooks'
import db, { type Transaction } from '../db'
import { getMonthRange } from '../utils/format'

export function useTransactions(year: number, month: number) {
  const { start, end } = getMonthRange(year, month)

  const transactions = useLiveQuery(
    () => db.transactions
      .where('date')
      .between(start, end, true, true)
      .reverse()
      .sortBy('createdAt'),
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
