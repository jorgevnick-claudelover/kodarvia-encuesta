import { config, guiaNombre, recorridoNombre } from '../config'
import { formatBuenosAires } from './dates'
import { readJSON, writeJSON } from './storage'
import { biciLabel, cascoLabel, starsLabel } from './survey'
import type { Alert, FeedbackResponse, OutboxMessage } from '../types'

export const OUTBOX_KEY = 'outbox'

export function readOutbox(): OutboxMessage[] {
  return readJSON<OutboxMessage[]>(OUTBOX_KEY, [])
}

function nuevoId(): string {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function buildWhatsappText(alert: Alert, response: FeedbackResponse): string {
  const lineas = [
    `🚲 ${config.operador} · Alerta de feedback`,
    `${starsLabel(response.estrellasGeneral)} en ${recorridoNombre(response.recorrido)}`,
    `Hora: ${formatBuenosAires(response.createdAt)}`,
    response.guia ? `Guía: ${guiaNombre(response.guia)}` : null,
    `Bici: ${biciLabel(response.bici)} · Casco: ${cascoLabel(response.casco)}`,
    response.chips.length ? `Motivos: ${response.chips.join(', ')}` : null,
    response.comentario ? `Comentario: "${response.comentario}"` : null,
    response.contactoNombre || response.contactoWhatsapp
      ? `Contacto: ${[response.contactoNombre, response.contactoWhatsapp].filter(Boolean).join(' · ')}`
      : 'Sin contacto dejado',
    `Alerta ${alert.id}. Resolver hoy desde el panel.`,
  ]
  return lineas.filter((l): l is string => Boolean(l)).join('\n')
}

export function buildEmail(alert: Alert, response: FeedbackResponse): { asunto: string; texto: string } {
  const asunto = `[Alerta] ${starsLabel(response.estrellasGeneral)} en ${recorridoNombre(response.recorrido)} · ${formatBuenosAires(response.createdAt)}`
  const texto = [
    `Hola, llegó una respuesta con ${starsLabel(response.estrellasGeneral)} y hay que resolverla hoy.`,
    '',
    `Recorrido: ${recorridoNombre(response.recorrido)}`,
    `Fecha y hora: ${formatBuenosAires(response.createdAt)} (Buenos Aires)`,
    `Guía: ${response.guia ? guiaNombre(response.guia) : 'Sin asignar'}`,
    `Bicicleta: ${biciLabel(response.bici)}`,
    `Casco y equipamiento: ${cascoLabel(response.casco)}`,
    `Guía (amabilidad y claridad): ${starsLabel(response.estrellasGuia)}`,
    `Motivos marcados: ${response.chips.length ? response.chips.join(', ') : 'ninguno'}`,
    `Comentario: ${response.comentario || 'sin comentario'}`,
    `Contacto: ${[response.contactoNombre, response.contactoWhatsapp].filter(Boolean).join(' · ') || 'no dejó contacto'}`,
    '',
    `Identificador de alerta: ${alert.id}`,
    `Identificador de respuesta: ${response.id}`,
  ].join('\n')
  return { asunto, texto }
}

/**
 * Envía la alerta al encargado.
 *
 * En esta demo NO se llama a ninguna API: los payloads que se mandarían por WhatsApp y por
 * correo se guardan en la "bandeja de salida simulada" (localStorage, clave bicifeedback:v1:outbox)
 * para que el panel pueda mostrarlos.
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ KODARVIA: punto de integración.                                              │
 * │ Reemplazá los dos push() de abajo por las llamadas reales:                   │
 * │   - WhatsApp Business API (Meta Cloud API o proveedor): POST con            │
 * │     { to: config.encargado.whatsapp, text: whatsapp.texto }                  │
 * │   - Correo (SendGrid, Resend, SES...): POST con                              │
 * │     { to: config.encargado.email, subject: email.asunto, text: email.texto } │
 * │ Conviene hacerlo desde el backend y dejar acá solo la llamada a ese endpoint.│
 * └─────────────────────────────────────────────────────────────────────────────┘
 */
export function sendManagerAlert(alert: Alert, response: FeedbackResponse, now: Date = new Date()): OutboxMessage[] {
  const createdAt = now.toISOString()
  const email = buildEmail(alert, response)

  const whatsapp: OutboxMessage = {
    id: nuevoId(),
    alertId: alert.id,
    responseId: response.id,
    canal: 'whatsapp',
    destinatario: config.encargado.whatsapp,
    asunto: null,
    texto: buildWhatsappText(alert, response),
    createdAt,
  }

  const correo: OutboxMessage = {
    id: nuevoId(),
    alertId: alert.id,
    responseId: response.id,
    canal: 'email',
    destinatario: config.encargado.email,
    asunto: email.asunto,
    texto: email.texto,
    createdAt,
  }

  const outbox = readOutbox()
  // >>> KODARVIA: acá van las llamadas reales a WhatsApp y correo (ver bloque de arriba) <<<
  outbox.push(whatsapp)
  outbox.push(correo)
  writeJSON(OUTBOX_KEY, outbox)

  return [whatsapp, correo]
}
