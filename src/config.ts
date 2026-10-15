import type { RecorridoId } from './types'

export interface Recorrido {
  id: RecorridoId
  nombre: string
  descripcion: string
}

export interface Guia {
  id: string
  nombre: string
}

export const config = {
  /** Nombre del operador, editable */
  operador: 'Pedalea Rutas',
  lema: 'Recorridos guiados en bici por Buenos Aires',

  recorridos: [
    { id: 'san-telmo', nombre: 'San Telmo', descripcion: 'Adoquines, Plaza Dorrego y la feria' },
    { id: 'la-boca', nombre: 'La Boca', descripcion: 'Caminito, Vuelta de Rocha y el puente' },
    { id: 'costanera-sur', nombre: 'Costanera Sur', descripcion: 'Reserva Ecológica y el río' },
    { id: 'palermo', nombre: 'Palermo', descripcion: 'Bosques, Rosedal y el Planetario' },
  ] as Recorrido[],

  guias: [
    { id: 'mariana', nombre: 'Mariana Ledesma' },
    { id: 'tomas', nombre: 'Tomás Arrieta' },
    { id: 'julieta', nombre: 'Julieta Ferreyra' },
    { id: 'nicolas', nombre: 'Nicolás Benítez' },
  ] as Guia[],

  // TODO (Kodarvia): reemplazar por la URL real de reseñas de la ficha de Google Business Profile.
  // Formato esperado: https://search.google.com/local/writereview?placeid=<PLACE_ID>
  googleReviewUrl: 'https://search.google.com/local/writereview?placeid=KODARVIA_PLACE_ID_PENDIENTE',

  /** Encargado de operaciones: destinatario de las alertas (simulado) */
  encargado: {
    nombre: 'Encargado de operaciones',
    whatsapp: '+54 9 11 5555 0101',
    email: 'operaciones@pedalearutas.com.ar',
  },

  timeZone: 'America/Argentina/Buenos_Aires',

  /** Prefijo versionado de las claves en localStorage */
  storagePrefix: 'bicifeedback:v1:',

  /** Filas por página en el historial del panel */
  pageSize: 20,
} as const

export const recorridoNombre = (id: string): string =>
  config.recorridos.find((r) => r.id === id)?.nombre ?? id

export const guiaNombre = (id: string): string =>
  config.guias.find((g) => g.id === id)?.nombre ?? (id || 'Sin asignar')

export const isRecorridoId = (value: string | null | undefined): value is RecorridoId =>
  config.recorridos.some((r) => r.id === value)

export const isGuiaId = (value: string | null | undefined): boolean =>
  config.guias.some((g) => g.id === value)
