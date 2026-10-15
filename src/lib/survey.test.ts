import { describe, expect, it } from 'vitest'
import { buildSteps, canInviteReview, canSubmit, commentPrompt, emptyDraft, parseSurveyParams, shouldCreateAlert } from './survey'
import type { SurveyDraft } from '../types'

const completo: SurveyDraft = {
  recorrido: 'palermo',
  guia: 'mariana',
  estrellasGeneral: 5,
  bici: 'impecable',
  casco: 'comodo',
  estrellasGuia: 5,
  chips: ['El guía'],
  comentario: 'Muy lindo todo',
  contactoNombre: '',
  contactoWhatsapp: '',
  consentimiento: true,
}

describe('canInviteReview', () => {
  it('invita solo con 4 y 5 estrellas', () => {
    expect(canInviteReview(4)).toBe(true)
    expect(canInviteReview(5)).toBe(true)
  })
  it('no invita con 1, 2 ni 3 estrellas', () => {
    expect(canInviteReview(1)).toBe(false)
    expect(canInviteReview(2)).toBe(false)
    expect(canInviteReview(3)).toBe(false)
  })
  it('no invita con valores inválidos', () => {
    expect(canInviteReview(null)).toBe(false)
    expect(canInviteReview(undefined)).toBe(false)
    expect(canInviteReview(0)).toBe(false)
    expect(canInviteReview(6)).toBe(false)
    expect(canInviteReview(4.5)).toBe(false)
  })
})

describe('shouldCreateAlert', () => {
  it('crea alerta solo con 1 y 2 estrellas', () => {
    expect(shouldCreateAlert(1)).toBe(true)
    expect(shouldCreateAlert(2)).toBe(true)
    expect(shouldCreateAlert(3)).toBe(false)
    expect(shouldCreateAlert(4)).toBe(false)
    expect(shouldCreateAlert(5)).toBe(false)
    expect(shouldCreateAlert(null)).toBe(false)
  })
})

describe('commentPrompt', () => {
  it('pide contacto solo en el caso negativo', () => {
    expect(commentPrompt(1).pedirContacto).toBe(true)
    expect(commentPrompt(2).pedirContacto).toBe(true)
    expect(commentPrompt(3).pedirContacto).toBe(false)
    expect(commentPrompt(5).pedirContacto).toBe(false)
  })
  it('cambia el título según la calificación', () => {
    expect(commentPrompt(2).titulo).toContain('¿Qué salió mal?')
    expect(commentPrompt(3).titulo).toBe('¿Qué mejorarías?')
    expect(commentPrompt(4).titulo).toBe('¿Qué fue lo mejor?')
  })
})

describe('canSubmit (bloqueo sin consentimiento)', () => {
  it('bloquea el envío sin consentimiento aunque todo lo demás esté completo', () => {
    const sinConsentimiento = { ...completo, consentimiento: false }
    const check = canSubmit(sinConsentimiento)
    expect(check.ok).toBe(false)
    expect(check.motivo).toMatch(/política de privacidad/i)
  })
  it('permite el envío con consentimiento y respuestas obligatorias', () => {
    expect(canSubmit(completo)).toEqual({ ok: true, motivo: null })
  })
  it('bloquea si falta una respuesta obligatoria', () => {
    expect(canSubmit({ ...completo, bici: null }).ok).toBe(false)
  })
})

describe('parámetros de URL y pasos', () => {
  it('precarga recorrido y guía válidos', () => {
    expect(parseSurveyParams('?recorrido=palermo&guia=mariana')).toEqual({ recorrido: 'palermo', guia: 'mariana' })
  })
  it('ignora valores desconocidos', () => {
    expect(parseSurveyParams('?recorrido=tigre&guia=nadie')).toEqual({ recorrido: null, guia: '' })
  })
  it('salta la pantalla de recorrido si vino por URL', () => {
    expect(buildSteps({ recorrido: 'la-boca', guia: '' })[0]).toBe('general')
    expect(buildSteps({ recorrido: null, guia: '' })[0]).toBe('recorrido')
    expect(emptyDraft({ recorrido: 'la-boca', guia: 'tomas' }).recorrido).toBe('la-boca')
  })
})
