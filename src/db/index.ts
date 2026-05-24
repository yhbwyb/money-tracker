import Dexie, { type EntityTable } from 'dexie'

export interface BankCard {
  id?: number
  cardNumber: string
  bankName: string
  accountType: 'public' | 'private'
}

export interface EventType {
  id?: number
  name: string
}

export interface Transaction {
  id?: number
  date: string
  eventTypeId: number
  bankCardId: number
  accountType: 'public' | 'private'
  amount: number
  note: string
  createdAt: number
}

const db = new Dexie('MoneyTrackerDB') as Dexie & {
  bankCards: EntityTable<BankCard, 'id'>
  eventTypes: EntityTable<EventType, 'id'>
  transactions: EntityTable<Transaction, 'id'>
}

db.version(1).stores({
  bankCards: '++id',
  eventTypes: '++id',
  transactions: '++id, date, eventTypeId, bankCardId, accountType',
})

db.on('populate', () => {
  db.eventTypes.bulkAdd([
    { id: 1, name: '发货' },
    { id: 2, name: '物流' },
    { id: 3, name: '网购' },
    { id: 4, name: '其它' },
  ])
})

export default db
