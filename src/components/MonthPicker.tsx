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
    <div className="flex items-center justify-center gap-4 py-3 bg-white border-b border-gray-100">
      <button
        onClick={() => onChange(prev.year, prev.month)}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full text-lg"
      >
        ‹
      </button>
      <span className="text-lg font-semibold min-w-[120px] text-center">
        {formatMonth(year, month)}
      </span>
      <button
        onClick={() => onChange(next.year, next.month)}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full text-lg"
      >
        ›
      </button>
    </div>
  )
}
