import { useState } from 'react'
import { CheckIcon } from '../ui/BikeIcon'
import { PrivacyModal } from './PrivacyModal'
import { StepShell } from './StepShell'

interface Props {
  checked: boolean
  onChange: (value: boolean) => void
  error: string | null
}

export function ConsentStep({ checked, onChange, error }: Props) {
  const [modal, setModal] = useState(false)

  return (
    <StepShell titulo="Último paso" ayuda="Necesitamos tu permiso para guardar las respuestas.">
      <label
        className={`flex cursor-pointer items-start gap-4 rounded-3xl border-2 bg-white p-4 transition ${
          error ? 'border-alert' : checked ? 'border-brand' : 'border-slate-200'
        }`}
      >
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'consent-error' : undefined}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          aria-hidden="true"
          className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2 ${
            checked ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white'
          }`}
        >
          {checked && <CheckIcon className="h-5 w-5" />}
        </span>
        <span className="text-base leading-snug text-ink">
          Acepto la{' '}
          <button
            type="button"
            className="font-semibold text-brand underline underline-offset-2"
            onClick={(e) => {
              e.preventDefault()
              setModal(true)
            }}
          >
            política de privacidad
          </button>{' '}
          y el tratamiento de mis respuestas.
        </span>
      </label>

      {error && (
        <p id="consent-error" role="alert" className="mt-3 flex items-center gap-2 text-sm font-semibold text-alert">
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </p>
      )}

      <PrivacyModal open={modal} onClose={() => setModal(false)} />
    </StepShell>
  )
}
