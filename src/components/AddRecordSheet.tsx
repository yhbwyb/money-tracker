import { useState, useEffect, useRef } from 'react'
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
  const [eventTypeId, setEventTypeId] = useState(0)
  const [bankCardId, setBankCardId] = useState(0)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Drag handle to dismiss
  const dragStart = useRef(0)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)

  function handleDragStart(e: React.TouchEvent) {
    dragStart.current = e.touches[0].clientY
    setDragging(true)
  }

  function handleDragMove(e: React.TouchEvent) {
    if (!dragging) return
    const dy = e.touches[0].clientY - dragStart.current
    if (dy > 0) {
      setDragY(dy)
      e.preventDefault()
    }
  }

  function handleDragEnd() {
    setDragging(false)
    if (dragY > 100) {
      onClose()
    } else {
      setDragY(0)
    }
  }

  // Sync selections when data loads
  useEffect(() => {
    if (types.length > 0 && eventTypeId === 0) {
      setEventTypeId(types[0].id!)
    }
  }, [types, eventTypeId])

  useEffect(() => {
    if (cards.length > 0 && bankCardId === 0) {
      setBankCardId(cards[0].id!)
    }
  }, [cards, bankCardId])

  const selectedCard = cards.find(c => c.id === bankCardId)

  async function handleSubmit() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) {
      alert('请输入金额')
      return
    }
    if (cards.length === 0) {
      alert('请先在「印鉴」中添加银行卡')
      return
    }
    if (types.length === 0) {
      alert('请先在「印鉴」中添加事由')
      return
    }

    setSubmitting(true)
    await addTransaction({
      date,
      eventTypeId,
      bankCardId,
      accountType: selectedCard?.accountType ?? 'private',
      amount: amt,
      note,
    })
    setTimeout(() => {
      setSubmitting(false)
      onSaved()
    }, 150)
  }

  const sectionLabelStyle = {
    fontSize: '0.7rem',
    color: 'var(--color-ink-muted)',
    letterSpacing: '0.12em',
    marginBottom: '0.375rem',
    fontFamily: 'var(--font-sans)',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(44, 36, 22, 0.4)', backdropFilter: 'blur(2px)', touchAction: 'none' }}
      onClick={onClose}
      onTouchMove={e => e.preventDefault()}
    >
      <div
        className="w-full max-w-md mx-auto rounded-t-2xl px-6 pt-6 pb-8 max-h-[88vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--color-paper)',
          boxShadow: '0 -8px 40px rgba(44, 36, 22, 0.12)',
          transform: `translateY(${dragY}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
        }}
        onClick={e => e.stopPropagation()}
        onTouchMove={e => e.stopPropagation()}
      >
        {/* Drag handle — swipe down to dismiss */}
        <div
          className="flex justify-center py-3 -mt-2 mb-2 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: 'var(--color-paper-darker)' }}
          />
        </div>

        {/* Title */}
        <h2
          className="text-center font-serif font-bold mb-6 tracking-widest"
          style={{ fontSize: '1.25rem', letterSpacing: '0.25em' }}
        >
          记一笔
        </h2>

        {/* Date */}
        <div className="mb-5">
          <label style={sectionLabelStyle}>日期</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="input-ink w-full"
            style={{ fontSize: '0.95rem' }}
          />
        </div>

        {/* Event Type */}
        <div className="mb-5">
          <label style={sectionLabelStyle}>事由</label>
          <div className="flex flex-wrap gap-2">
            {types.map(t => {
              const selected = eventTypeId === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setEventTypeId(t.id!)}
                  className="px-4 py-2 rounded-full text-sm transition-all duration-150"
                  style={{
                    backgroundColor: selected ? 'var(--color-ink)' : 'white',
                    color: selected ? 'var(--color-paper)' : 'var(--color-ink-light)',
                    border: selected ? '1px solid var(--color-ink)' : '1px solid rgba(44,36,22,0.1)',
                    fontWeight: selected ? 500 : 400,
                    transform: selected ? 'scale(1.03)' : 'scale(1)',
                  }}
                >
                  {t.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Bank Card */}
        <div className="mb-5">
          <label style={sectionLabelStyle}>银票</label>
          <select
            value={bankCardId}
            onChange={e => setBankCardId(Number(e.target.value))}
            className="input-ink w-full"
            style={{ fontSize: '0.95rem', appearance: 'none' }}
          >
            {cards.length === 0 && <option value={0}>请先在「印鉴」中添加银行卡</option>}
            {cards.map(c => (
              <option key={c.id} value={c.id}>
                {c.bankName} ····{c.cardNumber}
              </option>
            ))}
          </select>
        </div>

        {/* Account Type seal preview */}
        {selectedCard && (
          <div className="mb-5 flex items-center gap-2">
            <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', letterSpacing: '0.12em' }}>账类</span>
            <span className={selectedCard.accountType === 'public' ? 'seal-public' : 'seal-private'}>
              {selectedCard.accountType === 'public' ? '公账' : '私账'}
            </span>
          </div>
        )}

        {/* Amount */}
        <div className="mb-5">
          <label style={sectionLabelStyle}>金额</label>
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 font-serif"
              style={{ fontSize: '1.5rem', color: 'var(--color-ink)', opacity: 0.25 }}
            >
              ¥
            </span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              step="0.01"
              inputMode="decimal"
              className="input-ink w-full text-center font-serif font-bold tracking-tight"
              style={{ fontSize: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            />
          </div>
        </div>

        {/* Note */}
        <div className="mb-8">
          <label style={sectionLabelStyle}>附注 · 选填</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="事由备注…"
            className="input-ink w-full"
            style={{ fontSize: '0.9rem', fontStyle: note ? 'normal' : 'italic' }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-ink w-full rounded-xl py-3.5 font-serif font-bold tracking-widest text-base
                     disabled:opacity-50 disabled:scale-100"
          style={{ letterSpacing: '0.3em' }}
        >
          {submitting ? '…' : '入 账'}
        </button>

        <div className="h-4" />
      </div>
    </div>
  )
}
