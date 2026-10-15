import { config } from '../../config'
import { Modal } from '../ui/Modal'

interface Props {
  open: boolean
  onClose: () => void
}

export function PrivacyModal({ open, onClose }: Props) {
  return (
    <Modal open={open} title="Política de privacidad" onClose={onClose}>
      <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
        Texto provisional: Kodarvia redacta los términos definitivos.
      </p>
      <div className="space-y-3 text-sm leading-relaxed text-slate-700">
        <p>
          <strong>{config.operador}</strong> recoge tus respuestas a esta encuesta con el único fin de mejorar los recorridos,
          resolver en el día los problemas que nos cuentes y, si así lo elegís, invitarte a dejar una reseña pública.
        </p>
        <p>
          <strong>Qué guardamos:</strong> el recorrido y guía de tu salida, tus calificaciones, los motivos que marques, tu
          comentario y, solo si los completás, tu nombre y número de WhatsApp.
        </p>
        <p>
          <strong>Para qué los usamos:</strong> estadísticas internas de calidad del servicio y contacto directo del encargado
          cuando la experiencia fue mala. No vendemos ni cedemos tus datos a terceros.
        </p>
        <p>
          <strong>Cuánto tiempo:</strong> las respuestas se conservan por un plazo máximo de 24 meses. Los datos de contacto se
          eliminan una vez resuelto el reclamo.
        </p>
        <p>
          <strong>Tus derechos:</strong> podés pedir acceso, rectificación o eliminación de tus datos escribiendo a{' '}
          <a className="font-semibold text-brand underline" href={`mailto:${config.encargado.email}`}>
            {config.encargado.email}
          </a>
          , conforme a la Ley 25.326 de Protección de los Datos Personales.
        </p>
      </div>
      <button type="button" onClick={onClose} className="btn-brand mt-6 w-full">
        Entendido
      </button>
    </Modal>
  )
}
