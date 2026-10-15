import { describe, expect, it } from 'vitest'
import { config } from '../config'
import { dayKey, formatHour } from './dates'
import { buildSeed, ensureSeed } from './seed'
import { hasKey } from './storage'
import { distribution } from './stats'

const now = new Date('2026-10-15T15:00:00Z')

describe('datos de ejemplo', () => {
  const { responses, alerts } = buildSeed(now)

  it('genera 50 respuestas con comentarios distintos', () => {
    expect(responses).toHaveLength(50)
    expect(new Set(responses.map((r) => r.comentario)).size).toBe(50)
  })

  it('respeta la distribución aproximada de estrellas', () => {
    const d = distribution(responses)
    expect(d[5]).toBe(29)
    expect(d[4]).toBe(10)
    expect(d[3]).toBe(5)
    expect(d[2]).toBe(4)
    expect(d[1]).toBe(2)
  })

  it('tiene 6 alertas: 2 abiertas (una de hoy) y 4 resueltas con nota', () => {
    expect(alerts).toHaveLength(6)
    const abiertas = alerts.filter((a) => a.estado === 'abierta')
    const resueltas = alerts.filter((a) => a.estado === 'resuelta')
    expect(abiertas).toHaveLength(2)
    expect(resueltas).toHaveLength(4)
    expect(abiertas.some((a) => dayKey(a.createdAt) === dayKey(now))).toBe(true)
    expect(resueltas.every((a) => a.notaResolucion && a.resueltaAt)).toBe(true)
  })

  it('incluye al menos 2 respuestas de hoy y horarios de 9 a 19 en Buenos Aires', () => {
    const hoy = responses.filter((r) => dayKey(r.createdAt) === dayKey(now))
    expect(hoy.length).toBeGreaterThanOrEqual(2)
    for (const r of responses) {
      const hora = Number(formatHour(r.createdAt).slice(0, 2))
      expect(hora).toBeGreaterThanOrEqual(9)
      expect(hora).toBeLessThanOrEqual(19)
    }
  })

  it('reparte entre todos los recorridos y guías', () => {
    for (const rec of config.recorridos) expect(responses.some((r) => r.recorrido === rec.id)).toBe(true)
    for (const g of config.guias) expect(responses.some((r) => r.guia === g.id)).toBe(true)
  })

  it('marca reviewClicked solo en invitadas y en parte de ellas', () => {
    const clics = responses.filter((r) => r.reviewClicked)
    expect(clics.length).toBeGreaterThan(5)
    expect(clics.every((r) => r.reviewInvited)).toBe(true)
  })

  it('siembra solo si no existe la clave versionada', () => {
    expect(hasKey('seeded')).toBe(false)
    expect(ensureSeed(now)).toBe(true)
    expect(hasKey('seeded')).toBe(true)
    expect(ensureSeed(now)).toBe(false)
  })
})
