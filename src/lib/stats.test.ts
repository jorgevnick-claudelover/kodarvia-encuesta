import { describe, expect, it } from 'vitest'
import { average, dailySeries, distribution, filterByDate, filterByStars, positivePercent } from './stats'
import type { FeedbackResponse, Stars } from '../types'

function resp(createdAt: string, estrellas: Stars, id = createdAt): FeedbackResponse {
  return {
    id,
    createdAt,
    recorrido: 'palermo',
    guia: 'mariana',
    estrellasGeneral: estrellas,
    bici: 'impecable',
    casco: 'comodo',
    estrellasGuia: estrellas,
    chips: [],
    comentario: '',
    contactoNombre: '',
    contactoWhatsapp: '',
    consentimiento: { aceptado: true, timestamp: createdAt },
    reviewInvited: estrellas >= 4,
    reviewClicked: false,
    alertId: null,
  }
}

// "Ahora": 15/10/2026 12:00 UTC = 09:00 en Buenos Aires
const now = new Date('2026-10-15T12:00:00Z')

describe('filtros por fecha en zona de Buenos Aires', () => {
  const ayerTardeBA = resp('2026-10-15T01:30:00Z', 5, 'ayer-22-30') // 14/10 22:30 BA
  const hoyMadrugadaBA = resp('2026-10-15T03:30:00Z', 4, 'hoy-00-30') // 15/10 00:30 BA
  const hoyNocheBA = resp('2026-10-16T02:59:00Z', 3, 'hoy-23-59') // 15/10 23:59 BA
  const mananaBA = resp('2026-10-16T03:00:00Z', 2, 'manana-00-00') // 16/10 00:00 BA
  const hace6dias = resp('2026-10-09T15:00:00Z', 5, 'hace-6')
  const hace7dias = resp('2026-10-08T15:00:00Z', 5, 'hace-7')
  const hace29dias = resp('2026-09-16T15:00:00Z', 5, 'hace-29')
  const hace30dias = resp('2026-09-15T15:00:00Z', 5, 'hace-30')
  const todas = [ayerTardeBA, hoyMadrugadaBA, hoyNocheBA, mananaBA, hace6dias, hace7dias, hace29dias, hace30dias]

  it('"Hoy" usa el día de Buenos Aires, no el de UTC', () => {
    const ids = filterByDate(todas, { preset: 'hoy', desde: '', hasta: '' }, now).map((r) => r.id)
    expect(ids).toEqual(['hoy-00-30', 'hoy-23-59'])
  })

  it('"7 días" incluye hoy y los 6 anteriores', () => {
    const ids = filterByDate(todas, { preset: '7d', desde: '', hasta: '' }, now).map((r) => r.id)
    expect(ids).toContain('hace-6')
    expect(ids).not.toContain('hace-7')
    expect(ids).toContain('hoy-00-30')
    expect(ids).not.toContain('manana-00-00')
  })

  it('"30 días" incluye hoy y los 29 anteriores', () => {
    const ids = filterByDate(todas, { preset: '30d', desde: '', hasta: '' }, now).map((r) => r.id)
    expect(ids).toContain('hace-29')
    expect(ids).not.toContain('hace-30')
  })

  it('"Todo" no filtra', () => {
    expect(filterByDate(todas, { preset: 'todo', desde: '', hasta: '' }, now)).toHaveLength(todas.length)
  })

  it('"Personalizado" respeta desde y hasta en días de Buenos Aires', () => {
    const ids = filterByDate(todas, { preset: 'personalizado', desde: '2026-10-14', hasta: '2026-10-15' }, now).map((r) => r.id)
    expect(ids).toEqual(['ayer-22-30', 'hoy-00-30', 'hoy-23-59'])
  })
})

describe('filtros por rango de estrellas', () => {
  const lista = ([1, 2, 3, 4, 5] as Stars[]).map((s) => resp(`2026-10-0${s}T15:00:00Z`, s, `s${s}`))

  it('incluye los extremos del rango', () => {
    expect(filterByStars(lista, 2, 4).map((r) => r.id)).toEqual(['s2', 's3', 's4'])
  })
  it('acepta rango de un solo valor', () => {
    expect(filterByStars(lista, 5, 5).map((r) => r.id)).toEqual(['s5'])
  })
  it('tolera min y max invertidos', () => {
    expect(filterByStars(lista, 4, 2).map((r) => r.id)).toEqual(['s2', 's3', 's4'])
  })
  it('rango completo devuelve todo', () => {
    expect(filterByStars(lista, 1, 5)).toHaveLength(5)
  })
})

describe('promedios y distribución', () => {
  it('promedio con 1 decimal', () => {
    const lista = [resp('2026-10-01T15:00:00Z', 5, 'a'), resp('2026-10-01T16:00:00Z', 4, 'b'), resp('2026-10-01T17:00:00Z', 4, 'c')]
    expect(average(lista)).toBe(4.3)
  })
  it('promedio nulo sin respuestas', () => {
    expect(average([])).toBeNull()
    expect(positivePercent([])).toBeNull()
  })
  it('porcentaje de 4-5 estrellas', () => {
    const lista = [resp('2026-10-01T15:00:00Z', 5, 'a'), resp('2026-10-01T16:00:00Z', 2, 'b'), resp('2026-10-01T17:00:00Z', 4, 'c'), resp('2026-10-01T18:00:00Z', 3, 'd')]
    expect(positivePercent(lista)).toBe(50)
  })
  it('distribución por estrellas', () => {
    const lista = [resp('2026-10-01T15:00:00Z', 5, 'a'), resp('2026-10-01T16:00:00Z', 5, 'b'), resp('2026-10-01T17:00:00Z', 1, 'c')]
    expect(distribution(lista)).toEqual({ 1: 1, 2: 0, 3: 0, 4: 0, 5: 2 })
  })
  it('serie diaria agrupa por día de Buenos Aires y ordena', () => {
    const lista = [
      resp('2026-10-15T01:30:00Z', 2, 'a'), // 14/10 BA
      resp('2026-10-15T03:30:00Z', 4, 'b'), // 15/10 BA
      resp('2026-10-15T20:00:00Z', 5, 'c'), // 15/10 BA
    ]
    expect(dailySeries(lista)).toEqual([
      { dia: '2026-10-14', promedio: 2, cantidad: 1 },
      { dia: '2026-10-15', promedio: 4.5, cantidad: 2 },
    ])
  })
})
