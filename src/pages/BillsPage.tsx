import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import MonthPicker from '../components/MonthPicker'
import RecordItem from '../components/RecordItem'
import BackupBanner from '../components/BackupBanner'
import AddRecordSheet from '../components/AddRecordSheet'
import db, { type Transaction } from '../db'
import { useTransactions } from '../hooks/useTransactions'
import { useBackup } from '../hooks/useBackup'
import { getCurrentYearMonth, formatAmount } from '../utils/format'
import { computeTotals } from '../utils/totals'

export default function BillsPage() {
  const [filterMonth, setFilterMonth] = useState(getCurrentYearMonth)
  const [showAdd, setShowAdd] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [swipedId, setSwipedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [accountFilter, setAccountFilter] = useState<'all' | 'public' | 'private'>('all')
  const { transactions: monthTxns, deleteTransaction } = useTransactions(filterMonth.year, filterMonth.month)
  const allTxns = useLiveQuery(() => db.transactions.orderBy('createdAt').reverse().toArray()) ?? []
  const cards = useLiveQuery(() => db.bankCards.toArray()) ?? []
  const types = useLiveQuery(() => db.eventTypes.toArray()) ?? []
  const { shouldRemindBackup, shouldRemindByCount, dismissCountReminder } = useBackup()

  const showCountReminder = shouldRemindByCount()

  const eventMap = useMemo(
    () => new Map(types.map(t => [t.id, t.name])),
    [types],
  )
  const cardMap = useMemo(
    () => new Map(cards.map(c => [c.id, c])),
    [cards],
  )

  const isSearching = search.trim().length > 0

  const transactions = useMemo(() => {
    let result = isSearching
      ? allTxns.filter(t => {
          const q = search.trim().toLowerCase()
          if (t.note.toLowerCase().includes(q)) return true
          if (t.customer.toLowerCase().includes(q)) return true
          if (String(t.amount).includes(q)) return true
          const bankName = cardMap.get(t.bankCardId)?.bankName ?? ''
          if (bankName.toLowerCase().includes(q)) return true
          const eventName = eventMap.get(t.eventTypeId) ?? ''
          if (eventName.toLowerCase().includes(q)) return true
          return false
        })
      : monthTxns
    if (accountFilter !== 'all') {
      result = result.filter(t => t.accountType === accountFilter)
    }
    return result
  }, [isSearching, search, monthTxns, allTxns, cardMap, eventMap, accountFilter])

  const { publicTotal, privateTotal } = useMemo(
    () => computeTotals(transactions),
    [transactions],
  )

  function closeAllSwipes() { setSwipedId(null) }

  return (
    <div onTouchStart={closeAllSwipes}>
      <MonthPicker
        year={filterMonth.year}
        month={filterMonth.month}
        onChange={(y, m) => setFilterMonth({ year: y, month: m })}
      />

      <div className="px-4 pb-1">
        <div className="relative">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索客户、备注、金额、银行、事由…"
            className="input-ink w-full pr-8"
            style={{ fontSize: '0.85rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: 'var(--color-ink-muted)', opacity: 0.5 }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="divider-ink mx-6" />

      {shouldRemindBackup() && (
        <div className="mt-3">
          <BackupBanner />
        </div>
      )}

      {showCountReminder && (
        <div className="mx-4 mt-3 px-4 py-2.5 rounded-lg flex items-center justify-between"
          style={{ backgroundColor: 'var(--color-jade-light)', color: 'var(--color-jade)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          <span>已记 30+ 笔，建议前往「印鉴」留底备份</span>
          <button onClick={dismissCountReminder} className="ml-2 font-bold opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="flex mx-4 mt-3 mb-4 items-center gap-2">
        <button
          onClick={() => setAccountFilter(accountFilter === 'public' ? 'all' : 'public')}
          className={`flex-1 text-center py-3 card-paper transition-all duration-150 ${
            accountFilter === 'private' ? 'opacity-40' : ''
          }`}
          style={accountFilter === 'public' ? { boxShadow: '0 0 0 2px var(--color-vermillion)' } : undefined}
        >
          <div
            className="font-serif font-bold tracking-wider"
            style={{ fontSize: '0.65rem', color: 'var(--color-vermillion)', letterSpacing: '0.2em' }}
          >
            公账
          </div>
          <div className="font-serif font-bold mt-1 tracking-tight" style={{ fontSize: '1.1rem', color: 'var(--color-vermillion)' }}>
            ¥{formatAmount(publicTotal)}
          </div>
        </button>
        <button
          onClick={() => setAccountFilter(accountFilter === 'private' ? 'all' : 'private')}
          className={`flex-1 text-center py-3 card-paper transition-all duration-150 ${
            accountFilter === 'public' ? 'opacity-40' : ''
          }`}
          style={accountFilter === 'private' ? { boxShadow: '0 0 0 2px var(--color-ink)' } : undefined}
        >
          <div
            className="font-serif font-bold tracking-wider"
            style={{ fontSize: '0.65rem', color: 'var(--color-ink-light)', letterSpacing: '0.2em' }}
          >
            私账
          </div>
          <div className="font-serif font-bold mt-1 tracking-tight" style={{ fontSize: '1.1rem' }}>
            ¥{formatAmount(privateTotal)}
          </div>
        </button>
      </div>


      {/* Records */}
      <div className="pb-24">
        {transactions.length === 0 && (
          <div className="text-center py-20" style={{ color: 'var(--color-ink-muted)' }}>
            <div className="font-serif mb-2" style={{ fontSize: '2.5rem', opacity: 0.2 }}>
              {isSearching ? '寻' : '簿'}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.45, letterSpacing: '0.08em' }}>
              {isSearching ? '未找到匹配记录' : '尚无记录 · 点右下朱印记一笔'}
            </div>
          </div>
        )}
        {transactions.map(t => (
          <RecordItem
            key={t.id}
            transaction={t}
            eventName={eventMap.get(t.eventTypeId) ?? '未知'}
            bankName={cardMap.get(t.bankCardId)?.bankName ?? '未知'}
            bankCardNumber={cardMap.get(t.bankCardId)?.cardNumber ?? ''}
            isOpen={swipedId === t.id}
            onOpen={() => setSwipedId(t.id!)}
            onClose={() => setSwipedId(null)}
            onDelete={() => deleteTransaction(t.id!)}
            onEdit={() => setEditingTransaction(t)}
          />
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setShowAdd(true); setEditingTransaction(null) }}
        className="fab-ink fixed bottom-28 right-5 w-14 h-14 rounded-2xl flex items-center justify-center z-30"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.5rem',
          fontWeight: 700,
          background: 'var(--color-vermillion)',
        }}
        aria-label="记账"
      >
        记
      </button>

      {(showAdd || editingTransaction !== null) && (
        <AddRecordSheet
          onClose={() => { setShowAdd(false); setEditingTransaction(null) }}
          onSaved={(date) => {
            const [y, m] = date.split('-')
            setFilterMonth({ year: parseInt(y), month: parseInt(m) })
            setShowAdd(false)
            setEditingTransaction(null)
          }}
          transaction={editingTransaction || undefined}
        />
      )}
    </div>
  )
}
