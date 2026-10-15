import { sendManagerAlert } from './notifications'
import { ensureSeed, reseed } from './seed'
import { clearAll, readJSON, writeJSON } from './storage'
import { canInviteReview, shouldCreateAlert } from './survey'
import type { Alert, FeedbackResponse, SurveyDraft } from '../types'

/** Operaciones de datos sobre respuestas y alertas. Usa storage.ts por debajo. */

export const RESPONSES_KEY = 'responses'
export const ALERTS_KEY = 'alerts'

export function readResponses(): FeedbackResponse[] {
  return readJSON<FeedbackResponse[]>(RESPONSES_KEY, [])
}

export function readAlerts(): Alert[] {
  return readJSON<Alert[]>(ALERTS_KEY, [])
}

export function newId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}_${Date.now().toString(36)}_${rand}`
}

export interface SubmitResult {
  response: FeedbackResponse
  alert: Alert | null
}

/**
 * Convierte el borrador en una respuesta persistida.
 * Con 1-2 estrellas crea la alerta y dispara la notificación simulada al encargado.
 */
export function submitResponse(draft: SurveyDraft, now: Date = new Date()): SubmitResult {
  if (
    draft.recorrido === null ||
    draft.estrellasGeneral === null ||
    draft.bici === null ||
    draft.casco === null ||
    draft.estrellasGuia === null
  ) {
    throw new Error('El borrador está incompleto')
  }
  if (!draft.consentimiento) {
    throw new Error('No se puede enviar sin consentimiento')
  }

  const createdAt = now.toISOString()
  const responseId = newId('resp')
  const crearAlerta = shouldCreateAlert(draft.estrellasGeneral)
  const alert: Alert | null = crearAlerta
    ? {
        id: newId('alert'),
        responseId,
        createdAt,
        estado: 'abierta',
        notaResolucion: null,
        resueltaAt: null,
      }
    : null

  const response: FeedbackResponse = {
    id: responseId,
    createdAt,
    recorrido: draft.recorrido,
    guia: draft.guia,
    estrellasGeneral: draft.estrellasGeneral,
    bici: draft.bici,
    casco: draft.casco,
    estrellasGuia: draft.estrellasGuia,
    chips: [...draft.chips],
    comentario: draft.comentario.trim(),
    contactoNombre: draft.contactoNombre.trim(),
    contactoWhatsapp: draft.contactoWhatsapp.trim(),
    consentimiento: { aceptado: true, timestamp: createdAt },
    reviewInvited: canInviteReview(draft.estrellasGeneral),
    reviewClicked: false,
    alertId: alert?.id ?? null,
  }

  writeJSON(RESPONSES_KEY, [...readResponses(), response])
  if (alert) {
    writeJSON(ALERTS_KEY, [...readAlerts(), alert])
    sendManagerAlert(alert, response)
  }
  return { response, alert }
}

export function markReviewClicked(responseId: string): void {
  const responses = readResponses()
  const idx = responses.findIndex((r) => r.id === responseId)
  if (idx === -1) return
  responses[idx] = { ...responses[idx], reviewClicked: true }
  writeJSON(RESPONSES_KEY, responses)
}

export function resolveAlert(alertId: string, nota: string, now: Date = new Date()): boolean {
  const limpia = nota.trim()
  if (!limpia) return false
  const alerts = readAlerts()
  const idx = alerts.findIndex((a) => a.id === alertId)
  if (idx === -1) return false
  alerts[idx] = { ...alerts[idx], estado: 'resuelta', notaResolucion: limpia, resueltaAt: now.toISOString() }
  writeJSON(ALERTS_KEY, alerts)
  return true
}

/** Borra todo el prefijo versionado y vuelve a sembrar los datos de ejemplo */
export function resetToSeed(): void {
  clearAll()
  reseed()
}

/** Siembra datos la primera vez que se abre la app */
export function initStore(): void {
  ensureSeed()
}
