import { guiaNombre, recorridoNombre } from '../config'
import { dayKey, isoBuenosAires } from './dates'
import { biciLabel, cascoLabel } from './survey'
import type { FeedbackResponse } from '../types'

/** Marca de orden de bytes para que Excel lea tildes y ñ en UTF-8 */
export const BOM = '﻿'

export const CSV_HEADERS = [
  'id',
  'createdAtISO',
  'createdAtBuenosAires',
  'recorrido',
  'recorridoNombre',
  'guia',
  'guiaNombre',
  'estrellasGeneral',
  'bici',
  'biciDetalle',
  'casco',
  'cascoDetalle',
  'estrellasGuia',
  'chips',
  'comentario',
  'contactoNombre',
  'contactoWhatsapp',
  'consentimiento',
  'consentimientoTimestamp',
  'reviewInvited',
  'reviewClicked',
  'alertId',
] as const

/** Escapa un campo: si tiene coma, comillas o saltos de línea va entre comillas, con comillas dobladas */
export function escapeField(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return ''
  const text = String(value)
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function responseToRow(r: FeedbackResponse): string[] {
  return [
    r.id,
    r.createdAt,
    isoBuenosAires(r.createdAt),
    r.recorrido,
    recorridoNombre(r.recorrido),
    r.guia,
    r.guia ? guiaNombre(r.guia) : '',
    String(r.estrellasGeneral),
    r.bici,
    biciLabel(r.bici),
    r.casco,
    cascoLabel(r.casco),
    String(r.estrellasGuia),
    r.chips.join('; '),
    r.comentario,
    r.contactoNombre,
    r.contactoWhatsapp,
    r.consentimiento.aceptado ? 'true' : 'false',
    r.consentimiento.timestamp ?? '',
    r.reviewInvited ? 'true' : 'false',
    r.reviewClicked ? 'true' : 'false',
    r.alertId ?? '',
  ]
}

/** Genera el CSV completo (con BOM) de las respuestas indicadas */
export function buildCsv(responses: FeedbackResponse[]): string {
  const lines = [CSV_HEADERS.join(',')]
  for (const r of responses) {
    lines.push(responseToRow(r).map(escapeField).join(','))
  }
  return BOM + lines.join('\r\n') + '\r\n'
}

export function csvFilename(now: Date = new Date()): string {
  return `feedback-cicloturismo-${dayKey(now)}.csv`
}

/** Dispara la descarga en el navegador */
export function downloadCsv(responses: FeedbackResponse[], now: Date = new Date()): void {
  const blob = new Blob([buildCsv(responses)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = csvFilename(now)
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
