# 记账本 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first single-user PWA accounting app with offline storage, statistics, and Excel export.

**Architecture:** React 18 + TypeScript SPA with Dexie.js for IndexedDB storage, Recharts for statistics, SheetJS for Excel export. Three tabs (Bills / Stats / Settings) with a bottom sheet for adding records. All data stored locally, no backend.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Dexie.js, Recharts, SheetJS, React Router, vite-plugin-pwa

---

### Task 1: Project Scaffold

**Files:**
- Create: project root (Vite scaffold)
- Modify: `package.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `index.html`

- [ ] **Step 1: Scaffold Vite + React + TypeScript project**

Run:
```bash
cd d:/cc-project/money-tracker
npm create vite@latest . -- --template react-ts
```

When prompted to overwrite existing files, confirm yes.

- [ ] **Step 2: Install all dependencies**

Run:
```bash
cd d:/cc-project/money-tracker
npm install dexie react-router-dom recharts xlsx file-saver
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa
npm install -D @types/file-saver
```

- [ ] **Step 3: Configure Vite with Tailwind and PWA plugin**

Write `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '记账本',
        short_name: '记账本',
        description: '简单记账工具',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
```

- [ ] **Step 4: Configure Tailwind CSS**

Write `src/index.css`:
```css
@import "tailwindcss";

/* Custom styles */
body {
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior: none;
}
```

- [ ] **Step 5: Update index.html**

Write `index.html`:
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#1e40af" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <title>记账本</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Clean up and verify**

Run:
```bash
cd d:/cc-project/money-tracker
rm -f src/App.css src/assets/react.svg public/vite.svg
npm run dev
```

Expected: dev server starts without errors. Kill with Ctrl+C after verifying.

- [ ] **Step 7: Commit**

```bash
cd d:/cc-project/money-tracker
git init
git add -A
git commit -m "feat: scaffold project with Vite + React + TS + Tailwind + PWA"
```

---

### Task 2: Database Schema (Dexie.js)

**Files:**
- Create: `src/db/index.ts`

- [ ] **Step 1: Define database schema**

Write `src/db/index.ts`:
```typescript
import Dexie, { type EntityTable } from 'dexie'

export interface BankCard {
  id: number
  cardNumber: string
  bankName: string
  accountType: 'public' | 'private'
}

export interface EventType {
  id: number
  name: string
}

export interface Transaction {
  id: number
  date: string          // YYYY-MM-DD
  eventTypeId: number
  bankCardId: number
  accountType: 'public' | 'private'
  amount: number
  note: string
  createdAt: number     // timestamp
}

const db = new Dexie('MoneyTrackerDB') as Dexie & {
  bankCards: EntityTable<BankCard, 'id'>
  eventTypes: EntityTable<EventType, 'id'>
  transactions: EntityTable<Transaction, 'id'>
}

db.version(1).stores({
  bankCards: '++id',
  eventTypes: '++id',
  transactions: '++id, date, eventTypeId, bankCardId, accountType',
})

// Seed default event types on first run
db.on('populate', () => {
  db.eventTypes.bulkAdd([
    { id: 1, name: '发货' },
    { id: 2, name: '物流' },
    { id: 3, name: '网购' },
    { id: 4, name: '其它' },
  ])
})

export default db
```

- [ ] **Step 2: Verify TypeScript compilation**

Run:
```bash
cd d:/cc-project/money-tracker
npx tsc --noEmit
```

Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
cd d:/cc-project/money-tracker
git add src/db/index.ts
git commit -m "feat: add Dexie.js database schema"
```

---

### Task 3: Format Utilities

**Files:**
- Create: `src/utils/format.ts`

- [ ] **Step 1: Write format utilities**

Write `src/utils/format.ts`:
```typescript
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
```

- [ ] **Step 2: Verify compilation**

Run:
```bash
cd d:/cc-project/money-tracker
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd d:/cc-project/money-tracker
git add src/utils/format.ts
git commit -m "feat: add date and amount format utilities"
```

---

### Task 4: Export / Import Utilities

**Files:**
- Create: `src/utils/export.ts`, `src/utils/import.ts`

- [ ] **Step 1: Write export utilities**

Write `src/utils/export.ts`:
```typescript
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
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '账单')
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf]), `记账本_${year}年${month}月.xlsx`)
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

```

- [ ] **Step 2: Write import utilities**

Write `src/utils/import.ts`:
```typescript
import db from '../db'

export async function importFullJSON(file: File): Promise<void> {
  const text = await file.text()
  const data = JSON.parse(text)

  if (!data.bankCards || !data.eventTypes || !data.transactions) {
    throw new Error('备份文件格式不正确，需要包含 bankCards、eventTypes、transactions')
  }

  await db.transaction('rw', db.bankCards, db.eventTypes, db.transactions, async () => {
    await db.bankCards.clear()
    await db.eventTypes.clear()
    await db.transactions.clear()

    await db.bankCards.bulkAdd(data.bankCards)
    await db.eventTypes.bulkAdd(data.eventTypes)
    await db.transactions.bulkAdd(data.transactions)
  })
}
```

- [ ] **Step 3: Verify compilation**

Run:
```bash
cd d:/cc-project/money-tracker
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
cd d:/cc-project/money-tracker
git add src/utils/export.ts src/utils/import.ts
git commit -m "feat: add Excel/CSV/JSON export and JSON import utilities"
```

---

### Task 5: Data Hooks

**Files:**
- Create: `src/hooks/useTransactions.ts`, `src/hooks/useBankCards.ts`, `src/hooks/useEventTypes.ts`, `src/hooks/useBackup.ts`

- [ ] **Step 1: Install dexie-react-hooks**

Run:
```bash
cd d:/cc-project/money-tracker
npm install dexie-react-hooks
```

- [ ] **Step 2: Write useTransactions hook**

Write `src/hooks/useTransactions.ts`:
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import db, { type Transaction } from '../db'
import { getMonthRange } from '../utils/format'

export function useTransactions(year: number, month: number) {
  const { start, end } = getMonthRange(year, month)

  const transactions = useLiveQuery(
    () => db.transactions
      .where('date')
      .between(start, end, true, true)
      .reverse()
      .sortBy('createdAt'),
    [year, month]
  )

  return {
    transactions: transactions ?? [],
    addTransaction: async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
      await db.transactions.add({ ...data, createdAt: Date.now() })
    },
    deleteTransaction: async (id: number) => {
      await db.transactions.delete(id)
    },
  }
}

export function useTransactionCount(): number | undefined {
  return useLiveQuery(() => db.transactions.count())
}
```

- [ ] **Step 3: Write useBankCards hook**

Write `src/hooks/useBankCards.ts`:
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db'

export function useBankCards() {
  const cards = useLiveQuery(() => db.bankCards.toArray())

  return {
    cards: cards ?? [],
    addCard: async (cardNumber: string, bankName: string, accountType: 'public' | 'private') => {
      await db.bankCards.add({ cardNumber, bankName, accountType })
    },
    deleteCard: async (id: number) => {
      await db.bankCards.delete(id)
    },
  }
}
```

- [ ] **Step 4: Write useEventTypes hook**

Write `src/hooks/useEventTypes.ts`:
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db'

export function useEventTypes() {
  const types = useLiveQuery(() => db.eventTypes.toArray())

  return {
    types: types ?? [],
    addType: async (name: string) => {
      await db.eventTypes.add({ name })
    },
    deleteType: async (id: number) => {
      await db.eventTypes.delete(id)
    },
  }
}
```

- [ ] **Step 5: Write useBackup hook**

Write `src/hooks/useBackup.ts`:
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db'

const BACKUP_KEY = 'lastBackupDate'
const BACKUP_THRESHOLD = 7 * 24 * 60 * 60 * 1000  // 7 days
const RECORD_THRESHOLD = 30

export function useBackup() {
  const recordCount = useLiveQuery(() => db.transactions.count())

  function getLastBackupDate(): Date | null {
    const ts = localStorage.getItem(BACKUP_KEY)
    return ts ? new Date(parseInt(ts)) : null
  }

  function markBackupDone(): void {
    localStorage.setItem(BACKUP_KEY, String(Date.now()))
  }

  function daysSinceLastBackup(): number | null {
    const last = getLastBackupDate()
    if (!last) return null
    return Math.floor((Date.now() - last.getTime()) / (24 * 60 * 60 * 1000))
  }

  function shouldRemindBackup(): boolean {
    const days = daysSinceLastBackup()
    if (days === null) return (recordCount ?? 0) > 0
    return days >= 7
  }

  function shouldRemindByCount(): boolean {
    const lastRemindCount = parseInt(localStorage.getItem('lastRemindCount') || '0')
    const count = recordCount ?? 0
    return count - lastRemindCount >= RECORD_THRESHOLD
  }

  function dismissCountReminder(): void {
    localStorage.setItem('lastRemindCount', String(recordCount ?? 0))
  }

  return {
    recordCount,
    getLastBackupDate,
    markBackupDone,
    daysSinceLastBackup,
    shouldRemindBackup,
    shouldRemindByCount,
    dismissCountReminder,
  }
}
```

- [ ] **Step 6: Verify compilation**

Run:
```bash
cd d:/cc-project/money-tracker
npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
cd d:/cc-project/money-tracker
git add src/hooks/ src/utils/format.ts
git commit -m "feat: add data hooks and backup logic"
```

---

### Task 6: Layout Component (Bottom Nav)

**Files:**
- Create: `src/components/Layout.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`

- [ ] **Step 1: Write Layout component**

Write `src/components/Layout.tsx`:
```typescript
import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/bills', label: '账单', icon: '📋' },
  { to: '/stats', label: '统计', icon: '📊' },
  { to: '/settings', label: '配置', icon: '⚙️' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-md mx-auto">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-40">
        <div className="max-w-md mx-auto flex">
          {tabs.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs gap-0.5 ${
                  isActive ? 'text-blue-700' : 'text-gray-500'
                }`
              }
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
```

- [ ] **Step 2: Set up App with router**

Write `src/App.tsx`:
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import BillsPage from './pages/BillsPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/bills" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Update main.tsx**

Write `src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 4: Create placeholder pages**

Write `src/pages/BillsPage.tsx`:
```typescript
export default function BillsPage() {
  return <div className="p-4 text-xl">账单</div>
}
```

Write `src/pages/StatsPage.tsx`:
```typescript
export default function StatsPage() {
  return <div className="p-4 text-xl">统计</div>
}
```

Write `src/pages/SettingsPage.tsx`:
```typescript
export default function SettingsPage() {
  return <div className="p-4 text-xl">配置</div>
}
```

- [ ] **Step 5: Verify it runs**

Run:
```bash
cd d:/cc-project/money-tracker
npm run dev
```

Open `http://localhost:5173` in browser, verify three tabs switch correctly.

- [ ] **Step 6: Commit**

```bash
cd d:/cc-project/money-tracker
git add src/components/Layout.tsx src/App.tsx src/main.tsx src/pages/
git commit -m "feat: add bottom tab navigation with placeholder pages"
```

---

### Task 7: Month Picker Component

**Files:**
- Create: `src/components/MonthPicker.tsx`

- [ ] **Step 1: Write MonthPicker component**

Write `src/components/MonthPicker.tsx`:
```typescript
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
```

- [ ] **Step 2: Verify compilation**

Run:
```bash
cd d:/cc-project/money-tracker
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd d:/cc-project/money-tracker
git add src/components/MonthPicker.tsx
git commit -m "feat: add month picker component"
```

---

### Task 8: Bills Page with Record List

**Files:**
- Create: `src/components/RecordItem.tsx`
- Modify: `src/pages/BillsPage.tsx`

- [ ] **Step 1: Write RecordItem component**

Write `src/components/RecordItem.tsx`:
```typescript
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
  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-gray-50 active:bg-gray-50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400">{formatDate(transaction.date)}</span>
          <span className="text-sm font-medium text-gray-700">{eventName}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              transaction.accountType === 'public'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {transaction.accountType === 'public' ? '公账' : '私账'}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {bankName} ({bankCardNumber})
        </div>
        {transaction.note && (
          <div className="text-xs text-gray-400 mt-0.5 truncate">{transaction.note}</div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-lg font-semibold text-gray-800">
          ¥{formatAmount(transaction.amount)}
        </span>
        <button
          onClick={onDelete}
          className="text-red-400 text-xs px-2 py-1 hover:bg-red-50 rounded"
        >
          删除
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write BillsPage**

Write `src/pages/BillsPage.tsx`:
```typescript
import { useState } from 'react'
import MonthPicker from '../components/MonthPicker'
import RecordItem from '../components/RecordItem'
import BackupBanner from '../components/BackupBanner'
import AddRecordSheet from '../components/AddRecordSheet'
import { useTransactions } from '../hooks/useTransactions'
import { useBankCards } from '../hooks/useBankCards'
import { useEventTypes } from '../hooks/useEventTypes'
import { useBackup } from '../hooks/useBackup'
import { getCurrentYearMonth, formatAmount } from '../utils/format'

export default function BillsPage() {
  const [current, setCurrent] = useState(getCurrentYearMonth)
  const [showAdd, setShowAdd] = useState(false)
  const { transactions, deleteTransaction } = useTransactions(current.year, current.month)
  const { cards } = useBankCards()
  const { types } = useEventTypes()
  const { shouldRemindBackup } = useBackup()

  const eventMap = new Map(types.map(t => [t.id, t.name]))
  const cardMap = new Map(cards.map(c => [c.id, c]))

  const publicTotal = transactions
    .filter(t => t.accountType === 'public')
    .reduce((s, t) => s + t.amount, 0)

  const privateTotal = transactions
    .filter(t => t.accountType === 'private')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <div>
      <MonthPicker
        year={current.year}
        month={current.month}
        onChange={(y, m) => setCurrent({ year: y, month: m })}
      />

      {shouldRemindBackup() && <BackupBanner />}

      {/* Summary */}
      <div className="flex gap-4 px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex-1 text-center">
          <div className="text-xs text-orange-500">公账合计</div>
          <div className="text-base font-semibold">¥{formatAmount(publicTotal)}</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xs text-blue-500">私账合计</div>
          <div className="text-base font-semibold">¥{formatAmount(privateTotal)}</div>
        </div>
      </div>

      {/* Records */}
      <div>
        {transactions.length === 0 && (
          <div className="text-center text-gray-400 py-20">暂无记录，点击右下角开始记账</div>
        )}
        {transactions.map(t => (
          <RecordItem
            key={t.id}
            transaction={t}
            eventName={eventMap.get(t.eventTypeId) ?? '未知'}
            bankName={cardMap.get(t.bankCardId)?.bankName ?? '未知'}
            bankCardNumber={cardMap.get(t.bankCardId)?.cardNumber ?? ''}
            onDelete={() => deleteTransaction(t.id!)}
          />
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-700 text-white rounded-full shadow-lg
                   flex items-center justify-center text-2xl active:bg-blue-800 z-30"
      >
        +
      </button>

      {showAdd && (
        <AddRecordSheet
          onClose={() => setShowAdd(false)}
          onSaved={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create BackupBanner placeholder**

Write `src/components/BackupBanner.tsx`:
```typescript
export default function BackupBanner() {
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 text-center">
      建议备份数据以确保安全，前往「统计」页导出
    </div>
  )
}
```

- [ ] **Step 4: Create AddRecordSheet placeholder**

Write `src/components/AddRecordSheet.tsx`:
```typescript
interface Props {
  onClose: () => void
  onSaved: () => void
}

export default function AddRecordSheet({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center text-gray-400">记账表单（待实现）</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify compilation and run**

Run:
```bash
cd d:/cc-project/money-tracker
npx tsc --noEmit
npm run dev
```

Expected: bills page renders with month picker and empty state.

- [ ] **Step 6: Commit**

```bash
cd d:/cc-project/money-tracker
git add src/components/RecordItem.tsx src/components/BackupBanner.tsx src/components/AddRecordSheet.tsx src/pages/BillsPage.tsx
git commit -m "feat: add bills page with record list, summary, and FAB"
```

---

### Task 9: Add Record Bottom Sheet

**Files:**
- Modify: `src/components/AddRecordSheet.tsx`

- [ ] **Step 1: Write full AddRecordSheet**

Write `src/components/AddRecordSheet.tsx`:
```typescript
import { useState } from 'react'
import { useBankCards } from '../hooks/useBankCards'
import { useEventTypes } from '../hooks/useEventTypes'
import { useTransactions } from '../hooks/useTransactions'
import { getCurrentYearMonth, todayStr } from '../utils/format'

interface Props {
  onClose: () => void
  onSaved: () => void
}

export default function AddRecordSheet({ onClose, onSaved }: Props) {
  const { year, month } = getCurrentYearMonth()
  const { addTransaction } = useTransactions(year, month)
  const { cards } = useBankCards()
  const { types } = useEventTypes()

  const [date, setDate] = useState(todayStr())
  const [eventTypeId, setEventTypeId] = useState(types[0]?.id ?? 0)
  const [bankCardId, setBankCardId] = useState(cards[0]?.id ?? 0)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const selectedCard = cards.find(c => c.id === bankCardId)

  async function handleSubmit() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    if (!eventTypeId || !bankCardId) return

    await addTransaction({
      date,
      eventTypeId,
      bankCardId,
      accountType: selectedCard?.accountType ?? 'private',
      amount: amt,
      note,
    })
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-2xl px-5 py-4 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center text-lg font-semibold mb-4">记一笔</div>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-1">日期</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base"
          />
        </div>

        {/* Event Type */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-1">事件</label>
          <div className="flex flex-wrap gap-2">
            {types.map(t => (
              <button
                key={t.id}
                onClick={() => setEventTypeId(t.id!)}
                className={`px-4 py-2 rounded-full text-sm ${
                  eventTypeId === t.id
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bank Card */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-1">银行卡</label>
          <select
            value={bankCardId}
            onChange={e => setBankCardId(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base bg-white"
          >
            {cards.map(c => (
              <option key={c.id} value={c.id}>
                {c.bankName} ({c.cardNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Account Type (auto) */}
        {selectedCard && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">账户类型：</span>
            <span
              className={`text-sm px-2 py-0.5 rounded ${
                selectedCard.accountType === 'public'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {selectedCard.accountType === 'public' ? '公账' : '私账'}
            </span>
          </div>
        )}

        {/* Amount */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-1">金额</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400 text-lg">¥</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              inputMode="decimal"
              className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-lg font-semibold"
            />
          </div>
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-1">备注（选填）</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="添加备注..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-700 text-white rounded-xl py-3 text-lg font-semibold active:bg-blue-800"
        >
          提交
        </button>

        <div className="h-6" /> {/* Safe area for bottom */}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify compilation and test**

Run:
```bash
cd d:/cc-project/money-tracker
npx tsc --noEmit
npm run dev
```

Test flow: open app, click + button, fill in form, submit. Verify record appears in list.

- [ ] **Step 3: Commit**

```bash
cd d:/cc-project/money-tracker
git add src/components/AddRecordSheet.tsx
git commit -m "feat: implement add record bottom sheet with full flow"
```

---

### Task 10: Settings Page (Bank Cards + Event Types)

**Files:**
- Modify: `src/pages/SettingsPage.tsx`

- [ ] **Step 1: Write SettingsPage**

Write `src/pages/SettingsPage.tsx`:
```typescript
import { useState } from 'react'
import { useBankCards } from '../hooks/useBankCards'
import { useEventTypes } from '../hooks/useEventTypes'
import { useBackup } from '../hooks/useBackup'
import { exportFullJSON } from '../utils/export'
import { importFullJSON } from '../utils/import'

export default function SettingsPage() {
  const { cards, addCard, deleteCard } = useBankCards()
  const { types, addType, deleteType } = useEventTypes()
  const { daysSinceLastBackup, markBackupDone } = useBackup()

  const [showCardForm, setShowCardForm] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountType, setAccountType] = useState<'public' | 'private'>('private')
  const [newTypeName, setNewTypeName] = useState('')

  const days = daysSinceLastBackup()

  async function handleAddCard() {
    if (!cardNumber.trim() || !bankName.trim()) return
    await addCard(cardNumber.trim(), bankName.trim(), accountType)
    setCardNumber('')
    setBankName('')
    setShowCardForm(false)
  }

  async function handleAddType() {
    if (!newTypeName.trim()) return
    await addType(newTypeName.trim())
    setNewTypeName('')
  }

  async function handleExportJSON() {
    await exportFullJSON()
    markBackupDone()
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!confirm('导入将覆盖当前所有数据，确定继续？')) return
    try {
      await importFullJSON(file)
      alert('导入成功')
      window.location.reload()
    } catch (err) {
      alert('导入失败：' + (err as Error).message)
    }
    e.target.value = ''
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">配置</h1>

      {/* Backup Status */}
      <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
        <div className="text-sm text-gray-500 mb-2">备份状态</div>
        <div className="text-base">
          {days === null
            ? '尚未备份'
            : `上次备份：${days} 天前`}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm active:bg-blue-800"
          >
            导出 JSON 备份
          </button>
          <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm cursor-pointer active:bg-gray-200">
            导入 JSON 恢复
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Bank Cards */}
      <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">银行卡管理</h2>
          <button
            onClick={() => setShowCardForm(!showCardForm)}
            className="text-blue-700 text-sm"
          >
            + 新增
          </button>
        </div>

        {showCardForm && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg space-y-2">
            <input
              type="text"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              placeholder="银行名称（如：建设银行）"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value)}
              placeholder="卡号后4位"
              maxLength={4}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setAccountType('public')}
                className={`flex-1 py-2 rounded text-sm ${
                  accountType === 'public'
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-white border border-gray-200 text-gray-500'
                }`}
              >
                公账
              </button>
              <button
                onClick={() => setAccountType('private')}
                className={`flex-1 py-2 rounded text-sm ${
                  accountType === 'private'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-white border border-gray-200 text-gray-500'
                }`}
              >
                私账
              </button>
            </div>
            <button
              onClick={handleAddCard}
              className="w-full py-2 bg-blue-700 text-white rounded text-sm"
            >
              保存
            </button>
          </div>
        )}

        {cards.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-4">暂无银行卡</div>
        )}
        {cards.map(c => (
          <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div className="text-sm">
              {c.bankName} ({c.cardNumber})
              <span
                className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                  c.accountType === 'public'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {c.accountType === 'public' ? '公账' : '私账'}
              </span>
            </div>
            <button onClick={() => deleteCard(c.id!)} className="text-red-400 text-xs">删除</button>
          </div>
        ))}
      </div>

      {/* Event Types */}
      <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
        <h2 className="font-semibold mb-3">事件类型管理</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newTypeName}
            onChange={e => setNewTypeName(e.target.value)}
            placeholder="新事件名称"
            className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
          />
          <button
            onClick={handleAddType}
            className="px-4 py-2 bg-blue-700 text-white rounded text-sm active:bg-blue-800"
          >
            新增
          </button>
        </div>
        {types.map(t => (
          <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm">{t.name}</span>
            <button onClick={() => deleteType(t.id!)} className="text-red-400 text-xs">删除</button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify compilation**

Run:
```bash
cd d:/cc-project/money-tracker
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd d:/cc-project/money-tracker
git add src/pages/SettingsPage.tsx
git commit -m "feat: implement settings page with bank cards, event types, and backup"
```

---

### Task 11: Statistics Page with Charts

**Files:**
- Modify: `src/pages/StatsPage.tsx`

- [ ] **Step 1: Write StatsPage**

Write `src/pages/StatsPage.tsx`:
```typescript
import { useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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

  const eventMap = new Map(types.map(t => [t.id, t.name]))

  const publicTotal = transactions
    .filter(t => t.accountType === 'public')
    .reduce((s, t) => s + t.amount, 0)

  const privateTotal = transactions
    .filter(t => t.accountType === 'private')
    .reduce((s, t) => s + t.amount, 0)

  const total = publicTotal + privateTotal

  // Event type distribution
  const eventData = types.map(t => {
    const sum = transactions
      .filter(tx => tx.eventTypeId === t.id)
      .reduce((s, tx) => s + tx.amount, 0)
    return { name: t.name, value: sum }
  }).filter(d => d.value > 0)

  // Daily trend
  const { start, end } = getMonthRange(current.year, current.month)
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

      {/* Backup reminder */}
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

      {/* No data */}
      {transactions.length === 0 && (
        <div className="text-center text-gray-400 py-10">暂无数据</div>
      )}

      {/* Pie Chart - Event distribution */}
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

      {/* Bar Chart - Daily trend */}
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
```

- [ ] **Step 2: Verify compilation**

Run:
```bash
cd d:/cc-project/money-tracker
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd d:/cc-project/money-tracker
git add src/pages/StatsPage.tsx
git commit -m "feat: implement statistics page with charts and export"
```

---

### Task 12: PWA Icons and Final Polish

**Files:**
- Create: `public/icon-192.png`, `public/icon-512.png` (SVG placeholder)
- Modify: `index.html`

- [ ] **Step 1: Create placeholder icon SVG**

Write `public/icon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#1e40af">
  <rect width="512" height="512" rx="100"/>
  <text x="256" y="300" text-anchor="middle" fill="white" font-size="280" font-family="sans-serif">¥</text>
</svg>
```

- [ ] **Step 2: Generate PNG icons**

For now use the SVG as PWA icons. Update `vite.config.ts` to reference SVG directly:
Modify `vite.config.ts`:
```typescript
icons: [
  { src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
  { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' },
],
```

- [ ] **Step 3: Add safe area CSS**

Append to `src/index.css`:
```css
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

- [ ] **Step 4: Full build test**

Run:
```bash
cd d:/cc-project/money-tracker
npm run build
```

Expected: build succeeds, `dist/` folder created with service worker files.

- [ ] **Step 5: Verify everything compiles**

Run:
```bash
cd d:/cc-project/money-tracker
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
cd d:/cc-project/money-tracker
git add public/icon.svg vite.config.ts src/index.css
git commit -m "feat: add PWA icons and safe area support"
```

---

### Task 13: Final Integration Test

**Files:** None (testing only)

- [ ] **Step 1: Start dev server and test full flow**

Run:
```bash
cd d:/cc-project/money-tracker
npm run dev
```

Manual test checklist:
1. App opens to 账单 tab
2. Settings tab → add a bank card (e.g., 建设银行, 1234, 私账)
3. Settings tab → add an event type (e.g., 餐饮)
4. Click + FAB → fill in record: select date, event, bank card, enter amount, add note
5. Verify account type auto-shows based on card
6. Submit → verify record appears in bills list
7. Add more records with different events and amounts
8. Verify summary totals update correctly
9. Switch to 统计 tab → verify charts render
10. Click 导出 Excel → verify file downloads
11. Switch months → verify filtering works
12. Delete a record → verify it disappears
13. Test Settings → import/export JSON
14. Open Chrome DevTools → Application → Manifest → verify PWA manifest loads

- [ ] **Step 2: Commit**

```bash
cd d:/cc-project/money-tracker
git add -A
git commit -m "feat: final integration and testing"
```
