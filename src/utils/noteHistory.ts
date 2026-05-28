export const NOTE_HISTORY_KEY = 'noteHistory'
export const MAX_HISTORY = 20

export function getNoteHistory(): string[] {
  try {
    const raw = localStorage.getItem(NOTE_HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveNoteToHistory(note: string) {
  const trimmed = note.trim()
  if (!trimmed) return
  const list = getNoteHistory().filter(n => n !== trimmed)
  list.unshift(trimmed)
  localStorage.setItem(NOTE_HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)))
}
