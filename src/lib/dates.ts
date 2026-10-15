import { config } from '../config'

const TZ = config.timeZone

const partsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

interface LocalParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function localParts(date: Date): LocalParts {
  const parts = partsFormatter.formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Clave de día AAAA-MM-DD en hora de Buenos Aires */
export function dayKey(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input
  const p = localParts(d)
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`
}

/** Desplaza n días una clave AAAA-MM-DD (sin depender de zonas horarias) */
export function shiftDayKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d + days))
  return `${utc.getUTCFullYear()}-${pad(utc.getUTCMonth() + 1)}-${pad(utc.getUTCDate())}`
}

/** Diferencia en minutos entre la hora local de Buenos Aires y UTC para un instante dado */
function offsetMinutes(date: Date): number {
  const p = localParts(date)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return Math.round((asUtc - date.getTime()) / 60000)
}

/** Construye un instante a partir de una fecha y hora en Buenos Aires */
export function fromBuenosAires(key: string, hour: number, minute = 0): Date {
  const [y, m, d] = key.split('-').map(Number)
  const guess = new Date(Date.UTC(y, m - 1, d, hour, minute, 0))
  const offset = offsetMinutes(guess)
  return new Date(guess.getTime() - offset * 60000)
}

/** Fecha y hora legibles en Buenos Aires, por ejemplo "14/10/2026 16:30" */
export function formatBuenosAires(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input
  const p = localParts(d)
  return `${pad(p.day)}/${pad(p.month)}/${p.year} ${pad(p.hour)}:${pad(p.minute)}`
}

/** Marca de tiempo ISO con desplazamiento de Buenos Aires, por ejemplo "2026-10-14T16:30:00-03:00" */
export function isoBuenosAires(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input
  const p = localParts(d)
  const off = offsetMinutes(d)
  const sign = off >= 0 ? '+' : '-'
  const abs = Math.abs(off)
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

/** Etiqueta corta para ejes: "14 oct" */
export function shortDayLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d, 12))
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(date)
}

export function formatHour(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input
  const p = localParts(d)
  return `${pad(p.hour)}:${pad(p.minute)}`
}
