import { useState } from 'react'
import { guiaNombre, recorridoNombre } from '../../config'
import { formatBuenosAires } from '../../lib/dates'
import { openAlerts, resolvedAlerts } from '../../lib/stats'
import { resolveAlert } from '../../lib/store'
import { starsLabel } from '../../lib/survey'
import type { Alert, FeedbackResponse } from '../../types'
import { BellIcon, CheckIcon } from '../ui/BikeIcon'

interface Props {
  alerts: Alert[]
  responses: FeedbackResponse[]
  onOpenOutbox: () => void
}

export function AlertsSection({ alerts, responses, onOpenOutbox }: Props) {
  const abiertas = openAlerts(alerts)
  const resueltas = resolvedAlerts(alerts)
  const [verResueltas, setVerResueltas] = useState(false)
  const byId = new Map(responses.map((r) => [r.id, r]))

  return (
    <section className="card" aria-labelledby="alertas-titulo">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="alertas-titulo" className="flex items-center gap-2 text-lg font-bold text-ink">
          <BellIcon className={`h-5 w-5 ${abiertas.length ? 'text-alert' : 'text-slate-400'}`} />
          Alertas
          {abiertas.length > 0 && (
            <span className="rounded-full bg-alert px-2.5 py-0.5 text-xs font-bold text-white">{abiertas.length} abiertas</span>
          )}
        </h2>
        <button type="button" onClick={onOpenOutbox} className="btn-outline min-h-[44px] py-2 text-sm">
          Ver bandeja de salida simulada
        </button>
      </div>

      {abiertas.length === 0 ? (
        <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-brand">
          No hay alertas abiertas. Todas las experiencias con 1 o 2 estrellas están resueltas.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {abiertas.map((a) => (
            <li key={a.id}>
              <AlertCard alert={a} response={byId.get(a.responseId)} />
            </li>
          ))}
        </ul>
      )}

      {resueltas.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setVerResueltas((v) => !v)}
            aria-expanded={verResueltas}
            className="btn-ghost -ml-2 min-h-[44px] px-3 py-2 text-sm"
          >
            <svg viewBox="0 0 24 24" className={`h-4 w-4 transition ${verResueltas ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
            {resueltas.length} {resueltas.length === 1 ? 'alerta resuelta' : 'alertas resueltas'}
          </button>
          {verResueltas && (
            <ul className="mt-2 flex flex-col gap-3">
              {resueltas.map((a) => (
                <li key={a.id}>
                  <AlertCard alert={a} response={byId.get(a.responseId)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

function AlertCard({ alert, response }: { alert: Alert; response: FeedbackResponse | undefined }) {
  const [nota, setNota] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [abrirForm, setAbrirForm] = useState(false)
  const abierta = alert.estado === 'abierta'

  const resolver = () => {
    if (!nota.trim()) {
      setError('Escribí una nota de resolución antes de marcarla.')
      return
    }
    resolveAlert(alert.id, nota)
    setNota('')
    setError(null)
  }

  if (!response) {
    return <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">La respuesta de esta alerta ya no existe.</p>
  }

  const contacto = [response.contactoNombre, response.contactoWhatsapp].filter(Boolean).join(' · ')

  return (
    <article className={`rounded-3xl border-2 p-4 ${abierta ? 'border-alert/30 bg-red-50/40' : 'border-slate-100 bg-slate-50/60'}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-500">{formatBuenosAires(alert.createdAt)} · Buenos Aires</p>
          <p className="mt-0.5 text-base font-bold text-ink">
            <span className={abierta ? 'text-alert' : 'text-slate-600'}>{starsLabel(response.estrellasGeneral)}</span> en{' '}
            {recorridoNombre(response.recorrido)}
            {response.guia ? <span className="font-medium text-slate-500"> · Guía {guiaNombre(response.guia)}</span> : null}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${abierta ? 'bg-alert text-white' : 'bg-green-100 text-brand'}`}>
          {abierta ? 'Abierta' : 'Resuelta'}
        </span>
      </div>

      {response.chips.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Motivos">
          {response.chips.map((c) => (
            <li key={c} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              {c}
            </li>
          ))}
        </ul>
      )}
      {response.comentario && <p className="mt-3 text-sm text-ink">“{response.comentario}”</p>}
      <p className="mt-2 text-sm text-slate-600">
        <span className="font-semibold">Contacto:</span> {contacto || 'no dejó contacto'}
      </p>

      {abierta ? (
        <div className="mt-4">
          {!abrirForm ? (
            <button type="button" onClick={() => setAbrirForm(true)} className="btn-brand min-h-[44px] py-2 text-sm">
              <CheckIcon className="h-4 w-4" />
              Marcar resuelta
            </button>
          ) : (
            <div>
              <label htmlFor={`nota-${alert.id}`} className="label">
                Nota de resolución <span className="text-alert">(obligatoria)</span>
              </label>
              <textarea
                id={`nota-${alert.id}`}
                className={`input min-h-[88px] resize-none ${error ? 'border-alert' : ''}`}
                placeholder="Qué se hizo y cómo quedó el cliente"
                value={nota}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `nota-error-${alert.id}` : undefined}
                onChange={(e) => {
                  setNota(e.target.value)
                  if (e.target.value.trim()) setError(null)
                }}
              />
              {error && (
                <p id={`nota-error-${alert.id}`} role="alert" className="mt-1.5 text-sm font-semibold text-alert">
                  {error}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={resolver} className="btn-brand min-h-[44px] py-2 text-sm">
                  <CheckIcon className="h-4 w-4" />
                  Confirmar resolución
                </button>
                <button type="button" onClick={() => setAbrirForm(false)} className="btn-ghost min-h-[44px] py-2 text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200">
          <p className="font-semibold text-brand">Resuelta {alert.resueltaAt ? `el ${formatBuenosAires(alert.resueltaAt)}` : ''}</p>
          <p className="mt-1 text-slate-700">{alert.notaResolucion}</p>
        </div>
      )}
    </article>
  )
}
