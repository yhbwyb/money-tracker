import { useState } from 'react'
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
  const [current, setCurrent] = useState(getCurrentYearMonth)
  const [showAdd, setShowAdd] = useState(false)
  const { transactions, deleteTransaction } = useTransactions(current.year, current.month)
  const { cards } = useBankCards()
  const { types } = useEventTypes()
  const { shouldRemindBackup } = useBackup()

  const eventMap = new Map(types.map(t => [t.id, t.name]))
  const cardMap = new Map(cards.map(c => [c.id, c]))

  const publicTotal = transactions
    .filter(t => t.accountType === 'public')
    .reduce((s, t) => s + t.amount, 0)

  const privateTotal = transactions
    .filter(t => t.accountType === 'private')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <div>
      <MonthPicker
        year={current.year}
        month={current.month}
        onChange={(y, m) => setCurrent({ year: y, month: m })}
      />

      {shouldRemindBackup() && <BackupBanner />}

      {/* Summary */}
      <div className="flex gap-4 px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex-1 text-center">
          <div className="text-xs text-orange-500">公账合计</div>
          <div className="text-base font-semibold">¥{formatAmount(publicTotal)}</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xs text-blue-500">私账合计</div>
          <div className="text-base font-semibold">¥{formatAmount(privateTotal)}</div>
        </div>
      </div>

      {/* Records */}
      <div>
        {transactions.length === 0 && (
          <div className="text-center text-gray-400 py-20">暂无记录，点击右下角开始记账</div>
        )}
        {transactions.map(t => (
          <RecordItem
            key={t.id}
            transaction={t}
            eventName={eventMap.get(t.eventTypeId) ?? '未知'}
            bankName={cardMap.get(t.bankCardId)?.bankName ?? '未知'}
            bankCardNumber={cardMap.get(t.bankCardId)?.cardNumber ?? ''}
            onDelete={() => deleteTransaction(t.id!)}
          />
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-700 text-white rounded-full shadow-lg
                   flex items-center justify-center text-2xl active:bg-blue-800 z-30"
      >
        +
      </button>

      {showAdd && (
        <AddRecordSheet
          onClose={() => setShowAdd(false)}
          onSaved={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
