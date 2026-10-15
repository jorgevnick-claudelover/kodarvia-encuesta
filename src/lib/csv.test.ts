import { describe, expect, it } from 'vitest'
import { BOM, CSV_HEADERS, buildCsv, csvFilename, escapeField } from './csv'
import type { FeedbackResponse } from '../types'

const r: FeedbackResponse = {
  id: 'resp_1',
  createdAt: '2026-10-14T19:30:00.000Z',
  recorrido: 'san-telmo',
  guia: 'mariana',
  estrellasGeneral: 2,
  bici: 'problemas',
  casco: 'comodo',
  estrellasGuia: 3,
  chips: ['Frenos', 'Ritmo del grupo'],
  comentario: 'Los frenos "chillaban", y el grupo iba rápido',
  contactoNombre: 'Pérez, Ñoño',
  contactoWhatsapp: '+5491155550000',
  consentimiento: { aceptado: true, timestamp: '2026-10-14T19:30:00.000Z' },
  reviewInvited: false,
  reviewClicked: false,
  alertId: 'alert_1',
}

describe('CSV', () => {
  it('empieza con BOM UTF-8', () => {
    expect(buildCsv([r]).startsWith(BOM)).toBe(true)
    expect(buildCsv([r]).charCodeAt(0)).toBe(0xfeff)
  })

  it('tiene la cabecera completa con todas las columnas', () => {
    const [cabecera] = buildCsv([r]).slice(1).split('\r\n')
    expect(cabecera).toBe(CSV_HEADERS.join(','))
    for (const col of ['id', 'createdAtISO', 'createdAtBuenosAires', 'recorrido', 'guia', 'estrellasGeneral', 'bici', 'casco', 'estrellasGuia', 'chips', 'comentario', 'contactoNombre', 'contactoWhatsapp', 'consentimiento', 'consentimientoTimestamp', 'reviewInvited', 'reviewClicked', 'alertId']) {
      expect(CSV_HEADERS).toContain(col)
    }
  })

  it('escapa comas y comillas', () => {
    expect(escapeField('sin nada')).toBe('sin nada')
    expect(escapeField('con, coma')).toBe('"con, coma"')
    expect(escapeField('con "comillas"')).toBe('"con ""comillas"""')
    expect(escapeField('salto\nde línea')).toBe('"salto\nde línea"')
    expect(escapeField(null)).toBe('')
  })

  it('incluye la fila con marca de tiempo ISO y en hora de Buenos Aires', () => {
    const fila = buildCsv([r]).slice(1).split('\r\n')[1]
    expect(fila).toContain('2026-10-14T19:30:00.000Z')
    expect(fila).toContain('2026-10-14T16:30:00-03:00')
    expect(fila).toContain('"Los frenos ""chillaban"", y el grupo iba rápido"')
    expect(fila).toContain('"Pérez, Ñoño"')
    expect(fila.split(',').length).toBeGreaterThanOrEqual(CSV_HEADERS.length)
  })

  it('nombra el archivo con la fecha de Buenos Aires', () => {
    // 15/10 01:00 UTC = 14/10 22:00 en Buenos Aires
    expect(csvFilename(new Date('2026-10-15T01:00:00Z'))).toBe('feedback-cicloturismo-2026-10-14.csv')
  })
})
