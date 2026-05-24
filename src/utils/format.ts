export function formatAmount(amount: number): string {
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function formatMonth(year: number, month: number): string {
  return `${year}年${month}月`
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const m = String(month).padStart(2, '0')
  const start = `${year}-${m}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${m}-${String(lastDay).padStart(2, '0')}`
  return { start, end }
}

export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export function getPrevMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 }
  return { year, month: month - 1 }
}

export function getNextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) return { year: year + 1, month: 1 }
  return { year, month: month + 1 }
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}
