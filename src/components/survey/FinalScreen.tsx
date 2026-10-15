import { config } from '../../config'
import { canInviteReview, sentimiento } from '../../lib/survey'
import type { FeedbackResponse } from '../../types'
import { BikeIcon, ExternalIcon } from '../ui/BikeIcon'

interface Props {
  response: FeedbackResponse
  onReviewClick: () => void
  onRestart: () => void
}

export function FinalScreen({ response, onReviewClick, onRestart }: Props) {
  const tono = sentimiento(response.estrellasGeneral)
  const invitar = canInviteReview(response.estrellasGeneral)

  return (
    <section className="flex flex-1 flex-col animate-slide-in">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span
          className={`grid h-20 w-20 place-items-center rounded-full ${
            tono === 'negativo' ? 'bg-red-50 text-alert' : 'bg-green-50 text-brand'
          }`}
        >
          <BikeIcon className="h-11 w-11" />
        </span>

        {tono === 'negativo' && (
          <>
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">Gracias por avisarnos</h1>
            <p className="mt-3 max-w-sm text-base text-slate-600">
              El encargado ya recibió tu aviso y te contacta hoy. Lamentamos que el recorrido no haya salido como esperabas.
            </p>
            {response.contactoWhatsapp ? (
              <p className="mt-3 text-sm font-semibold text-slate-500">Te escribimos al {response.contactoWhatsapp}.</p>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Si querés hablar ahora, escribinos al {config.encargado.whatsapp}.
              </p>
            )}
          </>
        )}

        {tono === 'neutro' && (
          <>
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">¡Gracias por tu opinión!</h1>
            <p className="mt-3 max-w-sm text-base text-slate-600">
              Tomamos nota de lo que mejorarías. Cada respuesta ajusta un poco el próximo recorrido.
            </p>
          </>
        )}

        {tono === 'positivo' && (
          <>
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">¡Qué bueno que la pasaste bien!</h1>
            <p className="mt-3 max-w-sm text-base text-slate-600">
              Gracias por pedalear con nosotros. Si tenés un minuto más, tu reseña ayuda a que otros se animen a conocer Buenos
              Aires en bici.
            </p>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {/* La invitación a Google Maps existe solo cuando canInviteReview() es true (4-5 estrellas) */}
        {invitar && (
          <a
            href={config.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onReviewClick}
            className="btn-primary w-full text-lg"
          >
            Contalo en Google Maps
            <ExternalIcon className="h-5 w-5" />
          </a>
        )}
        <button type="button" onClick={onRestart} className={invitar ? 'btn-ghost w-full' : 'btn-outline w-full'}>
          Enviar otra respuesta
        </button>
      </div>
    </section>
  )
}
