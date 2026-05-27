import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import db from '../db'
import { getMonthRange, todayStr } from './format'

interface ExportRow {
  日期: string
  事件: string
  银行卡: string
  卡号: string
  公私账: string
  金额: number
  备注: string
}

const COLS = [
  { wch: 12 }, // 日期
  { wch: 8 },  // 事件
  { wch: 12 }, // 银行卡
  { wch: 10 }, // 卡号
  { wch: 8 },  // 公私账
  { wch: 12 }, // 金额
  { wch: 20 }, // 备注
]

function buildSheet(transactions: any[], eventMap: Map<number | undefined, string>, cardMap: Map<number | undefined, any>): XLSX.WorkSheet {
  const rows: ExportRow[] = transactions.map(t => {
    const card = cardMap.get(t.bankCardId)
    return {
      日期: t.date,
      事件: eventMap.get(t.eventTypeId) ?? '',
      银行卡: card?.bankName ?? '',
      卡号: card?.cardNumber ?? '',
      公私账: t.accountType === 'public' ? '公账' : '私账',
      金额: t.amount,
      备注: t.note,
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = COLS
  return ws
}

export async function exportExcel(year: number, month: number): Promise<void> {
  const { start, end } = getMonthRange(year, month)
  const transactions = await db.transactions
    .where('date')
    .between(start, end, true, true)
    .toArray()

  const eventTypes = await db.eventTypes.toArray()
  const bankCards = await db.bankCards.toArray()
  const eventMap = new Map(eventTypes.map(e => [e.id, e.name]))
  const cardMap = new Map(bankCards.map(c => [c.id, c]))

  const ws = buildSheet(transactions, eventMap, cardMap)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '当月账单')
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf]), `记账本_${year}年${month}月.xlsx`)
}

export async function exportAllExcel(): Promise<void> {
  const [transactions, eventTypes, bankCards] = await Promise.all([
    db.transactions.orderBy('date').toArray(),
    db.eventTypes.toArray(),
    db.bankCards.toArray(),
  ])

  const eventMap = new Map(eventTypes.map(e => [e.id, e.name]))
  const cardMap = new Map(bankCards.map(c => [c.id, c]))

  const ws = buildSheet(transactions, eventMap, cardMap)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '全部账单')
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf]), `记账本_全部数据_${todayStr()}.xlsx`)
}

export async function exportCSV(year: number, month: number): Promise<void> {
  const { start, end } = getMonthRange(year, month)
  const transactions = await db.transactions
    .where('date')
    .between(start, end, true, true)
    .toArray()

  const eventTypes = await db.eventTypes.toArray()
  const bankCards = await db.bankCards.toArray()
  const eventMap = new Map(eventTypes.map(e => [e.id, e.name]))
  const cardMap = new Map(bankCards.map(c => [c.id, c]))

  const headers = ['日期', '事件', '银行卡', '卡号', '公私账', '金额', '备注']
  const rows = transactions.map(t => {
    const card = cardMap.get(t.bankCardId)
    return [
      t.date,
      eventMap.get(t.eventTypeId) ?? '',
      card?.bankName ?? '',
      card?.cardNumber ?? '',
      t.accountType === 'public' ? '公账' : '私账',
      String(t.amount),
      t.note,
    ].map(v => `"${v}"`).join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')
  const bom = '﻿'
  saveAs(new Blob([bom + csv], { type: 'text/csv;charset=utf-8' }), `记账本_${year}年${month}月.csv`)
}

export async function exportFullJSON(): Promise<void> {
  const [bankCards, eventTypes, transactions] = await Promise.all([
    db.bankCards.toArray(),
    db.eventTypes.toArray(),
    db.transactions.toArray(),
  ])
  const data = JSON.stringify({ bankCards, eventTypes, transactions }, null, 2)
  saveAs(new Blob([data], { type: 'application/json' }), `记账本_完整备份_${todayStr()}.json`)
}
