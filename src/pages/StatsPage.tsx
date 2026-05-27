import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import db from '../db'
import { useEventTypes } from '../hooks/useEventTypes'
import { useBackup } from '../hooks/useBackup'
import { formatAmount, getMonthRange, todayStr } from '../utils/format'

const COLORS = [
  '#2c2416', '#c43a31', '#b8954a', '#5b8c5a',
  '#8b6914', '#4a6b8c', '#7a5a4a', '#3a6b5e',
]

export default function StatsPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const { types } = useEventTypes()
  const { daysSinceLastBackup, markBackupDone } = useBackup()

  const transactions = useLiveQuery(
    () => {
      let coll = db.transactions.orderBy('date')
      if (startDate) coll = coll.filter(t => t.date >= startDate)
      if (endDate) coll = coll.filter(t => t.date <= endDate)
      return coll.toArray()
    },
    [startDate, endDate]
  ) ?? []

  const publicTotal = useMemo(
    () => transactions.filter(t => t.accountType === 'public').reduce((s, t) => s + t.amount, 0),
    [transactions],
  )
  const privateTotal = useMemo(
    () => transactions.filter(t => t.accountType === 'private').reduce((s, t) => s + t.amount, 0),
    [transactions],
  )
  const total = publicTotal + privateTotal

  const eventData = useMemo(
    () => types.map(t => {
      const sum = transactions.filter(tx => tx.eventTypeId === t.id).reduce((s, tx) => s + tx.amount, 0)
      return { name: t.name, value: sum }
    }).filter(d => d.value > 0),
    [types, transactions],
  )

  function applyMonth() {
    const d = startDate || todayStr()
    const [y, m] = d.split('-')
    const range = getMonthRange(parseInt(y), parseInt(m))
    setStartDate(range.start)
    setEndDate(range.end)
  }

  function clearDates() {
    setStartDate('')
    setEndDate('')
  }

  async function handleExportExcel() {
    if (transactions.length === 0) return
    const txs = await db.transactions.orderBy('date').filter(t => {
      if (startDate && t.date < startDate) return false
      if (endDate && t.date > endDate) return false
      return true
    }).toArray()
    const eventTypes = await db.eventTypes.toArray()
    const bankCards = await db.bankCards.toArray()
    const eventMap = new Map(eventTypes.map(e => [e.id, e.name]))
    const cardMap = new Map(bankCards.map(c => [c.id, c]))
    const rows = txs.map(t => {
      const card = cardMap.get(t.bankCardId)
      return {
        日期: t.date, 事件: eventMap.get(t.eventTypeId) ?? '',
        银行卡: card?.bankName ?? '', 卡号: card?.cardNumber ?? '',
        公私账: t.accountType === 'public' ? '公账' : '私账',
        金额: t.amount, 备注: t.note,
      }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '账单')
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([buf]), `记账本_${startDate || '全部'}_${endDate || '全部'}.xlsx`)
    markBackupDone()
  }

  async function handleExportCSV() {
    if (transactions.length === 0) return
    const txs = await db.transactions.orderBy('date').filter(t => {
      if (startDate && t.date < startDate) return false
      if (endDate && t.date > endDate) return false
      return true
    }).toArray()
    const eventTypes = await db.eventTypes.toArray()
    const bankCards = await db.bankCards.toArray()
    const eventMap = new Map(eventTypes.map(e => [e.id, e.name]))
    const cardMap = new Map(bankCards.map(c => [c.id, c]))
    const headers = ['日期', '事件', '银行卡', '卡号', '公私账', '金额', '备注']
    const csvRows = txs.map(t => {
      const card = cardMap.get(t.bankCardId)
      return [t.date, eventMap.get(t.eventTypeId) ?? '',
        card?.bankName ?? '', card?.cardNumber ?? '',
        t.accountType === 'public' ? '公账' : '私账', String(t.amount), t.note,
      ].map(v => `"${v}"`).join(',')
    })
    const csv = [headers.join(','), ...csvRows].join('\n')
    saveAs(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }), `记账本_${startDate || '全部'}_${endDate || '全部'}.csv`)
    markBackupDone()
  }

  const labelStyle = {
    fontSize: '0.7rem', color: 'var(--color-ink-muted)',
    letterSpacing: '0.12em', fontFamily: 'var(--font-sans)',
  }

  return (
    <div>
      <h1
        className="text-center font-serif font-bold pt-4 pb-2 tracking-widest"
        style={{ fontSize: '1.1rem', letterSpacing: '0.3em' }}
      >
        账 目
      </h1>

      <div className="divider-ink mx-6" />

      {/* Date range */}
      <div className="px-4 mt-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label style={labelStyle}>起始</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="input-ink w-full" style={{ fontSize: '0.85rem' }} />
          </div>
          <div className="flex-1">
            <label style={labelStyle}>截止</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="input-ink w-full" style={{ fontSize: '0.85rem' }} />
          </div>
          <button onClick={applyMonth}
            className="btn-ink rounded-lg px-3 py-2 font-serif font-bold tracking-wider text-xs"
            style={{ letterSpacing: '0.1em', marginBottom: '0' }}>
            当月
          </button>
          <button onClick={clearDates}
            className="rounded-lg px-3 py-2 font-serif font-bold tracking-wider text-xs border transition-all active:opacity-60"
            style={{ borderColor: 'var(--color-paper-darker)', color: 'var(--color-ink-light)', letterSpacing: '0.1em', marginBottom: '0' }}>
            全部
          </button>
        </div>
      </div>

      {/* Backup hint */}
      {daysSinceLastBackup() !== null && (
        <div className="text-center mt-3" style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', letterSpacing: '0.06em' }}>
          上次留底：{daysSinceLastBackup()} 天前
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 px-4 my-4">
        <div className="card-paper p-3 text-center">
          <div className="font-serif tracking-wider" style={{ fontSize: '0.6rem', color: 'var(--color-vermillion)', letterSpacing: '0.15em' }}>公账</div>
          <div className="font-serif font-bold mt-1 tracking-tight" style={{ fontSize: '1rem', color: 'var(--color-vermillion)' }}>¥{formatAmount(publicTotal)}</div>
        </div>
        <div className="card-paper p-3 text-center">
          <div className="font-serif tracking-wider" style={{ fontSize: '0.6rem', color: 'var(--color-ink-light)', letterSpacing: '0.15em' }}>私账</div>
          <div className="font-serif font-bold mt-1 tracking-tight" style={{ fontSize: '1rem' }}>¥{formatAmount(privateTotal)}</div>
        </div>
        <div className="card-paper p-3 text-center">
          <div className="font-serif tracking-wider" style={{ fontSize: '0.6rem', color: 'var(--color-ink-light)', letterSpacing: '0.15em' }}>合计</div>
          <div className="font-serif font-bold mt-1 tracking-tight" style={{ fontSize: '1rem', color: 'var(--color-ink)' }}>¥{formatAmount(total)}</div>
        </div>
      </div>

      {/* No data */}
      {transactions.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--color-ink-muted)' }}>
          <div className="font-serif mb-2" style={{ fontSize: '2.5rem', opacity: 0.2 }}>图</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.45, letterSpacing: '0.08em' }}>暂无账目可览</div>
        </div>
      )}

      {/* Pie Chart */}
      {eventData.length > 0 && (
        <div className="card-paper mx-4 p-4 mb-4">
          <h3 className="font-serif font-bold mb-3 tracking-wider" style={{ fontSize: '0.85rem', letterSpacing: '0.15em' }}>事由分布</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={eventData} cx="50%" cy="50%" innerRadius={48} outerRadius={82}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}>
                {eventData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [`¥${formatAmount(v)}`, '金额']}
                contentStyle={{ background: 'white', border: '1px solid rgba(44,36,22,0.08)', borderRadius: '0.5rem', fontSize: '0.8rem' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Export buttons */}
      <div className="flex gap-2 px-4 pb-24">
        <button onClick={handleExportExcel}
          className="btn-ink flex-1 rounded-xl py-3 font-serif font-bold tracking-widest text-sm"
          style={{ letterSpacing: '0.15em' }}>
          导出 Excel
        </button>
        <button onClick={handleExportCSV}
          className="flex-1 py-3 rounded-xl font-serif font-bold tracking-widest text-sm border transition-all active:opacity-60"
          style={{ borderColor: 'var(--color-paper-darker)', color: 'var(--color-ink-light)', letterSpacing: '0.15em' }}>
          导出 CSV
        </button>
      </div>
    </div>
  )
}
