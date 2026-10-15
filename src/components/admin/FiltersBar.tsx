import { config } from '../../config'
import { isDefaultFilters } from '../../lib/stats'
import { STAR_VALUES } from '../../lib/survey'
import type { DatePreset, Filters, RecorridoId, Stars } from '../../types'

interface Props {
  filters: Filters
  onChange: (filters: Filters) => void
  onClear: () => void
}

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: 'todo', label: 'Todo' },
  { value: 'personalizado', label: 'Personalizado' },
]

export function FiltersBar({ filters, onChange, onClear }: Props) {
  const setFecha = (preset: DatePreset) => onChange({ ...filters, fecha: { ...filters.fecha, preset } })
  const limpio = isDefaultFilters(filters)

  return (
    <section className="card" aria-label="Filtros">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label">Fecha (hora de Buenos Aires)</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Rango de fecha">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                aria-pressed={filters.fecha.preset === p.value}
                onClick={() => setFecha(p.value)}
                className={`chip min-h-[44px] rounded-full px-4 py-2 text-sm ${filters.fecha.preset === p.value ? 'chip-selected' : ''}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {filters.fecha.preset === 'personalizado' && (
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor="desde" className="label">
                  Desde
                </label>
                <input
                  id="desde"
                  type="date"
                  className="input min-h-[44px] py-2"
                  value={filters.fecha.desde}
                  max={filters.fecha.hasta || undefined}
                  onChange={(e) => onChange({ ...filters, fecha: { ...filters.fecha, desde: e.target.value } })}
                />
              </div>
              <div>
                <label htmlFor="hasta" className="label">
                  Hasta
                </label>
                <input
                  id="hasta"
                  type="date"
                  className="input min-h-[44px] py-2"
                  value={filters.fecha.hasta}
                  min={filters.fecha.desde || undefined}
                  onChange={(e) => onChange({ ...filters, fecha: { ...filters.fecha, hasta: e.target.value } })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <div>
            <p className="label">Estrellas</p>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="minEstrellas">
                Mínimo de estrellas
              </label>
              <select
                id="minEstrellas"
                className="input min-h-[44px] w-auto py-2 pr-8"
                value={filters.minEstrellas}
                onChange={(e) => {
                  const min = Number(e.target.value) as Stars
                  onChange({ ...filters, minEstrellas: min, maxEstrellas: Math.max(min, filters.maxEstrellas) as Stars })
                }}
              >
                {STAR_VALUES.map((s) => (
                  <option key={s} value={s}>
                    {s} ★
                  </option>
                ))}
              </select>
              <span className="text-sm text-slate-500">a</span>
              <label className="sr-only" htmlFor="maxEstrellas">
                Máximo de estrellas
              </label>
              <select
                id="maxEstrellas"
                className="input min-h-[44px] w-auto py-2 pr-8"
                value={filters.maxEstrellas}
                onChange={(e) => {
                  const max = Number(e.target.value) as Stars
                  onChange({ ...filters, maxEstrellas: max, minEstrellas: Math.min(max, filters.minEstrellas) as Stars })
                }}
              >
                {STAR_VALUES.map((s) => (
                  <option key={s} value={s}>
                    {s} ★
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="recorrido" className="label">
              Recorrido
            </label>
            <select
              id="recorrido"
              className="input min-h-[44px] w-auto py-2 pr-8"
              value={filters.recorrido}
              onChange={(e) => onChange({ ...filters, recorrido: e.target.value as RecorridoId | 'todos' })}
            >
              <option value="todos">Todos</option>
              {config.recorridos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button type="button" onClick={onClear} disabled={limpio} className="btn-outline min-h-[44px] py-2 text-sm">
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
