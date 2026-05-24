import { formatAmount, formatDate } from '../utils/format'
import type { Transaction } from '../db'

interface Props {
  transaction: Transaction
  eventName: string
  bankName: string
  bankCardNumber: string
  onDelete: () => void
}

export default function RecordItem({
  transaction,
  eventName,
  bankName,
  bankCardNumber,
  onDelete,
}: Props) {
  return (
    <div
      className="card-paper mx-4 mb-2 px-4 py-3 flex items-center justify-between active:opacity-70 transition-opacity"
    >
      <div className="flex-1 min-w-0">
        {/* Top row */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs opacity-40 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
            {formatDate(transaction.date)}
          </span>

          <span
            className={transaction.accountType === 'public' ? 'seal-public' : 'seal-private'}
          >
            {transaction.accountType === 'public' ? '公' : '私'}
          </span>

          <span
            className="font-medium"
            style={{ fontSize: '0.875rem', letterSpacing: '0.03em' }}
          >
            {eventName}
          </span>
        </div>

        {/* Bottom row */}
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-35">
            {bankName} · {bankCardNumber}
          </span>
          {transaction.note && (
            <span
              className="text-xs opacity-25 truncate max-w-[120px]"
              style={{ fontStyle: 'italic' }}
            >
              {transaction.note}
            </span>
          )}
        </div>
      </div>

      {/* Amount + Delete */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className="font-serif font-bold tracking-tight tabular-nums"
          style={{ fontSize: '1.05rem', letterSpacing: '-0.02em' }}
        >
          ¥{formatAmount(transaction.amount)}
        </span>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--color-ink-muted)', fontSize: '0.7rem', padding: '0.25rem' }}
        >
          删
        </button>
      </div>
    </div>
  )
}
