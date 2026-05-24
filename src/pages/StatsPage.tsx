import { useState } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import MonthPicker from '../components/MonthPicker'
import { useTransactions } from '../hooks/useTransactions'
import { useEventTypes } from '../hooks/useEventTypes'
import { useBackup } from '../hooks/useBackup'
import { exportExcel, exportCSV } from '../utils/export'
import { getCurrentYearMonth, getMonthRange, formatAmount } from '../utils/format'

const COLORS = [
  '#2c2416', '#c43a31', '#b8954a', '#5b8c5a',
  '#8b6914', '#4a6b8c', '#7a5a4a', '#3a6b5e',
]

export default function StatsPage() {
  const [current, setCurrent] = useState(getCurrentYearMonth)
  const { transactions } = useTransactions(current.year, current.month)
  const { types } = useEventTypes()
  const { daysSinceLastBackup, markBackupDone } = useBackup()

  const publicTotal = transactions
    .filter(t => t.accountType === 'public')
    .reduce((s, t) => s + t.amount, 0)

  const privateTotal = transactions
    .filter(t => t.accountType === 'private')
    .reduce((s, t) => s + t.amount, 0)

  const total = publicTotal + privateTotal

  const eventData = types.map(t => {
    const sum = transactions
      .filter(tx => tx.eventTypeId === t.id)
      .reduce((s, tx) => s + tx.amount, 0)
    return { name: t.name, value: sum }
  }).filter(d => d.value > 0)

  const { end } = getMonthRange(current.year, current.month)
  const daysInMonth = parseInt(end.split('-')[2])
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, '0')
    const dateStr = `${current.year}-${String(current.month).padStart(2, '0')}-${day}`
    const sum = transactions
      .filter(t => t.date === dateStr)
      .reduce((s, t) => s + t.amount, 0)
    return { date: `${i + 1}日`, amount: sum }
  })

  async function handleExportExcel() {
    await exportExcel(current.year, current.month)
    markBackupDone()
  }

  async function handleExportCSV() {
    await exportCSV(current.year, current.month)
    markBackupDone()
  }

  return (
    <div>
      <MonthPicker
        year={current.year}
        month={current.month}
        onChange={(y, m) => setCurrent({ year: y, month: m })}
      />

      <div className="divider-ink mx-6" />

      <div className="px-4">
        {/* Backup hint */}
        {daysSinceLastBackup() !== null && (
          <div className="text-center mt-3 mb-2" style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', letterSpacing: '0.06em' }}>
            上次留底：{daysSinceLastBackup()} 天前
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="card-paper p-3 text-center">
            <div className="font-serif tracking-wider" style={{ fontSize: '0.6rem', color: 'var(--color-vermillion)', letterSpacing: '0.15em' }}>
              公账
            </div>
            <div className="font-serif font-bold mt-1 tracking-tight" style={{ fontSize: '1rem', color: 'var(--color-vermillion)' }}>
              ¥{formatAmount(publicTotal)}
            </div>
          </div>
          <div className="card-paper p-3 text-center">
            <div className="font-serif tracking-wider" style={{ fontSize: '0.6rem', color: 'var(--color-ink-light)', letterSpacing: '0.15em' }}>
              私账
            </div>
            <div className="font-serif font-bold mt-1 tracking-tight" style={{ fontSize: '1rem' }}>
              ¥{formatAmount(privateTotal)}
            </div>
          </div>
          <div className="card-paper p-3 text-center">
            <div className="font-serif tracking-wider" style={{ fontSize: '0.6rem', color: 'var(--color-ink-light)', letterSpacing: '0.15em' }}>
              合计
            </div>
            <div className="font-serif font-bold mt-1 tracking-tight" style={{ fontSize: '1rem', color: 'var(--color-ink)' }}>
              ¥{formatAmount(total)}
            </div>
          </div>
        </div>

        {/* No data */}
        {transactions.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--color-ink-muted)' }}>
            <div className="font-serif mb-2" style={{ fontSize: '2.5rem', opacity: 0.2 }}>图</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.45, letterSpacing: '0.08em' }}>
              暂无账目可览
            </div>
          </div>
        )}

        {/* Pie Chart */}
        {eventData.length > 0 && (
          <div className="card-paper p-4 mb-4">
            <h3
              className="font-serif font-bold mb-3 tracking-wider"
              style={{ fontSize: '0.85rem', letterSpacing: '0.15em' }}
            >
              事由分布
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={eventData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={82}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {eventData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [`¥${formatAmount(v)}`, '金额']}
                  contentStyle={{
                    background: 'white',
                    border: '1px solid rgba(44,36,22,0.08)',
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar Chart */}
        {transactions.length > 0 && (
          <div className="card-paper p-4 mb-4">
            <h3
              className="font-serif font-bold mb-3 tracking-wider"
              style={{ fontSize: '0.85rem', letterSpacing: '0.15em' }}
            >
              日度流水
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(44,36,22,0.06)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: 'var(--color-ink-muted)' }}
                  interval={Math.ceil(daysInMonth / 15)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: 'var(--color-ink-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v: number) => [`¥${formatAmount(v)}`, '金额']}
                  contentStyle={{
                    background: 'white',
                    border: '1px solid rgba(44,36,22,0.08)',
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                  }}
                />
                <Bar dataKey="amount" fill="var(--color-ink)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Export buttons */}
        <div className="flex gap-2 pb-24">
          <button
            onClick={handleExportExcel}
            className="btn-ink flex-1 rounded-xl py-3 font-serif font-bold tracking-widest text-sm"
            style={{ letterSpacing: '0.15em' }}
          >
            导出 Excel
          </button>
          <button
            onClick={handleExportCSV}
            className="flex-1 py-3 rounded-xl font-serif font-bold tracking-widest text-sm border transition-all active:opacity-60"
            style={{
              borderColor: 'var(--color-paper-darker)',
              color: 'var(--color-ink-light)',
              letterSpacing: '0.15em',
            }}
          >
            导出 CSV
          </button>
        </div>
      </div>
    </div>
  )
}
