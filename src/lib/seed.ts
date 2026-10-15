import { dayKey, fromBuenosAires, shiftDayKey } from './dates'
import { OUTBOX_KEY, sendManagerAlert } from './notifications'
import { hasKey, writeJSON } from './storage'
import { canInviteReview, shouldCreateAlert } from './survey'
import type { Alert, BiciEstado, CascoEstado, FeedbackResponse, RecorridoId, Stars } from '../types'

/**
 * Datos de ejemplo. Se siembran solo si no existe la clave versionada "bicifeedback:v1:seeded".
 * Las fechas se calculan relativas a hoy, en hora de Buenos Aires.
 */

export const SEED_FLAG_KEY = 'seeded'
export const SEED_VERSION = 1

interface SeedEntry {
  d: number // días atrás
  h: number // hora en Buenos Aires (9-19)
  m: number // minutos
  rec: RecorridoId
  guia: string
  stars: Stars
  bici: BiciEstado
  casco: CascoEstado
  starsGuia: Stars
  chips: string[]
  comentario: string
  contacto?: [string, string]
  clicked?: boolean
  resuelta?: { nota: string; horas: number }
}

// Distribución: 5★ 29 (58 %), 4★ 10 (20 %), 3★ 5 (10 %), 2★ 4 (8 %), 1★ 2 (4 %) = 50
const ENTRIES: SeedEntry[] = [
  // ───── 5 estrellas ─────
  { d: 44, h: 11, m: 40, rec: 'san-telmo', guia: 'mariana', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El paisaje', 'La bici'], comentario: 'Los adoquines de Defensa son un desafío pero la bici los aguantó perfecto. La feria de los domingos, un golazo.', clicked: true },
  { d: 37, h: 12, m: 10, rec: 'san-telmo', guia: 'mariana', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El guía', 'La historia'], comentario: 'Pasamos por la feria de los domingos justo cuando abrían los puestos. Mariana explicó la historia de Plaza Dorrego con mucha claridad.', clicked: true },
  { d: 30, h: 17, m: 5, rec: 'san-telmo', guia: 'tomas', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El ritmo', 'El paisaje'], comentario: 'Me encantó cruzar San Telmo por las calles de adoquines a paso tranquilo. El ritmo del grupo fue ideal para sacar fotos.' },
  { d: 23, h: 11, m: 55, rec: 'san-telmo', guia: 'tomas', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['Las paradas', 'El guía'], comentario: 'Parada en el Mercado de San Telmo con tiempo para un café. Tomás contó anécdotas que no están en ninguna guía.', clicked: true },
  { d: 16, h: 16, m: 20, rec: 'san-telmo', guia: 'julieta', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 4, chips: ['La bici', 'El paisaje'], comentario: 'La bici estaba impecable y el casco bien ajustado. El tramo de adoquines hasta Parque Lezama fue lo mejor.' },
  { d: 9, h: 12, m: 30, rec: 'san-telmo', guia: 'julieta', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El guía', 'La historia'], comentario: 'Julieta explicó muy bien la historia de los conventillos. Volvemos con amigos el próximo domingo por la feria.', clicked: true },
  { d: 2, h: 12, m: 45, rec: 'san-telmo', guia: 'nicolas', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['La bici', 'Las paradas'], comentario: 'Salida puntual, cambios suaves y una vuelta por la feria de los domingos que no esperaba. Diez puntos.' },
  { d: 42, h: 11, m: 15, rec: 'la-boca', guia: 'nicolas', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El paisaje', 'La historia'], comentario: 'Caminito con los colores de las casas a media mañana es otra cosa. El guía supo contar por qué se pintaban así.', clicked: true },
  { d: 35, h: 15, m: 50, rec: 'la-boca', guia: 'nicolas', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El guía', 'La historia'], comentario: 'Nicolás explicó muy bien la historia de los inmigrantes genoveses y los colores de las chapas. Muy recomendable.', clicked: true },
  { d: 28, h: 11, m: 30, rec: 'la-boca', guia: 'mariana', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['Las paradas', 'El ritmo'], comentario: 'La parada en la Vuelta de Rocha para ver el puente transbordador fue perfecta. Grupo chico y ritmo relajado.' },
  { d: 21, h: 10, m: 50, rec: 'la-boca', guia: 'tomas', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 4, chips: ['El paisaje'], comentario: 'Pensé que La Boca en bici iba a ser complicado y resultó muy seguro. Caminito a esa hora estaba casi vacío.', clicked: true },
  { d: 14, h: 16, m: 40, rec: 'la-boca', guia: 'tomas', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El guía', 'El paisaje'], comentario: 'Los colores de Caminito, la Bombonera de lejos y un guía que respondió todas las preguntas. Un plan redondo.' },
  { d: 7, h: 11, m: 20, rec: 'la-boca', guia: 'mariana', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El guía', 'La bici'], comentario: 'Frenos firmes, casco cómodo y una explicación muy clara sobre Quinquela Martín. Mariana es una genia.', clicked: true },
  { d: 1, h: 17, m: 15, rec: 'la-boca', guia: 'julieta', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El guía', 'El paisaje'], comentario: 'Salimos con un grupo de seis y nos sentimos cuidados todo el tiempo. Caminito es más lindo de lo que muestran las fotos.' },
  { d: 43, h: 10, m: 45, rec: 'costanera-sur', guia: 'tomas', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El paisaje', 'El ritmo'], comentario: 'Entrar a la Reserva Ecológica en bici y ver el río abriéndose de golpe fue increíble. Tomás marcó un ritmo perfecto.', clicked: true },
  { d: 38, h: 16, m: 10, rec: 'costanera-sur', guia: 'nicolas', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El guía', 'Las paradas'], comentario: 'Vimos garzas y coipos en la Reserva Ecológica. El guía conocía cada sendero y frenamos donde valía la pena.' },
  { d: 31, h: 18, m: 25, rec: 'costanera-sur', guia: 'julieta', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El paisaje', 'La bici'], comentario: 'El tramo junto al río con la brisa de la tarde fue lo mejor del viaje a Buenos Aires. Bici liviana y bien regulada.', clicked: true },
  { d: 25, h: 11, m: 5, rec: 'costanera-sur', guia: 'julieta', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El guía', 'La historia'], comentario: 'Julieta explicó cómo se formó la Reserva sobre los escombros de la autopista. Me voló la cabeza ese dato.' },
  { d: 18, h: 17, m: 35, rec: 'costanera-sur', guia: 'mariana', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El ritmo', 'Las paradas'], comentario: 'Ritmo tranquilo, paradas para fotos frente al río y un casco que ni sentí. Lo recomiendo a cualquiera.', clicked: true },
  { d: 11, h: 11, m: 0, rec: 'costanera-sur', guia: 'tomas', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 4, chips: ['El paisaje'], comentario: 'Salida de las 9 con la Reserva casi vacía. La vista del río desde el terraplén justificó madrugar.' },
  { d: 4, h: 16, m: 55, rec: 'costanera-sur', guia: 'nicolas', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El guía', 'El ritmo'], comentario: 'Nicolás estuvo atento a los que íbamos más lentos sin apurar a nadie. La Reserva Ecológica es un oasis.', clicked: true },
  { d: 41, h: 12, m: 20, rec: 'palermo', guia: 'mariana', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El paisaje', 'La historia'], comentario: 'El Rosedal en flor y los bosques con sombra todo el tramo. Mariana explicó muy bien la historia de los lagos.', clicked: true },
  { d: 34, h: 11, m: 10, rec: 'palermo', guia: 'nicolas', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El paisaje', 'El ritmo'], comentario: 'Pedalear por los bosques de Palermo un sábado a la mañana fue la mejor forma de arrancar el fin de semana.' },
  { d: 27, h: 17, m: 45, rec: 'palermo', guia: 'julieta', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['Las paradas', 'La bici'], comentario: 'La parada en el Rosedal con tiempo para caminar entre las rosas estuvo buenísima. Cambios suaves toda la vuelta.', clicked: true },
  { d: 20, h: 12, m: 0, rec: 'palermo', guia: 'tomas', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El guía', 'La historia'], comentario: 'Tomás contó la historia del Planetario y de los bosques con un humor que nos tuvo a todos atentos.', clicked: true },
  { d: 13, h: 16, m: 30, rec: 'palermo', guia: 'nicolas', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['La bici', 'El ritmo'], comentario: 'Las bicis estaban impecables y el circuito por los bosques fue muy seguro para mi hijo de doce años.' },
  { d: 6, h: 11, m: 50, rec: 'palermo', guia: 'mariana', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El paisaje', 'El ritmo'], comentario: 'Rosedal, lagos y la vuelta por la Rural. El grupo fue parejo y nadie quedó atrás. Volvería mañana.', clicked: true },
  { d: 3, h: 17, m: 0, rec: 'palermo', guia: 'julieta', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El guía'], comentario: 'Julieta ajustó mi casco antes de salir y estuvo pendiente todo el recorrido. Los bosques son hermosos.' },
  { d: 0, h: 16, m: 30, rec: 'palermo', guia: 'tomas', stars: 5, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El paisaje', 'El ritmo'], comentario: 'Recorrido perfecto para quienes no andan mucho en bici: plano, con sombra y con el Rosedal como premio final.', clicked: true },

  // ───── 4 estrellas ─────
  { d: 40, h: 12, m: 35, rec: 'san-telmo', guia: 'nicolas', stars: 4, bici: 'detalle-menor', casco: 'comodo', starsGuia: 5, chips: ['El paisaje'], comentario: 'Muy lindo, aunque en los adoquines sentí que el asiento vibraba bastante. La feria de los domingos vale la pena.', clicked: true },
  { d: 33, h: 17, m: 20, rec: 'san-telmo', guia: 'mariana', stars: 4, bici: 'impecable', casco: 'comodo', starsGuia: 5, chips: ['El guía', 'Las paradas'], comentario: 'Buen recorrido y guía clara. Le pondría una parada más larga en el Mercado de San Telmo para comer algo.' },
  { d: 26, h: 11, m: 25, rec: 'la-boca', guia: 'tomas', stars: 4, bici: 'impecable', casco: 'comodo', starsGuia: 4, chips: ['El paisaje'], comentario: 'Caminito espectacular, pero el ritmo del grupo fue un poco rápido para sacar fotos tranquilo.', clicked: true },
  { d: 19, h: 16, m: 15, rec: 'la-boca', guia: 'julieta', stars: 4, bici: 'impecable', casco: 'mejorable', starsGuia: 5, chips: ['La historia', 'El guía'], comentario: 'La explicación sobre los colores de las casas fue muy buena. Solo el casco me quedaba un toque flojo.' },
  { d: 12, h: 12, m: 5, rec: 'costanera-sur', guia: 'nicolas', stars: 4, bici: 'detalle-menor', casco: 'comodo', starsGuia: 5, chips: ['El paisaje'], comentario: 'La Reserva Ecológica es un lujo. Los cambios saltaban un poco en el tramo de ripio, pero nada grave.', clicked: true },
  { d: 8, h: 13, m: 40, rec: 'costanera-sur', guia: 'mariana', stars: 4, bici: 'impecable', casco: 'comodo', starsGuia: 4, chips: ['El paisaje', 'El ritmo'], comentario: 'Hermosa vista del río. Hubiera estado bueno salir un rato antes para evitar el calor del mediodía.' },
  { d: 36, h: 11, m: 45, rec: 'palermo', guia: 'julieta', stars: 4, bici: 'impecable', casco: 'mejorable', starsGuia: 5, chips: ['El paisaje'], comentario: 'Los bosques y el Rosedal preciosos. Al casco le faltaba un poco de acolchado, por eso no son cinco.' },
  { d: 22, h: 17, m: 50, rec: 'palermo', guia: 'nicolas', stars: 4, bici: 'detalle-menor', casco: 'comodo', starsGuia: 5, chips: ['El guía', 'El ritmo'], comentario: 'Muy buen guía y ritmo cómodo. La bici hacía un ruido leve en los cambios pero no molestó.', clicked: true },
  { d: 0, h: 9, m: 30, rec: 'san-telmo', guia: 'tomas', stars: 4, bici: 'impecable', casco: 'comodo', starsGuia: 4, chips: ['El paisaje', 'La historia'], comentario: 'Salimos diez minutos tarde, pero después todo fluyó. Los adoquines y Plaza Dorrego, hermosos.' },
  { d: 15, h: 18, m: 10, rec: 'costanera-sur', guia: 'tomas', stars: 4, bici: 'impecable', casco: 'comodo', starsGuia: 4, chips: ['El paisaje'], comentario: 'Buen plan para una tarde. Me hubiera gustado que la parada frente al río fuera un poco más larga.' },

  // ───── 3 estrellas ─────
  { d: 39, h: 12, m: 15, rec: 'la-boca', guia: 'nicolas', stars: 3, bici: 'impecable', casco: 'comodo', starsGuia: 3, chips: ['Más explicaciones'], comentario: 'Caminito está bien, pero el grupo era grande y se hacía difícil escuchar al guía en las paradas.' },
  { d: 29, h: 17, m: 30, rec: 'palermo', guia: 'mariana', stars: 3, bici: 'detalle-menor', casco: 'comodo', starsGuia: 4, chips: ['Mejor bici'], comentario: 'El Rosedal lindo, aunque la bici tenía los cambios duros y me costó en las subiditas de los bosques.' },
  { d: 17, h: 11, m: 35, rec: 'san-telmo', guia: 'julieta', stars: 3, bici: 'impecable', casco: 'mejorable', starsGuia: 3, chips: ['Más explicaciones', 'Casco'], comentario: 'Esperaba más explicación histórica en San Telmo. El casco cumplía, nada más.' },
  { d: 10, h: 16, m: 45, rec: 'costanera-sur', guia: 'tomas', stars: 3, bici: 'impecable', casco: 'comodo', starsGuia: 3, chips: ['Ritmo del grupo', 'Más paradas'], comentario: 'La Reserva es linda pero fuimos muy rápido y casi no paramos frente al río.' },
  { d: 5, h: 12, m: 50, rec: 'la-boca', guia: 'mariana', stars: 3, bici: 'detalle-menor', casco: 'comodo', starsGuia: 4, chips: ['Puntualidad', 'Mejor bici'], comentario: 'La vuelta por Caminito fue corta y la mitad del tiempo se fue en ajustar bicis antes de salir.' },

  // ───── 2 estrellas (alertas) ─────
  { d: 32, h: 12, m: 40, rec: 'san-telmo', guia: 'tomas', stars: 2, bici: 'problemas', casco: 'comodo', starsGuia: 4, chips: ['Frenos'], comentario: 'Los frenos chillaban en cada bajada de adoquines y me dio inseguridad todo el recorrido.', contacto: ['Lucía Pereyra', '+54 9 11 6234 7781'], resuelta: { nota: 'Hablé con Lucía por WhatsApp, pedimos disculpas y le regalamos una salida por Costanera. Las pastillas de freno de la bici 14 se cambiaron.', horas: 3 } },
  { d: 24, h: 17, m: 10, rec: 'palermo', guia: 'nicolas', stars: 2, bici: 'problemas', casco: 'comodo', starsGuia: 3, chips: ['Cambios'], comentario: 'Los cambios saltaban cada vez que cambiaba de plato en los bosques. Casi me caigo cerca del Rosedal.', resuelta: { nota: 'Bici 07 retirada del circuito; el mecánico ajustó el desviador trasero. Avisamos al cliente y aceptó repetir el recorrido sin cargo.', horas: 2 } },
  { d: 0, h: 11, m: 0, rec: 'costanera-sur', guia: 'julieta', stars: 2, bici: 'detalle-menor', casco: 'faltante-danado', starsGuia: 3, chips: ['Casco', 'Guía'], comentario: 'El casco me quedó flojo todo el tiempo y el guía no tenía otro talle. En el ripio de la Reserva lo pasé mal.', contacto: ['Diego Santillán', '+54 9 11 5890 2214'] },
  { d: 45, h: 13, m: 5, rec: 'la-boca', guia: 'mariana', stars: 2, bici: 'impecable', casco: 'comodo', starsGuia: 2, chips: ['Puntualidad', 'Ritmo del grupo'], comentario: 'Salimos veinte minutos tarde y el ritmo después fue acelerado para recuperar tiempo. No pude disfrutar Caminito.', resuelta: { nota: 'Revisamos la salida de las 10: la demora fue por un pinchazo previo. Llamamos al cliente, le devolvimos el 50 % y ajustamos el protocolo de arranque.', horas: 5 } },

  // ───── 1 estrella (alertas) ─────
  { d: 3, h: 12, m: 25, rec: 'la-boca', guia: 'nicolas', stars: 1, bici: 'problemas', casco: 'comodo', starsGuia: 2, chips: ['Frenos', 'Guía'], comentario: 'La bici no tenía freno trasero y nadie lo revisó antes de salir. Terminé caminando desde Caminito.', contacto: ['Romina Vázquez', '+54 9 11 4421 9930'] },
  { d: 21, h: 18, m: 40, rec: 'palermo', guia: 'tomas', stars: 1, bici: 'impecable', casco: 'mejorable', starsGuia: 1, chips: ['Guía', 'Puntualidad'], comentario: 'El guía llegó tarde, no explicó nada en los bosques y nos dejó solos en el Rosedal mientras atendía el teléfono.', contacto: ['Martín Ocampo', '+54 9 11 3377 6150'], resuelta: { nota: 'Conversación con el guía y advertencia formal. Llamé a Martín, le devolvimos el importe completo y se le ofreció un circuito con otra guía.', horas: 4 } },
]

export interface SeedData {
  responses: FeedbackResponse[]
  alerts: Alert[]
}

/** Genera las respuestas y alertas de ejemplo relativas a `now` (función pura) */
export function buildSeed(now: Date = new Date()): SeedData {
  const hoy = dayKey(now)
  const responses: FeedbackResponse[] = []
  const alerts: Alert[] = []

  ENTRIES.forEach((e, i) => {
    const fecha = fromBuenosAires(shiftDayKey(hoy, -e.d), e.h, e.m)
    const createdAt = fecha.toISOString()
    const n = String(i + 1).padStart(3, '0')
    const responseId = `resp_seed_${n}`
    let alertId: string | null = null

    if (shouldCreateAlert(e.stars)) {
      alertId = `alert_seed_${n}`
      const resueltaAt = e.resuelta ? new Date(fecha.getTime() + e.resuelta.horas * 3600000).toISOString() : null
      alerts.push({
        id: alertId,
        responseId,
        createdAt,
        estado: e.resuelta ? 'resuelta' : 'abierta',
        notaResolucion: e.resuelta ? e.resuelta.nota : null,
        resueltaAt,
      })
    }

    responses.push({
      id: responseId,
      createdAt,
      recorrido: e.rec,
      guia: e.guia,
      estrellasGeneral: e.stars,
      bici: e.bici,
      casco: e.casco,
      estrellasGuia: e.starsGuia,
      chips: e.chips,
      comentario: e.comentario,
      contactoNombre: e.contacto?.[0] ?? '',
      contactoWhatsapp: e.contacto?.[1] ?? '',
      consentimiento: { aceptado: true, timestamp: createdAt },
      reviewInvited: canInviteReview(e.stars),
      reviewClicked: canInviteReview(e.stars) && Boolean(e.clicked),
      alertId,
    })
  })

  responses.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  alerts.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  return { responses, alerts }
}

/** Escribe la semilla en el almacenamiento (incluida la bandeja de salida de cada alerta) */
export function reseed(now: Date = new Date()): SeedData {
  const data = buildSeed(now)
  writeJSON('responses', data.responses)
  writeJSON('alerts', data.alerts)
  writeJSON(OUTBOX_KEY, [])
  for (const alert of data.alerts) {
    const response = data.responses.find((r) => r.id === alert.responseId)
    if (response) sendManagerAlert(alert, response, new Date(alert.createdAt))
  }
  writeJSON(SEED_FLAG_KEY, { version: SEED_VERSION, seededAt: now.toISOString() })
  return data
}

/** Siembra solo si la clave versionada no existe todavía */
export function ensureSeed(now: Date = new Date()): boolean {
  if (hasKey(SEED_FLAG_KEY)) return false
  reseed(now)
  return true
}
