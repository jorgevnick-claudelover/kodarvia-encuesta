import { average, positivePercent, reviewClickStats } from '../../lib/stats'
import type { Alert, FeedbackResponse } from '../../types'

interface Props {
  responses: FeedbackResponse[]
  alertasAbiertas: Alert[]
}

export function KpiCards({ responses, alertasAbiertas }: Props) {
  const promedio = average(responses)
  const positivas = positivePercent(responses)
  const clics = reviewClickStats(responses)
  const abiertas = alertasAbiertas.length

  const items: { etiqueta: string; valor: string; detalle: string; tono?: 'alert' }[] = [
    { etiqueta: 'Respuestas', valor: String(responses.length), detalle: 'en el período filtrado' },
    { etiqueta: 'Promedio general', valor: promedio === null ? '–' : promedio.toFixed(1), detalle: 'sobre 5 estrellas' },
    { etiqueta: '4-5 estrellas', valor: positivas === null ? '–' : `${positivas}%`, detalle: 'experiencias positivas' },
    {
      etiqueta: 'Alertas abiertas',
      valor: String(abiertas),
      detalle: abiertas === 0 ? 'todo resuelto' : abiertas === 1 ? 'pendiente de resolver hoy' : 'pendientes de resolver hoy',
      tono: abiertas > 0 ? 'alert' : undefined,
    },
    {
      etiqueta: 'Clics a Google Maps',
      valor: clics.porcentaje === null ? '–' : `${clics.porcentaje}%`,
      detalle: `${clics.clics} de ${clics.invitaciones} invitaciones`,
    },
  ]

  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {items.map((k) => (
        <div
          key={k.etiqueta}
          className={`card flex flex-col justify-between gap-1 p-4 ${k.tono === 'alert' ? 'ring-2 ring-alert' : ''}`}
        >
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k.etiqueta}</dt>
          <dd>
            <span className={`block text-3xl font-extrabold tabular-nums ${k.tono === 'alert' ? 'text-alert' : 'text-ink'}`}>{k.valor}</span>
            <span className={`block text-xs ${k.tono === 'alert' ? 'font-semibold text-alert' : 'text-slate-500'}`}>{k.detalle}</span>
          </dd>
        </div>
      ))}
    </dl>
  )
}
