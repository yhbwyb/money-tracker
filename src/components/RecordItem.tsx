import { useRef, useState } from 'react'
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
  const touchStart = useRef({ x: 0, y: 0, time: 0 })
  const [offsetX, setOffsetX] = useState(0)

  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() }
  }

  function handleTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - touchStart.current.x
    // Only track horizontal swipes (ignore vertical scrolls)
    const dy = Math.abs(e.touches[0].clientY - touchStart.current.y)
    if (dy > Math.abs(dx) * 0.6) return
    if (dx < 0) {
      setOffsetX(Math.max(dx, -80))
    } else if (offsetX < 0) {
      setOffsetX(Math.min(dx - 80, 0))
    }
  }

  function handleTouchEnd() {
    const dt = Date.now() - touchStart.current.time
    // Quick tap while open → close
    if (dt < 200 && Math.abs(offsetX) > 10) {
      // Was a swipe, settle
    }
    if (offsetX < -40) {
      setOffsetX(-80)
    } else {
      setOffsetX(0)
    }
  }

  function handleClick() {
    if (offsetX !== 0) {
      setOffsetX(0)
    }
  }

  function handleDelete() {
    if (confirm('确定删除该记录？')) {
      onDelete()
    }
    setOffsetX(0)
  }

  return (
    <div className="mx-4 mb-2 relative overflow-hidden rounded-xl">
      {/* Delete action behind */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center rounded-r-xl cursor-pointer"
        style={{
          width: '80px',
          backgroundColor: 'var(--color-vermillion)',
        }}
        onClick={handleDelete}
      >
        <span className="text-white font-serif font-bold tracking-wider text-sm">删除</span>
      </div>

      {/* Card content */}
      <div
        className="card-paper px-4 py-3 flex items-center justify-between active:opacity-70 relative bg-white"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: offsetX === 0 ? 'transform 0.2s ease' : 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
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
