import { useState, useMemo } from 'react'
import MonthPicker from '../components/MonthPicker'
import RecordItem from '../components/RecordItem'
import BackupBanner from '../components/BackupBanner'
import AddRecordSheet from '../components/AddRecordSheet'
import { useTransactions } from '../hooks/useTransactions'
import { useBankCards } from '../hooks/useBankCards'
import { useEventTypes } from '../hooks/useEventTypes'
import { useBackup } from '../hooks/useBackup'
import { getCurrentYearMonth, formatAmount } from '../utils/format'

export default function BillsPage() {
  const [filterMonth, setFilterMonth] = useState(getCurrentYearMonth)
  const [showAdd, setShowAdd] = useState(false)
  const [swipedId, setSwipedId] = useState<number | null>(null)
  const { transactions, deleteTransaction } = useTransactions(filterMonth?.year, filterMonth?.month)
  const { cards } = useBankCards()
  const { types } = useEventTypes()
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

  const publicTotal = useMemo(
    () => transactions.filter(t => t.accountType === 'public').reduce((s, t) => s + t.amount, 0),
    [transactions],
  )
  const privateTotal = useMemo(
    () => transactions.filter(t => t.accountType === 'private').reduce((s, t) => s + t.amount, 0),
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
      <div className="flex mx-4 mt-3 mb-4">
        <div className="flex-1 text-center py-3 card-paper mr-2">
          <div
            className="font-serif font-bold tracking-wider"
            style={{ fontSize: '0.65rem', color: 'var(--color-vermillion)', letterSpacing: '0.2em' }}
          >
            公账
          </div>
          <div className="font-serif font-bold mt-1 tracking-tight" style={{ fontSize: '1.1rem', color: 'var(--color-vermillion)' }}>
            ¥{formatAmount(publicTotal)}
          </div>
        </div>
        <div className="flex-1 text-center py-3 card-paper ml-2">
          <div
            className="font-serif font-bold tracking-wider"
            style={{ fontSize: '0.65rem', color: 'var(--color-ink-light)', letterSpacing: '0.2em' }}
          >
            私账
          </div>
          <div className="font-serif font-bold mt-1 tracking-tight" style={{ fontSize: '1.1rem' }}>
            ¥{formatAmount(privateTotal)}
          </div>
        </div>
      </div>

      {/* Records */}
      <div className="pb-24">
        {transactions.length === 0 && (
          <div className="text-center py-20" style={{ color: 'var(--color-ink-muted)' }}>
            <div className="font-serif mb-2" style={{ fontSize: '2.5rem', opacity: 0.2 }}>簿</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.45, letterSpacing: '0.08em' }}>
              尚无记录 · 点右下朱印记一笔
            </div>
          </div>
        )}
        {(() => {
          // Group by date, with subtle header between groups
          let lastDate = ''
          return transactions.map(t => {
            const showHeader = t.date !== lastDate
            lastDate = t.date
            return (
              <div key={t.id}>
                {showHeader && (
                  <div
                    className="mx-4 mt-3 mb-1 font-serif tracking-wider"
                    style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', opacity: 0.5, letterSpacing: '0.1em' }}
                  >
                    {t.date}
                  </div>
                )}
                <RecordItem
                  transaction={t}
                  eventName={eventMap.get(t.eventTypeId) ?? '未知'}
                  bankName={cardMap.get(t.bankCardId)?.bankName ?? '未知'}
                  bankCardNumber={cardMap.get(t.bankCardId)?.cardNumber ?? ''}
                  isOpen={swipedId === t.id}
                  onOpen={() => setSwipedId(t.id!)}
                  onDelete={() => deleteTransaction(t.id!)}
                />
              </div>
            )
          })
        })()}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
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

      {showAdd && (
        <AddRecordSheet
          onClose={() => setShowAdd(false)}
          onSaved={(date) => {
            const [y, m] = date.split('-')
            setFilterMonth({ year: parseInt(y), month: parseInt(m) })
            setShowAdd(false)
          }}
        />
      )}
    </div>
  )
}
