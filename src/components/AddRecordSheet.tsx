import { useState } from 'react'
import { useBankCards } from '../hooks/useBankCards'
import { useEventTypes } from '../hooks/useEventTypes'
import { useTransactions } from '../hooks/useTransactions'
import { getCurrentYearMonth, todayStr } from '../utils/format'

interface Props {
  onClose: () => void
  onSaved: () => void
}

export default function AddRecordSheet({ onClose, onSaved }: Props) {
  const { year, month } = getCurrentYearMonth()
  const { addTransaction } = useTransactions(year, month)
  const { cards } = useBankCards()
  const { types } = useEventTypes()

  const [date, setDate] = useState(todayStr())
  const [eventTypeId, setEventTypeId] = useState(types[0]?.id ?? 0)
  const [bankCardId, setBankCardId] = useState(cards[0]?.id ?? 0)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const selectedCard = cards.find(c => c.id === bankCardId)

  async function handleSubmit() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    if (!eventTypeId || !bankCardId) return

    await addTransaction({
      date,
      eventTypeId,
      bankCardId,
      accountType: selectedCard?.accountType ?? 'private',
      amount: amt,
      note,
    })
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-2xl px-5 py-4 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center text-lg font-semibold mb-4">记一笔</div>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-1">日期</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base"
          />
        </div>

        {/* Event Type */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-1">事件</label>
          <div className="flex flex-wrap gap-2">
            {types.map(t => (
              <button
                key={t.id}
                onClick={() => setEventTypeId(t.id!)}
                className={`px-4 py-2 rounded-full text-sm ${
                  eventTypeId === t.id
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bank Card */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-1">银行卡</label>
          <select
            value={bankCardId}
            onChange={e => setBankCardId(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base bg-white"
          >
            {cards.length === 0 && <option value={0}>请先在配置中添加银行卡</option>}
            {cards.map(c => (
              <option key={c.id} value={c.id}>
                {c.bankName} ({c.cardNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Account Type (auto) */}
        {selectedCard && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">账户类型：</span>
            <span
              className={`text-sm px-2 py-0.5 rounded ${
                selectedCard.accountType === 'public'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {selectedCard.accountType === 'public' ? '公账' : '私账'}
            </span>
          </div>
        )}

        {/* Amount */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-1">金额</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400 text-lg">¥</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              inputMode="decimal"
              className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-lg font-semibold"
            />
          </div>
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-1">备注（选填）</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="添加备注..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-700 text-white rounded-xl py-3 text-lg font-semibold active:bg-blue-800"
        >
          提交
        </button>

        <div className="h-6" />
      </div>
    </div>
  )
}
