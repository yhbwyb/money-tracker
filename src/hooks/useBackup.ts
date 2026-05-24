import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db'

const BACKUP_KEY = 'lastBackupDate'
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
