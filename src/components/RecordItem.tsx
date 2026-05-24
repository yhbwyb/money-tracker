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
    <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-gray-50 active:bg-gray-50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400">{formatDate(transaction.date)}</span>
          <span className="text-sm font-medium text-gray-700">{eventName}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              transaction.accountType === 'public'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {transaction.accountType === 'public' ? '公账' : '私账'}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {bankName} ({bankCardNumber})
        </div>
        {transaction.note && (
          <div className="text-xs text-gray-400 mt-0.5 truncate">{transaction.note}</div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-lg font-semibold text-gray-800">
          ¥{formatAmount(transaction.amount)}
        </span>
        <button
          onClick={onDelete}
          className="text-red-400 text-xs px-2 py-1 hover:bg-red-50 rounded"
        >
          删除
        </button>
      </div>
    </div>
  )
}
