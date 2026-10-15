import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { recorridoNombre } from '../config'
import { AlertsSection } from '../components/admin/AlertsSection'
import { Charts } from '../components/admin/Charts'
import { FiltersBar } from '../components/admin/FiltersBar'
import { HistoryTable } from '../components/admin/HistoryTable'
import { KpiCards } from '../components/admin/KpiCards'
import { OutboxPanel } from '../components/admin/OutboxPanel'
import { Logo } from '../components/ui/Logo'
import { Modal } from '../components/ui/Modal'
import { ToastStack, type ToastMessage } from '../components/ui/Toast'
import { useFeedbackStore } from '../hooks/useFeedbackStore'
import { downloadCsv } from '../lib/csv'
import { DEFAULT_FILTERS, applyFilters, openAlerts } from '../lib/stats'
import { isUsingMemoryFallback } from '../lib/storage'
import { resetToSeed } from '../lib/store'
import { starsLabel } from '../lib/survey'
import type { Filters } from '../types'

export function AdminPage() {
  const { responses, alerts, outbox, version } = useFeedbackStore()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [outboxOpen, setOutboxOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // "now" se recalcula con cada cambio de datos para que "Hoy" siga siendo hoy en sesiones largas
  const now = useMemo(() => new Date(), [version])
  const filtradas = useMemo(() => applyFilters(responses, filters, now), [responses, filters, now])
  const abiertas = useMemo(() => openAlerts(alerts), [alerts])

  // Alertas abiertas que ya vimos: si aparece una nueva, toast carmesí
  const vistas = useRef<Set<string> | null>(null)
  useEffect(() => {
    const actuales = new Set(abiertas.map((a) => a.id))
    if (vistas.current === null) {
      vistas.current = actuales
      return
    }
    const nuevas = abiertas.filter((a) => !vistas.current?.has(a.id))
    if (nuevas.length > 0) {
      const byId = new Map(responses.map((r) => [r.id, r]))
      setToasts((prev) => [
        ...prev,
        ...nuevas.map((a) => {
          const r = byId.get(a.responseId)
          return {
            id: a.id,
            titulo: 'Nueva alerta para resolver hoy',
            detalle: r ? `${starsLabel(r.estrellasGeneral)} en ${recorridoNombre(r.recorrido)}` : 'Respuesta con baja puntuación',
            tono: 'alert' as const,
          }
        }),
      ])
    }
    vistas.current = actuales
  }, [abiertas, responses])

  const dismissToast = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  const confirmarReset = () => {
    resetToSeed()
    setFilters(DEFAULT_FILTERS)
    setResetOpen(false)
  }

  return (
    <div className="min-h-dvh bg-bg">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <p className="bg-ink px-4 py-1.5 text-center text-xs font-medium text-white">
        Acceso sin autenticación en esta demo. Kodarvia integra el login.
      </p>
      {isUsingMemoryFallback() && (
        <p className="bg-amber-100 px-4 py-1.5 text-center text-xs font-semibold text-amber-900">
          Este navegador no permite guardar datos: los cambios duran hasta cerrar la pestaña.
        </p>
      )}

      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Logo />
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/" className="btn-ghost min-h-[44px] py-2 text-sm">
            Ir a la encuesta
          </Link>
          <button type="button" onClick={() => downloadCsv(filtradas, now)} disabled={filtradas.length === 0} className="btn-brand min-h-[44px] py-2 text-sm">
            Exportar CSV
            <span className="rounded-full bg-white/20 px-2 text-xs">{filtradas.length}</span>
          </button>
          <button type="button" onClick={() => setResetOpen(true)} className="btn-outline min-h-[44px] py-2 text-sm">
            Reiniciar datos de ejemplo
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-12">
        <h1 className="sr-only">Panel de feedback</h1>
        <FiltersBar filters={filters} onChange={setFilters} onClear={() => setFilters(DEFAULT_FILTERS)} />
        <KpiCards responses={filtradas} alertasAbiertas={abiertas} />
        <Charts responses={filtradas} />
        <AlertsSection alerts={alerts} responses={responses} onOpenOutbox={() => setOutboxOpen(true)} />
        <HistoryTable responses={filtradas} />
      </main>

      <OutboxPanel open={outboxOpen} onClose={() => setOutboxOpen(false)} outbox={outbox} />

      <Modal open={resetOpen} title="¿Reiniciar datos de ejemplo?" onClose={() => setResetOpen(false)}>
        <p className="text-sm text-slate-700">
          Se borran todas las respuestas, alertas y mensajes guardados en este navegador y se vuelven a sembrar los 50 registros
          de ejemplo. No se puede deshacer.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <button type="button" onClick={confirmarReset} className="btn w-full bg-alert text-white hover:bg-red-700 sm:w-auto">
            Sí, reiniciar
          </button>
          <button type="button" onClick={() => setResetOpen(false)} className="btn-outline w-full sm:w-auto">
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  )
}
