import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { shortDayLabel } from '../../lib/dates'
import { averageByRecorrido, dailySeries, distribution, problemFrequency } from '../../lib/stats'
import type { FeedbackResponse, Stars } from '../../types'

const COLORS = { brand: '#15803D', accent: '#84CC16', ink: '#0F172A', alert: '#DC2626', grid: '#E2E8F0', muted: '#64748B' }

const tooltipStyle = {
  borderRadius: 16,
  border: '1px solid #E2E8F0',
  boxShadow: '0 8px 24px -12px rgba(15,23,42,.2)',
  fontFamily: 'inherit',
  fontSize: 13,
}

interface Props {
  responses: FeedbackResponse[]
}

function ChartCard({ titulo, detalle, children }: { titulo: string; detalle: string; children: ReactNode }) {
  return (
    <section className="card">
      <h3 className="text-base font-bold text-ink">{titulo}</h3>
      <p className="mb-3 text-xs text-slate-500">{detalle}</p>
      <div className="h-56">{children}</div>
    </section>
  )
}

function Vacio() {
  return <p className="grid h-full place-items-center text-sm text-slate-400">Sin respuestas para estos filtros.</p>
}

export function Charts({ responses }: Props) {
  const dist = distribution(responses)
  const distData = ([1, 2, 3, 4, 5] as Stars[]).map((s) => ({ estrellas: `${s}★`, valor: s, cantidad: dist[s] }))
  const daily = dailySeries(responses).map((p) => ({ ...p, etiqueta: shortDayLabel(p.dia) }))
  const porRecorrido = averageByRecorrido(responses).map((r) => ({ ...r, promedio: r.promedio ?? 0 }))
  const problemas = problemFrequency(responses).map((p) => ({ ...p, etiqueta: `${p.categoria}: ${p.etiqueta}` }))
  const vacio = responses.length === 0

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard titulo="Distribución por estrellas" detalle="Cantidad de respuestas por calificación general. 1 y 2 en carmesí.">
        {vacio ? (
          <Vacio />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={COLORS.grid} />
              <XAxis dataKey="estrellas" tickLine={false} axisLine={false} tick={{ fill: COLORS.muted, fontSize: 12 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: COLORS.muted, fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={tooltipStyle} formatter={(v) => [v, 'Respuestas']} />
              <Bar dataKey="cantidad" radius={[8, 8, 0, 0]} name="Respuestas">
                {distData.map((d) => (
                  <Cell key={d.valor} fill={d.valor <= 2 ? COLORS.alert : d.valor === 3 ? COLORS.accent : COLORS.brand} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard titulo="Evolución del promedio diario" detalle="Promedio de estrellas por día, en hora de Buenos Aires.">
        {vacio ? (
          <Vacio />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={COLORS.grid} />
              <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} tick={{ fill: COLORS.muted, fontSize: 11 }} minTickGap={24} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tickLine={false} axisLine={false} tick={{ fill: COLORS.muted, fontSize: 12 }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v, _n, item) => [`${v} ★ · ${item.payload.cantidad} resp.`, 'Promedio']}
              />
              <Line type="monotone" dataKey="promedio" stroke={COLORS.brand} strokeWidth={3} dot={{ r: 3, fill: COLORS.accent, strokeWidth: 0 }} activeDot={{ r: 5 }} name="Promedio" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard titulo="Promedio por recorrido" detalle="Calificación general media de cada circuito.">
        {vacio ? (
          <Vacio />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={porRecorrido} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={COLORS.grid} />
              <XAxis dataKey="nombre" tickLine={false} axisLine={false} tick={{ fill: COLORS.muted, fontSize: 11 }} interval={0} />
              <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tickLine={false} axisLine={false} tick={{ fill: COLORS.muted, fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={tooltipStyle}
                formatter={(v, _n, item) => [`${v} ★ · ${item.payload.cantidad} resp.`, 'Promedio']}
              />
              <Bar dataKey="promedio" fill={COLORS.brand} radius={[8, 8, 0, 0]} name="Promedio" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard titulo="Problemas de bici y casco" detalle="Cuántas veces se marcó cada inconveniente.">
        {vacio ? (
          <Vacio />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={problemas} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke={COLORS.grid} />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: COLORS.muted, fontSize: 12 }} />
              <YAxis type="category" dataKey="etiqueta" width={150} tickLine={false} axisLine={false} tick={{ fill: COLORS.ink, fontSize: 11 }} />
              <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={tooltipStyle} formatter={(v) => [v, 'Veces']} />
              <Bar dataKey="cantidad" radius={[0, 8, 8, 0]} name="Veces">
                {problemas.map((p) => (
                  <Cell key={p.etiqueta} fill={p.categoria === 'Bici' ? COLORS.brand : COLORS.accent} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  )
}
