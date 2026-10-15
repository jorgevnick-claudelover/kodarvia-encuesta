import { config, isGuiaId, isRecorridoId } from '../config'
import type { BiciEstado, CascoEstado, RecorridoId, Stars, SurveyDraft } from '../types'

/** Reglas condicionales de la encuesta. Todas son funciones puras. */

export const STAR_VALUES: Stars[] = [1, 2, 3, 4, 5]

export function isStars(value: unknown): value is Stars {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5
}

/** La invitación a Google Maps existe solo con 4 o 5 estrellas */
export function canInviteReview(stars: number | null | undefined): boolean {
  return isStars(stars) && stars >= 4
}

/** Una respuesta con 1 o 2 estrellas crea una alerta inmediata para el encargado */
export function shouldCreateAlert(stars: number | null | undefined): boolean {
  return isStars(stars) && stars <= 2
}

export type Sentimiento = 'negativo' | 'neutro' | 'positivo'

export function sentimiento(stars: Stars): Sentimiento {
  if (stars <= 2) return 'negativo'
  if (stars === 3) return 'neutro'
  return 'positivo'
}

export const BICI_OPCIONES: { value: BiciEstado; label: string; esProblema: boolean }[] = [
  { value: 'impecable', label: 'Impecable', esProblema: false },
  { value: 'detalle-menor', label: 'Algún detalle menor', esProblema: true },
  { value: 'problemas', label: 'Tuve problemas', esProblema: true },
]

export const CASCO_OPCIONES: { value: CascoEstado; label: string; esProblema: boolean }[] = [
  { value: 'comodo', label: 'Cómodo y en buen estado', esProblema: false },
  { value: 'mejorable', label: 'Mejorable', esProblema: true },
  { value: 'faltante-danado', label: 'Faltó o estaba dañado', esProblema: true },
]

export const biciLabel = (v: BiciEstado) => BICI_OPCIONES.find((o) => o.value === v)?.label ?? v
export const cascoLabel = (v: CascoEstado) => CASCO_OPCIONES.find((o) => o.value === v)?.label ?? v

export interface CommentPrompt {
  titulo: string
  ayuda: string
  chips: string[]
  placeholder: string
  pedirContacto: boolean
}

const CHIPS_PROBLEMAS = ['Frenos', 'Cambios', 'Casco', 'Ritmo del grupo', 'Guía', 'Puntualidad']
const CHIPS_MEJORAS = ['Ritmo del grupo', 'Más paradas', 'Mejor bici', 'Más explicaciones', 'Puntualidad', 'Casco']
const CHIPS_POSITIVOS = ['El guía', 'El paisaje', 'La bici', 'El ritmo', 'Las paradas', 'La historia']

/** Pregunta de comentario según la calificación general */
export function commentPrompt(stars: Stars): CommentPrompt {
  switch (sentimiento(stars)) {
    case 'negativo':
      return {
        titulo: '¿Qué salió mal? Lo resolvemos hoy',
        ayuda: 'Marcá lo que corresponda y, si querés, contanos un poco más.',
        chips: CHIPS_PROBLEMAS,
        placeholder: 'Por ejemplo: los frenos chillaban desde la segunda cuadra',
        pedirContacto: true,
      }
    case 'neutro':
      return {
        titulo: '¿Qué mejorarías?',
        ayuda: 'Tu opinión nos ayuda a ajustar el recorrido.',
        chips: CHIPS_MEJORAS,
        placeholder: 'Por ejemplo: una parada más larga en el Rosedal',
        pedirContacto: false,
      }
    default:
      return {
        titulo: '¿Qué fue lo mejor?',
        ayuda: 'Contanos qué te gustó para seguir haciéndolo.',
        chips: CHIPS_POSITIVOS,
        placeholder: 'Por ejemplo: el guía explicó muy bien la historia de Caminito',
        pedirContacto: false,
      }
  }
}

export type StepId =
  | 'recorrido'
  | 'general'
  | 'bici'
  | 'casco'
  | 'guia'
  | 'comentario'
  | 'consentimiento'

export interface SurveyParams {
  recorrido: RecorridoId | null
  guia: string
}

/** Lee ?recorrido=palermo&guia=mariana (los lleva el QR de cada salida) */
export function parseSurveyParams(search: string): SurveyParams {
  const params = new URLSearchParams(search)
  const recorridoRaw = (params.get('recorrido') ?? '').trim().toLowerCase()
  const guiaRaw = (params.get('guia') ?? '').trim().toLowerCase()
  return {
    recorrido: isRecorridoId(recorridoRaw) ? recorridoRaw : null,
    guia: isGuiaId(guiaRaw) ? guiaRaw : '',
  }
}

/** Pantallas a mostrar: se salta "recorrido" si ya vino por URL */
export function buildSteps(params: SurveyParams): StepId[] {
  const steps: StepId[] = ['general', 'bici', 'casco', 'guia', 'comentario', 'consentimiento']
  return params.recorrido ? steps : ['recorrido', ...steps]
}

export function emptyDraft(params: SurveyParams): SurveyDraft {
  return {
    recorrido: params.recorrido,
    guia: params.guia,
    estrellasGeneral: null,
    bici: null,
    casco: null,
    estrellasGuia: null,
    chips: [],
    comentario: '',
    contactoNombre: '',
    contactoWhatsapp: '',
    consentimiento: false,
  }
}

/** Un paso está completo cuando tiene la respuesta obligatoria */
export function isStepComplete(step: StepId, draft: SurveyDraft): boolean {
  switch (step) {
    case 'recorrido':
      return draft.recorrido !== null
    case 'general':
      return draft.estrellasGeneral !== null
    case 'bici':
      return draft.bici !== null
    case 'casco':
      return draft.casco !== null
    case 'guia':
      return draft.estrellasGuia !== null
    case 'comentario':
      return true
    case 'consentimiento':
      return draft.consentimiento === true
  }
}

export interface SubmitCheck {
  ok: boolean
  motivo: string | null
}

/** Sin consentimiento no hay envío. También exige las respuestas obligatorias. */
export function canSubmit(draft: SurveyDraft): SubmitCheck {
  if (!draft.consentimiento) {
    return { ok: false, motivo: 'Tenés que aceptar la política de privacidad para enviar tu respuesta.' }
  }
  const obligatorios: StepId[] = ['recorrido', 'general', 'bici', 'casco', 'guia']
  const faltante = obligatorios.find((s) => !isStepComplete(s, draft))
  if (faltante) {
    return { ok: false, motivo: 'Falta completar alguna respuesta obligatoria.' }
  }
  return { ok: true, motivo: null }
}

/** Normaliza un WhatsApp escrito a mano: deja solo dígitos y el + inicial */
export function normalizeWhatsapp(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const plus = trimmed.startsWith('+') ? '+' : ''
  return plus + trimmed.replace(/\D/g, '')
}

export function isValidWhatsapp(value: string): boolean {
  if (!value) return true
  const digits = normalizeWhatsapp(value).replace('+', '')
  return digits.length >= 8 && digits.length <= 15
}

export function starsLabel(n: Stars): string {
  return n === 1 ? '1 estrella' : `${n} estrellas`
}

export function guiaDisplayName(guiaId: string): string | null {
  const guia = config.guias.find((g) => g.id === guiaId)
  return guia ? guia.nombre : null
}
