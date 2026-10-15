import { useEffect } from 'react'
import { BellIcon } from './BikeIcon'

export interface ToastMessage {
  id: string
  titulo: string
  detalle: string
  tono: 'alert' | 'brand'
}

interface Props {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export function ToastStack({ toasts, onDismiss }: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-3" aria-live="assertive">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 7000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const tono = toast.tono === 'alert' ? 'bg-alert text-white' : 'bg-brand text-white'

  return (
    <div role="status" className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl px-4 py-3 shadow-card animate-slide-in ${tono}`}>
      <BellIcon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-bold">{toast.titulo}</p>
        <p className="text-sm opacity-90">{toast.detalle}</p>
      </div>
      <button type="button" onClick={() => onDismiss(toast.id)} className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-white/15" aria-label="Cerrar aviso">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  )
}
