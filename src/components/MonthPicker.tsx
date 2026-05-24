import { formatMonth, getPrevMonth, getNextMonth } from '../utils/format'

interface Props {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}

export default function MonthPicker({ year, month, onChange }: Props) {
  const prev = getPrevMonth(year, month)
  const next = getNextMonth(year, month)

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <button
        onClick={() => onChange(prev.year, prev.month)}
        className="month-btn w-9 h-9 flex items-center justify-center rounded-full text-xl font-serif"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        ←
      </button>

      <span
        className="font-serif font-bold tracking-wider"
        style={{ fontSize: '1.15rem', letterSpacing: '0.15em' }}
      >
        {formatMonth(year, month)}
      </span>

      <button
        onClick={() => onChange(next.year, next.month)}
        className="month-btn w-9 h-9 flex items-center justify-center rounded-full text-xl font-serif"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        →
      </button>
    </div>
  )
}
