import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db'

export function useBankCards() {
  const cards = useLiveQuery(() => db.bankCards.toArray())

  return {
    cards: cards ?? [],
    addCard: async (cardNumber: string, bankName: string, accountType: 'public' | 'private') => {
      await db.bankCards.add({ cardNumber, bankName, accountType })
    },
    deleteCard: async (id: number) => {
      await db.bankCards.delete(id)
    },
  }
}
