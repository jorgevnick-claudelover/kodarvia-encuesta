import { formatBuenosAires } from '../../lib/dates'
import type { OutboxMessage } from '../../types'
import { Modal } from '../ui/Modal'

interface Props {
  open: boolean
  onClose: () => void
  outbox: OutboxMessage[]
}

export function OutboxPanel({ open, onClose, outbox }: Props) {
  const ordenada = [...outbox].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <Modal open={open} title="Bandeja de salida simulada" onClose={onClose}>
      <p className="mb-4 text-sm text-slate-600">
        Acá quedan los mensajes que se enviarían al encargado por WhatsApp y por correo. En esta demo no sale nada de tu
        navegador: Kodarvia conecta las APIs reales en <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">src/lib/notifications.ts</code>.
      </p>
      {ordenada.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Todavía no se generó ningún aviso.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {ordenada.map((m) => (
            <li key={m.id} className="rounded-2xl border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${m.canal === 'whatsapp' ? 'bg-green-100 text-brand' : 'bg-slate-100 text-slate-700'}`}>
                  {m.canal === 'whatsapp' ? 'WhatsApp' : 'Correo'}
                </span>
                <span className="text-xs text-slate-500">{formatBuenosAires(m.createdAt)}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Para: <span className="font-semibold text-ink">{m.destinatario}</span>
              </p>
              {m.asunto && <p className="mt-1 text-sm font-semibold text-ink">{m.asunto}</p>}
              <pre className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-3 font-sans text-xs text-slate-700">{m.texto}</pre>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
