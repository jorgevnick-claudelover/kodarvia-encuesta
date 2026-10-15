import { config } from '../config'
import { dayKey, shiftDayKey } from './dates'
import { BICI_OPCIONES, CASCO_OPCIONES, canInviteReview } from './survey'
import type { Alert, DateFilter, FeedbackResponse, Filters, RecorridoId, Stars } from '../types'

/** Funciones puras de estadísticas y filtros. No tocan el almacenamiento. */

export const round1 = (n: number): number => Math.round(n * 10) / 10

export function average(responses: FeedbackResponse[]): number | null {
  if (responses.length === 0) return null
  const sum = responses.reduce((acc, r) => acc + r.estrellasGeneral, 0)
  return round1(sum / responses.length)
}

export function distribution(responses: FeedbackResponse[]): Record<Stars, number> {
  const base: Record<Stars, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const r of responses) base[r.estrellasGeneral] += 1
  return base
}

/** Porcentaje de respuestas de 4 o 5 estrellas, entero */
export function positivePercent(responses: FeedbackResponse[]): number | null {
  if (responses.length === 0) return null
  const positivas = responses.filter((r) => canInviteReview(r.estrellasGeneral)).length
  return Math.round((positivas / responses.length) * 100)
}

export interface ReviewClickStats {
  invitaciones: number
  clics: number
  porcentaje: number | null
}

export function reviewClickStats(responses: FeedbackResponse[]): ReviewClickStats {
  const invitadas = responses.filter((r) => r.reviewInvited)
  const clics = invitadas.filter((r) => r.reviewClicked).length
  return {
    invitaciones: invitadas.length,
    clics,
    porcentaje: invitadas.length === 0 ? null : Math.round((clics / invitadas.length) * 100),
  }
}

export interface DailyPoint {
  dia: string
  promedio: number
  cantidad: number
}

/** Promedio por día (hora de Buenos Aires), ordenado de más antiguo a más reciente */
export function dailySeries(responses: FeedbackResponse[]): DailyPoint[] {
  const acc = new Map<string, { sum: number; n: number }>()
  for (const r of responses) {
    const key = dayKey(r.createdAt)
    const cur = acc.get(key) ?? { sum: 0, n: 0 }
    acc.set(key, { sum: cur.sum + r.estrellasGeneral, n: cur.n + 1 })
  }
  return [...acc.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([dia, { sum, n }]) => ({ dia, promedio: round1(sum / n), cantidad: n }))
}

export interface RecorridoPoint {
  recorrido: RecorridoId
  nombre: string
  promedio: number | null
  cantidad: number
}

export function averageByRecorrido(responses: FeedbackResponse[]): RecorridoPoint[] {
  return config.recorridos.map((rec) => {
    const propias = responses.filter((r) => r.recorrido === rec.id)
    return { recorrido: rec.id, nombre: rec.nombre, promedio: average(propias), cantidad: propias.length }
  })
}

export interface ProblemPoint {
  categoria: 'Bici' | 'Casco'
  etiqueta: string
  cantidad: number
}

/** Frecuencia de problemas de bici y casco (excluye las opciones sin problema) */
export function problemFrequency(responses: FeedbackResponse[]): ProblemPoint[] {
  const bici = BICI_OPCIONES.filter((o) => o.esProblema).map<ProblemPoint>((o) => ({
    categoria: 'Bici',
    etiqueta: o.label,
    cantidad: responses.filter((r) => r.bici === o.value).length,
  }))
  const casco = CASCO_OPCIONES.filter((o) => o.esProblema).map<ProblemPoint>((o) => ({
    categoria: 'Casco',
    etiqueta: o.label,
    cantidad: responses.filter((r) => r.casco === o.value).length,
  }))
  return [...bici, ...casco]
}

/** Rango [desde, hasta] de claves de día en Buenos Aires para un filtro de fecha; null = sin límite */
export function dateRange(filter: DateFilter, now: Date): { desde: string | null; hasta: string | null } {
  const hoy = dayKey(now)
  switch (filter.preset) {
    case 'hoy':
      return { desde: hoy, hasta: hoy }
    case '7d':
      return { desde: shiftDayKey(hoy, -6), hasta: hoy }
    case '30d':
      return { desde: shiftDayKey(hoy, -29), hasta: hoy }
    case 'personalizado':
      return { desde: filter.desde || null, hasta: filter.hasta || null }
    default:
      return { desde: null, hasta: null }
  }
}

export function filterByDate(responses: FeedbackResponse[], filter: DateFilter, now: Date = new Date()): FeedbackResponse[] {
  const { desde, hasta } = dateRange(filter, now)
  if (!desde && !hasta) return responses
  return responses.filter((r) => {
    const key = dayKey(r.createdAt)
    if (desde && key < desde) return false
    if (hasta && key > hasta) return false
    return true
  })
}

export function filterByStars(responses: FeedbackResponse[], min: Stars, max: Stars): FeedbackResponse[] {
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  return responses.filter((r) => r.estrellasGeneral >= lo && r.estrellasGeneral <= hi)
}

export function filterByRecorrido(responses: FeedbackResponse[], recorrido: RecorridoId | 'todos'): FeedbackResponse[] {
  if (recorrido === 'todos') return responses
  return responses.filter((r) => r.recorrido === recorrido)
}

export function applyFilters(responses: FeedbackResponse[], filters: Filters, now: Date = new Date()): FeedbackResponse[] {
  const porFecha = filterByDate(responses, filters.fecha, now)
  const porEstrellas = filterByStars(porFecha, filters.minEstrellas, filters.maxEstrellas)
  return filterByRecorrido(porEstrellas, filters.recorrido)
}

export const DEFAULT_FILTERS: Filters = {
  fecha: { preset: 'todo', desde: '', hasta: '' },
  minEstrellas: 1,
  maxEstrellas: 5,
  recorrido: 'todos',
}

export function isDefaultFilters(f: Filters): boolean {
  return (
    f.fecha.preset === 'todo' && f.minEstrellas === 1 && f.maxEstrellas === 5 && f.recorrido === 'todos'
  )
}

export function sortByDate(responses: FeedbackResponse[], direction: 'asc' | 'desc'): FeedbackResponse[] {
  const sorted = [...responses].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  return direction === 'desc' ? sorted.reverse() : sorted
}

export function openAlerts(alerts: Alert[]): Alert[] {
  return alerts.filter((a) => a.estado === 'abierta').sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function resolvedAlerts(alerts: Alert[]): Alert[] {
  return alerts
    .filter((a) => a.estado === 'resuelta')
    .sort((a, b) => (b.resueltaAt ?? b.createdAt).localeCompare(a.resueltaAt ?? a.createdAt))
}
