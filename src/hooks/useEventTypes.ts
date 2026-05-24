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
