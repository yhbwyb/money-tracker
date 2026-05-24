import { useState } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import MonthPicker from '../components/MonthPicker'
import { useTransactions } from '../hooks/useTransactions'
import { useEventTypes } from '../hooks/useEventTypes'
import { useBackup } from '../hooks/useBackup'
import { exportExcel, exportCSV } from '../utils/export'
import { getCurrentYearMonth, getMonthRange, formatAmount } from '../utils/format'

const COLORS = ['#3b82f6', '#f97316', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#eab308']

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
    <div className="p-4">
      <MonthPicker
        year={current.year}
        month={current.month}
        onChange={(y, m) => setCurrent({ year: y, month: m })}
      />

      {daysSinceLastBackup() !== null && (
        <div className="text-xs text-gray-400 text-center mt-2">
          上次备份：{daysSinceLastBackup()} 天前
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 my-4">
        <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
          <div className="text-xs text-gray-400">公账</div>
          <div className="text-base font-bold text-orange-600 mt-1">¥{formatAmount(publicTotal)}</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
          <div className="text-xs text-gray-400">私账</div>
          <div className="text-base font-bold text-blue-600 mt-1">¥{formatAmount(privateTotal)}</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
          <div className="text-xs text-gray-400">合计</div>
          <div className="text-base font-bold text-gray-800 mt-1">¥{formatAmount(total)}</div>
        </div>
      </div>

      {transactions.length === 0 && (
        <div className="text-center text-gray-400 py-10">暂无数据</div>
      )}

      {/* Pie Chart */}
      {eventData.length > 0 && (
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <h3 className="text-sm font-semibold mb-2">事件类型分布</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={eventData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {eventData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `¥${formatAmount(v)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bar Chart */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <h3 className="text-sm font-semibold mb-2">每日支出趋势</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                interval={Math.ceil(daysInMonth / 15)}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `¥${formatAmount(v)}`} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Export buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleExportExcel}
          className="flex-1 py-3 bg-blue-700 text-white rounded-xl text-sm font-semibold active:bg-blue-800"
        >
          导出 Excel
        </button>
        <button
          onClick={handleExportCSV}
          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold active:bg-gray-200"
        >
          导出 CSV
        </button>
      </div>
    </div>
  )
}
