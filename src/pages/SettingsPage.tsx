import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useBackup } from '../hooks/useBackup'
import { exportFullJSON } from '../utils/export'
import { importFullJSON } from '../utils/import'
import db from '../db'

export default function SettingsPage() {
  const cards = useLiveQuery(() => db.bankCards.toArray()) ?? []
  const types = useLiveQuery(() => db.eventTypes.toArray()) ?? []
  const { daysSinceLastBackup, markBackupDone } = useBackup()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showCardForm, setShowCardForm] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountType, setAccountType] = useState<'public' | 'private'>('private')
  const [newTypeName, setNewTypeName] = useState('')

  const days = daysSinceLastBackup()

  async function handleDeleteCard(id: number) {
    const count = await db.transactions.where('bankCardId').equals(id).count()
    const msg = count > 0
      ? `该银行卡有 ${count} 条关联记录，删除后相关记录将显示为"未知"。确定删除？`
      : '确定删除该银行卡？'
    if (confirm(msg)) {
      await db.bankCards.delete(id)
    }
  }

  async function handleDeleteType(id: number) {
    const count = await db.transactions.where('eventTypeId').equals(id).count()
    const msg = count > 0
      ? `该事由有 ${count} 条关联记录，删除后相关记录将显示为"未知"。确定删除？`
      : '确定删除该事由？'
    if (confirm(msg)) {
      await db.eventTypes.delete(id)
    }
  }

  async function handleAddCard() {
    if (!cardNumber.trim() || !bankName.trim()) return
    await db.bankCards.add({ cardNumber: cardNumber.trim(), bankName: bankName.trim(), accountType })
    setCardNumber('')
    setBankName('')
    setShowCardForm(false)
  }

  async function handleAddType() {
    if (!newTypeName.trim()) return
    await db.eventTypes.add({ name: newTypeName.trim() })
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

  const sectionTitle: React.CSSProperties = {
    fontFamily: 'var(--font-serif)',
    fontWeight: 700,
    letterSpacing: '0.15em',
    fontSize: '0.85rem',
    marginBottom: '0.75rem',
  }

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Page header */}
      <h1
        className="text-center font-serif font-bold mb-4 tracking-widest"
        style={{ fontSize: '1.1rem', letterSpacing: '0.3em' }}
      >
        印 鉴
      </h1>

      <div className="divider-ink mb-5" />

      {/* Backup */}
      <div className="card-paper p-4 mb-4">
        <h3 style={sectionTitle}>备份 · 留底</h3>
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-light)' }}>
            {days === null ? '尚未留底' : `上次留底：${days} 天前`}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportJSON}
            className="btn-ink flex-1 rounded-lg py-2.5 font-serif font-bold tracking-wider text-sm"
            style={{ letterSpacing: '0.12em' }}
          >
            导出留底
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 rounded-lg py-2.5 font-serif font-bold tracking-wider text-sm border transition-all active:opacity-60"
            style={{
              borderColor: 'var(--color-paper-darker)',
              color: 'var(--color-ink-light)',
              letterSpacing: '0.12em',
            }}
          >
            还原留底
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* Bank Cards */}
      <div className="card-paper p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 style={sectionTitle}>银票</h3>
          <button
            onClick={() => setShowCardForm(!showCardForm)}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.2rem',
              color: 'var(--color-ink)',
              lineHeight: 1,
            }}
          >
            {showCardForm ? '−' : '+'}
          </button>
        </div>

        {showCardForm && (
          <div className="mb-3 p-4 rounded-lg space-y-3" style={{ backgroundColor: 'var(--color-paper-dark)' }}>
            <input
              type="text"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              placeholder="银行名称"
              className="input-ink w-full"
              style={{ fontSize: '0.85rem' }}
            />
            <input
              type="text"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value)}
              placeholder="卡号后四位"
              maxLength={4}
              className="input-ink w-full"
              style={{ fontSize: '0.85rem' }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setAccountType('public')}
                className={`flex-1 py-2 rounded-lg text-sm font-serif tracking-wider transition-all ${
                  accountType === 'public'
                    ? 'text-white'
                    : 'bg-white border text-gray-500'
                }`}
                style={{
                  backgroundColor: accountType === 'public' ? 'var(--color-vermillion)' : undefined,
                  borderColor: accountType !== 'public' ? 'rgba(44,36,22,0.1)' : undefined,
                }}
              >
                公账
              </button>
              <button
                onClick={() => setAccountType('private')}
                className={`flex-1 py-2 rounded-lg text-sm font-serif tracking-wider transition-all ${
                  accountType === 'private'
                    ? 'text-white'
                    : 'bg-white border text-gray-500'
                }`}
                style={{
                  backgroundColor: accountType === 'private' ? 'var(--color-ink)' : undefined,
                  borderColor: accountType !== 'private' ? 'rgba(44,36,22,0.1)' : undefined,
                }}
              >
                私账
              </button>
            </div>
            <button
              onClick={handleAddCard}
              className="btn-ink w-full rounded-lg py-2 font-serif font-bold tracking-wider text-sm"
            >
              纳 入
            </button>
          </div>
        )}

        {cards.length === 0 && (
          <div className="text-center py-4" style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', opacity: 0.5 }}>
            暂无银票
          </div>
        )}
        {cards.map(c => (
          <div
            key={c.id}
            className="flex items-center justify-between py-2.5"
            style={{ borderBottom: '1px solid rgba(44,36,22,0.04)' }}
          >
            <div className="flex items-center gap-2" style={{ fontSize: '0.85rem' }}>
              <span>{c.bankName}</span>
              <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.75rem' }}>
                ····{c.cardNumber}
              </span>
              <span className={c.accountType === 'public' ? 'seal-public' : 'seal-private'}>
                {c.accountType === 'public' ? '公' : '私'}
              </span>
            </div>
            <button
              onClick={() => handleDeleteCard(c.id!)}
              style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', opacity: 0.5 }}
            >
              删
            </button>
          </div>
        ))}
      </div>

      {/* Event Types */}
      <div className="card-paper p-4 mb-4">
        <h3 style={sectionTitle}>事由</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newTypeName}
            onChange={e => setNewTypeName(e.target.value)}
            placeholder="新事由…"
            className="input-ink flex-1"
            style={{ fontSize: '0.85rem' }}
          />
          <button
            onClick={handleAddType}
            className="btn-ink rounded-lg px-4 py-2 font-serif font-bold tracking-wider text-sm"
            style={{ letterSpacing: '0.12em' }}
          >
            添
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {types.map(t => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
              style={{
                backgroundColor: 'var(--color-paper-dark)',
                fontSize: '0.8rem',
              }}
            >
              {t.name}
              <button
                onClick={() => handleDeleteType(t.id!)}
                style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', opacity: 0.5, lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div
        className="text-center pb-8"
        style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', opacity: 0.45 }}
      >
        V2.4.0
      </div>
    </div>
  )
}
