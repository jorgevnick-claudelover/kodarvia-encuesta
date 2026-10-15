import { describe, expect, it } from 'vitest'
import { readOutbox } from './notifications'
import { markReviewClicked, readAlerts, readResponses, resolveAlert, submitResponse } from './store'
import type { SurveyDraft } from '../types'

const base: SurveyDraft = {
  recorrido: 'san-telmo',
  guia: 'tomas',
  estrellasGeneral: 5,
  bici: 'impecable',
  casco: 'comodo',
  estrellasGuia: 5,
  chips: [],
  comentario: '',
  contactoNombre: '',
  contactoWhatsapp: '',
  consentimiento: true,
}

describe('creación de alertas al enviar', () => {
  it('crea alerta abierta y mensajes en la bandeja con 1 estrella', () => {
    const { response, alert } = submitResponse({ ...base, estrellasGeneral: 1, chips: ['Frenos'], contactoNombre: 'Ana', contactoWhatsapp: '+5491155550000' })
    expect(alert).not.toBeNull()
    expect(alert?.estado).toBe('abierta')
    expect(alert?.responseId).toBe(response.id)
    expect(response.alertId).toBe(alert?.id)
    expect(response.reviewInvited).toBe(false)
    expect(readAlerts()).toHaveLength(1)
    const outbox = readOutbox()
    expect(outbox.map((m) => m.canal).sort()).toEqual(['email', 'whatsapp'])
    expect(outbox[0].texto).toContain('Ana')
  })

  it('crea alerta con 2 estrellas', () => {
    const { alert } = submitResponse({ ...base, estrellasGeneral: 2 })
    expect(alert?.estado).toBe('abierta')
  })

  it('no crea alerta con 3, 4 ni 5 estrellas', () => {
    for (const estrellas of [3, 4, 5] as const) {
      const { alert, response } = submitResponse({ ...base, estrellasGeneral: estrellas })
      expect(alert).toBeNull()
      expect(response.alertId).toBeNull()
    }
    expect(readAlerts()).toHaveLength(0)
    expect(readOutbox()).toHaveLength(0)
  })

  it('marca reviewInvited solo con 4 y 5', () => {
    expect(submitResponse({ ...base, estrellasGeneral: 3 }).response.reviewInvited).toBe(false)
    expect(submitResponse({ ...base, estrellasGeneral: 4 }).response.reviewInvited).toBe(true)
  })

  it('rechaza el envío sin consentimiento', () => {
    expect(() => submitResponse({ ...base, consentimiento: false })).toThrow(/consentimiento/)
    expect(readResponses()).toHaveLength(0)
  })
})

describe('resolución de alertas y clic en reseña', () => {
  it('exige nota de resolución', () => {
    const { alert } = submitResponse({ ...base, estrellasGeneral: 1 })
    expect(resolveAlert(alert!.id, '   ')).toBe(false)
    expect(readAlerts()[0].estado).toBe('abierta')
    expect(resolveAlert(alert!.id, 'Cambiamos la bici y llamamos al cliente')).toBe(true)
    const resuelta = readAlerts()[0]
    expect(resuelta.estado).toBe('resuelta')
    expect(resuelta.resueltaAt).not.toBeNull()
  })

  it('registra reviewClicked', () => {
    const { response } = submitResponse({ ...base, estrellasGeneral: 5 })
    markReviewClicked(response.id)
    expect(readResponses()[0].reviewClicked).toBe(true)
  })
})
