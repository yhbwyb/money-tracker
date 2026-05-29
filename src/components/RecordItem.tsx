import { useRef, useState, useEffect } from 'react'
import { formatAmount, formatDate } from '../utils/format'
import type { Transaction } from '../db'

interface Props {
  transaction: Transaction
  eventName: string
  bankName: string
  bankCardNumber: string
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onDelete: () => void
  onEdit: () => void
}

export default function RecordItem({
  transaction,
  eventName,
  bankName,
  bankCardNumber,
  isOpen,
  onOpen,
  onClose,
  onDelete,
  onEdit,
}: Props) {
  const touchStart = useRef({ x: 0, y: 0 })
  const swipeHandled = useRef(false)
  const [offsetX, setOffsetX] = useState(0)

  // Sync offsetX with parent's isOpen state
  useEffect(() => {
    if (!isOpen) setOffsetX(0)
  }, [isOpen])

  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    swipeHandled.current = false
  }

  function handleTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - touchStart.current.x
    const dy = Math.abs(e.touches[0].clientY - touchStart.current.y)
    // Only track horizontal swipes
    if (dy > Math.abs(dx) * 0.6) return
    if (dx < 0) {
      setOffsetX(Math.max(dx, -80))
      swipeHandled.current = true
    }
  }

  function handleTouchEnd() {
    if (offsetX < -40) {
      setOffsetX(-80)
      onOpen()
    } else {
      setOffsetX(0)
      onClose()
    }
  }

  function handleCardClick() {
    if (!swipeHandled.current && offsetX === 0) {
      onEdit()
    }
  }

  function handleDeleteAction(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    if (confirm('确定删除该记录？')) {
      onDelete()
    }
  }

  return (
    <div className="mx-4 mb-2 relative overflow-hidden rounded-xl">
      {/* Delete action behind */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center rounded-r-xl"
        style={{
          width: '80px',
          backgroundColor: 'var(--color-vermillion)',
        }}
        onClick={handleDeleteAction}
        onTouchStart={e => e.stopPropagation()}
        onTouchEnd={e => e.stopPropagation()}
      >
        <span className="text-white font-serif font-bold tracking-wider text-sm">删除</span>
      </div>

      {/* Card */}
      <div
        className="card-paper px-4 py-3 flex items-center justify-between active:opacity-70 relative bg-white select-none"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: offsetX === 0 ? 'transform 0.2s ease' : 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs opacity-40 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
              {formatDate(transaction.date)}
            </span>
            <span className={transaction.accountType === 'public' ? 'seal-public' : 'seal-private'}>
              {transaction.accountType === 'public' ? '公' : '私'}
            </span>
            <span className="font-medium" style={{ fontSize: '0.875rem', letterSpacing: '0.03em' }}>
              {eventName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-35">
              {bankName} · {bankCardNumber}
            </span>
            {transaction.note && (
              <span className="text-xs opacity-25 truncate max-w-[120px]" style={{ fontStyle: 'italic' }}>
                {transaction.note}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-serif font-bold tracking-tight tabular-nums" style={{ fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
            ¥{formatAmount(transaction.amount)}
          </span>
        </div>
      </div>
    </div>
  )
}
