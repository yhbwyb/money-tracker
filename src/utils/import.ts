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
