export type RecorridoId = 'san-telmo' | 'la-boca' | 'costanera-sur' | 'palermo'

export type Stars = 1 | 2 | 3 | 4 | 5

export type BiciEstado = 'impecable' | 'detalle-menor' | 'problemas'

export type CascoEstado = 'comodo' | 'mejorable' | 'faltante-danado'

export interface Consentimiento {
  aceptado: boolean
  timestamp: string | null
}

export interface FeedbackResponse {
  id: string
  /** ISO 8601 en UTC */
  createdAt: string
  recorrido: RecorridoId
  /** id del guía (ver config.guias) o cadena vacía si no vino por URL */
  guia: string
  estrellasGeneral: Stars
  bici: BiciEstado
  casco: CascoEstado
  estrellasGuia: Stars
  chips: string[]
  comentario: string
  contactoNombre: string
  contactoWhatsapp: string
  consentimiento: Consentimiento
  reviewInvited: boolean
  reviewClicked: boolean
  alertId: string | null
}

export type AlertEstado = 'abierta' | 'resuelta'

export interface Alert {
  id: string
  responseId: string
  createdAt: string
  estado: AlertEstado
  notaResolucion: string | null
  resueltaAt: string | null
}

export type Canal = 'whatsapp' | 'email'

export interface OutboxMessage {
  id: string
  alertId: string
  responseId: string
  canal: Canal
  destinatario: string
  asunto: string | null
  texto: string
  createdAt: string
}

export type DatePreset = 'hoy' | '7d' | '30d' | 'todo' | 'personalizado'

export interface DateFilter {
  preset: DatePreset
  /** AAAA-MM-DD en hora de Buenos Aires, solo con preset "personalizado" */
  desde: string
  hasta: string
}

export interface Filters {
  fecha: DateFilter
  minEstrellas: Stars
  maxEstrellas: Stars
  recorrido: RecorridoId | 'todos'
}

/** Borrador de la encuesta mientras el ciclista la completa */
export interface SurveyDraft {
  recorrido: RecorridoId | null
  guia: string
  estrellasGeneral: Stars | null
  bici: BiciEstado | null
  casco: CascoEstado | null
  estrellasGuia: Stars | null
  chips: string[]
  comentario: string
  contactoNombre: string
  contactoWhatsapp: string
  consentimiento: boolean
}
