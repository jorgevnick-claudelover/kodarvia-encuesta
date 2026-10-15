import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { config, guiaNombre } from '../config'
import { ArrowLeftIcon, BikeIcon, HelmetIcon, MapPinIcon } from '../components/ui/BikeIcon'
import { Logo } from '../components/ui/Logo'
import { ChoiceList } from '../components/survey/ChoiceList'
import { CommentStep } from '../components/survey/CommentStep'
import { ConsentStep } from '../components/survey/ConsentStep'
import { FinalScreen } from '../components/survey/FinalScreen'
import { ProgressBar } from '../components/survey/ProgressBar'
import { StarRating } from '../components/survey/StarRating'
import { StepShell } from '../components/survey/StepShell'
import { initStore, markReviewClicked, submitResponse } from '../lib/store'
import {
  BICI_OPCIONES,
  CASCO_OPCIONES,
  buildSteps,
  canSubmit,
  emptyDraft,
  isStepComplete,
  isValidWhatsapp,
  parseSurveyParams,
} from '../lib/survey'
import type { FeedbackResponse, SurveyDraft } from '../types'

const AUTO_ADVANCE_MS = 260

export function SurveyPage() {
  const location = useLocation()
  const params = useMemo(() => parseSurveyParams(location.search), [location.search])
  const steps = useMemo(() => buildSteps(params), [params])

  const [draft, setDraft] = useState<SurveyDraft>(() => emptyDraft(params))
  const [index, setIndex] = useState(0)
  const [consentError, setConsentError] = useState<string | null>(null)
  const [enviada, setEnviada] = useState<FeedbackResponse | null>(null)

  useEffect(() => {
    initStore()
  }, [])

  const step = steps[index]
  const total = steps.length
  const esUltimo = index === total - 1

  const patch = useCallback((p: Partial<SurveyDraft>) => setDraft((d) => ({ ...d, ...p })), [])

  const goNext = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total])
  const goBack = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), [])

  /** Elección única: guarda y avanza solo */
  const pickAndAdvance = (p: Partial<SurveyDraft>) => {
    patch(p)
    window.setTimeout(goNext, AUTO_ADVANCE_MS)
  }

  const restart = () => {
    setDraft(emptyDraft(params))
    setIndex(0)
    setConsentError(null)
    setEnviada(null)
    window.scrollTo({ top: 0 })
  }

  const enviar = () => {
    const check = canSubmit(draft)
    if (!check.ok) {
      setConsentError(check.motivo)
      return
    }
    const { response } = submitResponse(draft)
    setEnviada(response)
    window.scrollTo({ top: 0 })
  }

  const puedeAvanzar = step === 'comentario' ? isValidWhatsapp(draft.contactoWhatsapp) : isStepComplete(step, draft)

  if (enviada) {
    return (
      <Layout>
        <FinalScreen
          response={enviada}
          onReviewClick={() => {
            markReviewClicked(enviada.id)
            setEnviada({ ...enviada, reviewClicked: true })
          }}
          onRestart={restart}
        />
      </Layout>
    )
  }

  const guiaNombreUrl = params.guia ? guiaNombre(params.guia) : null

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={index === 0}
          className="btn-ghost -ml-2 h-12 w-12 shrink-0 rounded-full px-0 disabled:opacity-0"
          aria-label="Volver a la pregunta anterior"
        >
          <ArrowLeftIcon />
        </button>
        <div className="flex-1">
          <ProgressBar current={index + 1} total={total} />
        </div>
      </div>

      {params.recorrido && index === 0 && (
        <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-brand">
          <MapPinIcon className="h-4 w-4" />
          Recorrido {config.recorridos.find((r) => r.id === params.recorrido)?.nombre}
          {guiaNombreUrl ? ` · Guía ${guiaNombreUrl}` : ''}
        </p>
      )}

      <div className="flex-1">
        {step === 'recorrido' && (
          <StepShell titulo="¿Qué recorrido hiciste hoy?" ayuda="Tocá el circuito para seguir.">
            <ChoiceList
              name="Recorrido realizado"
              value={draft.recorrido}
              onChange={(recorrido) => pickAndAdvance({ recorrido })}
              options={config.recorridos.map((r) => ({
                value: r.id,
                label: r.nombre,
                descripcion: r.descripcion,
                icon: <MapPinIcon className="h-6 w-6" />,
              }))}
            />
          </StepShell>
        )}

        {step === 'general' && (
          <StepShell titulo="¿Cómo estuvo tu recorrido?" ayuda="Tu calificación general, del 1 al 5.">
            <StarRating name="Calificación general" value={draft.estrellasGeneral} onChange={(estrellasGeneral) => pickAndAdvance({ estrellasGeneral })} />
          </StepShell>
        )}

        {step === 'bici' && (
          <StepShell titulo="¿Cómo estaba la bicicleta?" ayuda="Pensá en los frenos y los cambios.">
            <ChoiceList
              name="Estado de la bicicleta"
              value={draft.bici}
              onChange={(bici) => pickAndAdvance({ bici })}
              options={BICI_OPCIONES.map((o) => ({ value: o.value, label: o.label, icon: <BikeIcon className="h-7 w-7" /> }))}
            />
          </StepShell>
        )}

        {step === 'casco' && (
          <StepShell titulo="¿Y el casco y el equipamiento?" ayuda="Casco, luces, candado y lo que hayas usado.">
            <ChoiceList
              name="Casco y equipamiento"
              value={draft.casco}
              onChange={(casco) => pickAndAdvance({ casco })}
              options={CASCO_OPCIONES.map((o) => ({ value: o.value, label: o.label, icon: <HelmetIcon className="h-7 w-7" /> }))}
            />
          </StepShell>
        )}

        {step === 'guia' && (
          <StepShell
            titulo={guiaNombreUrl ? `¿Cómo estuvo ${guiaNombreUrl} como guía?` : '¿Cómo estuvo tu guía?'}
            ayuda="Amabilidad y claridad al explicar."
          >
            <StarRating name="Calificación del guía" value={draft.estrellasGuia} onChange={(estrellasGuia) => pickAndAdvance({ estrellasGuia })} />
          </StepShell>
        )}

        {step === 'comentario' && draft.estrellasGeneral && <CommentStep stars={draft.estrellasGeneral} draft={draft} onChange={patch} />}

        {step === 'consentimiento' && (
          <ConsentStep
            checked={draft.consentimiento}
            error={consentError}
            onChange={(consentimiento) => {
              patch({ consentimiento })
              if (consentimiento) setConsentError(null)
            }}
          />
        )}
      </div>

      {/* Botón principal anclado abajo; los pasos de elección única avanzan solos */}
      <div className="sticky bottom-0 -mx-5 mt-8 bg-gradient-to-t from-bg via-bg to-transparent px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
        {esUltimo ? (
          <button
            type="button"
            onClick={enviar}
            aria-disabled={!draft.consentimiento}
            aria-describedby={consentError ? 'consent-error' : undefined}
            className={`btn-primary w-full text-lg ${draft.consentimiento ? '' : 'cursor-not-allowed opacity-50 active:scale-100'}`}
          >
            Enviar
          </button>
        ) : (
          <button type="button" onClick={goNext} disabled={!puedeAvanzar} className="btn-brand w-full text-lg">
            {step === 'comentario' ? 'Continuar' : 'Siguiente'}
          </button>
        )}
      </div>
    </Layout>
  )
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-5">
      <header className="mb-6 flex items-center justify-between">
        <Logo />
        <Link to="/admin" className="text-xs font-semibold text-slate-400 hover:text-brand">
          Panel
        </Link>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
