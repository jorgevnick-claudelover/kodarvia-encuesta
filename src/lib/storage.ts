import { config } from '../config'

/**
 * Capa de persistencia tipada sobre localStorage.
 * Si localStorage no está disponible (modo privado, cuota, políticas del navegador)
 * se usa un Map en memoria para que la app siga funcionando durante la sesión.
 *
 * Kodarvia: para persistir en backend, reemplazá readJSON/writeJSON por llamadas a la API
 * manteniendo la misma firma; el resto de la app no necesita cambios.
 */

export const CHANGE_EVENT = 'bicifeedback:change'

const memory = new Map<string, string>()

function getLocalStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    const probe = `${config.storagePrefix}__probe`
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    return null
  }
}

export const storageKey = (name: string) => `${config.storagePrefix}${name}`

export function readJSON<T>(name: string, fallback: T): T {
  const key = storageKey(name)
  try {
    const ls = getLocalStorage()
    const raw = ls ? ls.getItem(key) : memory.get(key) ?? null
    if (raw === null || raw === undefined) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(name: string, value: T): void {
  const key = storageKey(name)
  const raw = JSON.stringify(value)
  try {
    const ls = getLocalStorage()
    if (ls) ls.setItem(key, raw)
    else memory.set(key, raw)
  } catch {
    memory.set(key, raw)
  }
  emitChange(name)
}

export function removeKey(name: string): void {
  const key = storageKey(name)
  try {
    const ls = getLocalStorage()
    if (ls) ls.removeItem(key)
  } catch {
    // sin acceso a localStorage: solo limpiamos la memoria
  }
  memory.delete(key)
  emitChange(name)
}

export function hasKey(name: string): boolean {
  const key = storageKey(name)
  try {
    const ls = getLocalStorage()
    if (ls) return ls.getItem(key) !== null
  } catch {
    // caemos a memoria
  }
  return memory.has(key)
}

/** Borra todas las claves del prefijo versionado */
export function clearAll(): void {
  try {
    const ls = getLocalStorage()
    if (ls) {
      const keys: string[] = []
      for (let i = 0; i < ls.length; i += 1) {
        const k = ls.key(i)
        if (k && k.startsWith(config.storagePrefix)) keys.push(k)
      }
      keys.forEach((k) => ls.removeItem(k))
    }
  } catch {
    // sin acceso a localStorage
  }
  memory.clear()
  emitChange('*')
}

/** Avisa a la misma pestaña; el evento nativo "storage" se encarga de las otras */
function emitChange(name: string): void {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key: name } }))
}

export function isUsingMemoryFallback(): boolean {
  return getLocalStorage() === null
}
