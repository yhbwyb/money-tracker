import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import MonthPicker from '../components/MonthPicker'
import db from '../db'
import { useTransactions } from '../hooks/useTransactions'
import { useBackup } from '../hooks/useBackup'
import { exportExcel, exportAllExcel } from '../utils/export'
import { getCurrentYearMonth, formatAmount } from '../utils/format'
import { computeTotals } from '../utils/totals'

const COLORS = [
  '#2c2416', '#c43a31', '#b8954a', '#5b8c5a',
  '#8b6914', '#4a6b8c', '#7a5a4a', '#3a6b5e',
]

export default function StatsPage() {
  const [current, setCurrent] = useState(getCurrentYearMonth)
  const { transactions } = useTransactions(current.year, current.month)
  const types = useLiveQuery(() => db.eventTypes.toArray()) ?? []
  const { daysSinceLastBackup, markBackupDone } = useBackup()

  const { publicTotal, privateTotal, total } = useMemo(
    () => computeTotals(transactions),
    [transactions],
  )

  const eventData = useMemo(
    () => types.map(t => {
      const sum = transactions.filter(tx => tx.eventTypeId === t.id).reduce((s, tx) => s + tx.amount, 0)
      return { name: t.name, value: sum }
    }).filter(d => d.value > 0),
    [types, transactions],
  )

  async function handleExportExcel() {
    await exportExcel(current.year, current.month)
    markBackupDone()
  }

  async function handleExportAll() {
    await exportAllExcel()
    markBackupDone()
  }

  const totalValue = eventData.reduce((s, d) => s + d.value, 0)

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
              className="font-serif font-bold mb-2 tracking-wider"
              style={{ fontSize: '0.85rem', letterSpacing: '0.15em' }}
            >
              事由分布
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={eventData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={72}
                  dataKey="value"
                  label={false}
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
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 justify-center">
              {eventData.map((d, i) => {
                const pct = totalValue > 0 ? ((d.value / totalValue) * 100).toFixed(0) : '0'
                return (
                  <div key={i} className="flex items-center gap-1.5" style={{ fontSize: '0.7rem', color: 'var(--color-ink-light)' }}>
                    <span style={{
                      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                      backgroundColor: COLORS[i % COLORS.length], flexShrink: 0,
                    }} />
                    {d.name} {pct}%
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Export buttons */}
        <div className="flex gap-2 pb-24">
          <button
            onClick={handleExportExcel}
            className="btn-ink flex-1 rounded-xl py-3 font-serif font-bold tracking-widest text-sm"
            style={{ letterSpacing: '0.15em' }}
          >
            导出当月
          </button>
          <button
            onClick={handleExportAll}
            className="btn-ink flex-1 rounded-xl py-3 font-serif font-bold tracking-widest text-sm"
            style={{ letterSpacing: '0.15em' }}
          >
            导出全部
          </button>
        </div>
      </div>
    </div>
  )
}
