import { useCallback, useEffect, useState } from 'react'
import { readOutbox } from '../lib/notifications'
import { CHANGE_EVENT } from '../lib/storage'
import { initStore, readAlerts, readResponses } from '../lib/store'
import type { Alert, FeedbackResponse, OutboxMessage } from '../types'

export interface FeedbackSnapshot {
  responses: FeedbackResponse[]
  alerts: Alert[]
  outbox: OutboxMessage[]
  /** Se incrementa en cada cambio; útil como dependencia */
  version: number
}

function readSnapshot(version: number): FeedbackSnapshot {
  return { responses: readResponses(), alerts: readAlerts(), outbox: readOutbox(), version }
}

/**
 * Estado en tiempo real del feedback.
 * Se suscribe al evento nativo "storage" (cambios desde otras pestañas) y al CustomEvent
 * propio de storage.ts (cambios en la misma pestaña). Al responder la encuesta en una
 * pestaña, el panel abierto en otra recalcula sin recargar.
 */
export function useFeedbackStore(): FeedbackSnapshot & { refresh: () => void } {
  const [snapshot, setSnapshot] = useState<FeedbackSnapshot>(() => {
    initStore()
    return readSnapshot(0)
  })

  const refresh = useCallback(() => {
    setSnapshot((prev) => readSnapshot(prev.version + 1))
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      // event.key === null cuando se limpia todo el almacenamiento
      if (event.key === null || event.key.startsWith('bicifeedback:')) refresh()
    }
    const onLocalChange = () => refresh()

    window.addEventListener('storage', onStorage)
    window.addEventListener(CHANGE_EVENT, onLocalChange)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(CHANGE_EVENT, onLocalChange)
    }
  }, [refresh])

  return { ...snapshot, refresh }
}
