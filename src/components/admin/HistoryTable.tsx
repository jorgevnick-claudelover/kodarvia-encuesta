import { useEffect, useMemo, useState } from 'react'
import { config, guiaNombre, recorridoNombre } from '../../config'
import { formatBuenosAires } from '../../lib/dates'
import { sortByDate } from '../../lib/stats'
import { biciLabel, cascoLabel } from '../../lib/survey'
import type { FeedbackResponse } from '../../types'
import { StarIcon } from '../ui/BikeIcon'

interface Props {
  responses: FeedbackResponse[]
}

function Estrellas({ n, tono }: { n: number; tono?: 'alert' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 font-bold tabular-nums ${tono === 'alert' ? 'text-alert' : 'text-ink'}`} aria-label={`${n} de 5`}>
      <StarIcon className={`h-4 w-4 ${tono === 'alert' ? 'text-alert' : 'text-accent'}`} filled />
      {n}
    </span>
  )
}

export function HistoryTable({ responses }: Props) {
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const pageSize = config.pageSize

  const sorted = useMemo(() => sortByDate(responses, direction), [responses, direction])
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  const start = (page - 1) * pageSize
  const visibles = sorted.slice(start, start + pageSize)

  const toggleSort = () => setDirection((d) => (d === 'desc' ? 'asc' : 'desc'))

  return (
    <section className="card" aria-labelledby="historial-titulo">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="historial-titulo" className="text-lg font-bold text-ink">
          Historial
          <span className="ml-2 text-sm font-medium text-slate-500">{sorted.length} respuestas</span>
        </h2>
        <button type="button" onClick={toggleSort} className="btn-outline min-h-[44px] py-2 text-sm" aria-label={`Ordenar por fecha, ahora ${direction === 'desc' ? 'de más reciente a más antigua' : 'de más antigua a más reciente'}`}>
          Fecha {direction === 'desc' ? '↓ más recientes' : '↑ más antiguas'}
        </button>
      </div>

      {visibles.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          No hay respuestas con estos filtros. Probá ampliar el rango de fechas o de estrellas.
        </p>
      ) : (
        <>
          {/* Tabla en pantallas medianas en adelante */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th scope="col" className="pb-2 pr-3 font-semibold" aria-sort={direction === 'desc' ? 'descending' : 'ascending'}>
                    <button type="button" onClick={toggleSort} className="font-semibold hover:text-brand">
                      Fecha (BA) {direction === 'desc' ? '↓' : '↑'}
                    </button>
                  </th>
                  <th scope="col" className="pb-2 pr-3 font-semibold">Recorrido</th>
                  <th scope="col" className="pb-2 pr-3 font-semibold">Guía</th>
                  <th scope="col" className="pb-2 pr-3 font-semibold">General</th>
                  <th scope="col" className="pb-2 pr-3 font-semibold">Guía ★</th>
                  <th scope="col" className="pb-2 pr-3 font-semibold">Bici</th>
                  <th scope="col" className="pb-2 pr-3 font-semibold">Casco</th>
                  <th scope="col" className="pb-2 pr-3 font-semibold">Comentario</th>
                  <th scope="col" className="pb-2 font-semibold">Maps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibles.map((r) => {
                  const negativa = r.estrellasGeneral <= 2
                  return (
                    <tr key={r.id} className={negativa ? 'bg-red-50/40' : ''}>
                      <td className="whitespace-nowrap py-2.5 pr-3 tabular-nums text-slate-600">{formatBuenosAires(r.createdAt)}</td>
                      <td className="py-2.5 pr-3 font-medium">{recorridoNombre(r.recorrido)}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{guiaNombre(r.guia)}</td>
                      <td className="py-2.5 pr-3">
                        <Estrellas n={r.estrellasGeneral} tono={negativa ? 'alert' : undefined} />
                      </td>
                      <td className="py-2.5 pr-3">
                        <Estrellas n={r.estrellasGuia} />
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600">{biciLabel(r.bici)}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{cascoLabel(r.casco)}</td>
                      <td className="max-w-xs py-2.5 pr-3 text-slate-700">
                        {r.chips.length > 0 && <span className="mr-1 text-xs font-semibold text-slate-500">[{r.chips.join(', ')}]</span>}
                        {r.comentario}
                      </td>
                      <td className="py-2.5 text-xs font-semibold">
                        {r.reviewInvited ? (r.reviewClicked ? <span className="text-brand">Clic</span> : <span className="text-slate-400">Invitado</span>) : <span className="text-slate-300">–</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Tarjetas en móvil */}
          <ul className="flex flex-col gap-3 md:hidden">
            {visibles.map((r) => {
              const negativa = r.estrellasGeneral <= 2
              return (
                <li key={r.id} className={`rounded-2xl border-2 p-4 ${negativa ? 'border-alert/30 bg-red-50/40' : 'border-slate-100'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">{formatBuenosAires(r.createdAt)}</p>
                      <p className="font-bold text-ink">{recorridoNombre(r.recorrido)}</p>
                      <p className="text-xs text-slate-500">Guía {guiaNombre(r.guia)}</p>
                    </div>
                    <div className="text-right text-sm">
                      <Estrellas n={r.estrellasGeneral} tono={negativa ? 'alert' : undefined} />
                      <p className="text-xs text-slate-500">guía {r.estrellasGuia}/5</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    Bici: {biciLabel(r.bici)} · Casco: {cascoLabel(r.casco)}
                  </p>
                  {(r.comentario || r.chips.length > 0) && (
                    <p className="mt-2 text-sm text-slate-700">
                      {r.chips.length > 0 && <span className="mr-1 text-xs font-semibold text-slate-500">[{r.chips.join(', ')}]</span>}
                      {r.comentario}
                    </p>
                  )}
                  {r.reviewInvited && (
                    <p className={`mt-2 text-xs font-semibold ${r.reviewClicked ? 'text-brand' : 'text-slate-400'}`}>
                      {r.reviewClicked ? 'Hizo clic en Google Maps' : 'Invitado a Google Maps, sin clic'}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>

          <nav className="mt-4 flex items-center justify-between gap-3" aria-label="Paginación del historial">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline min-h-[44px] py-2 text-sm">
              Anterior
            </button>
            <p className="text-sm text-slate-600">
              Página {page} de {totalPages}
            </p>
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-outline min-h-[44px] py-2 text-sm">
              Siguiente
            </button>
          </nav>
        </>
      )}
    </section>
  )
}
