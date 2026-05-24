import { useState, useRef } from 'react'
import { useBankCards } from '../hooks/useBankCards'
import { useEventTypes } from '../hooks/useEventTypes'
import { useBackup } from '../hooks/useBackup'
import { exportFullJSON } from '../utils/export'
import { importFullJSON } from '../utils/import'

export default function SettingsPage() {
  const { cards, addCard, deleteCard } = useBankCards()
  const { types, addType, deleteType } = useEventTypes()
  const { daysSinceLastBackup, markBackupDone } = useBackup()
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          {days === null ? '尚未备份' : `上次备份：${days} 天前`}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm active:bg-blue-800"
          >
            导出 JSON 备份
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm active:bg-gray-200"
          >
            导入 JSON 恢复
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
