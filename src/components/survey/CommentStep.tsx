import { commentPrompt, isValidWhatsapp } from '../../lib/survey'
import type { Stars, SurveyDraft } from '../../types'
import { ChipGroup } from './ChipGroup'
import { StepShell } from './StepShell'

interface Props {
  stars: Stars
  draft: SurveyDraft
  onChange: (patch: Partial<SurveyDraft>) => void
}

export function CommentStep({ stars, draft, onChange }: Props) {
  const prompt = commentPrompt(stars)
  const whatsappOk = isValidWhatsapp(draft.contactoWhatsapp)

  const toggleChip = (chip: string) => {
    const chips = draft.chips.includes(chip) ? draft.chips.filter((c) => c !== chip) : [...draft.chips, chip]
    onChange({ chips })
  }

  return (
    <StepShell titulo={prompt.titulo} ayuda={prompt.ayuda}>
      <ChipGroup options={prompt.chips} selected={draft.chips} onToggle={toggleChip} label="Motivos rápidos" />

      <label htmlFor="comentario" className="label mt-6">
        Contanos más <span className="font-normal text-slate-400">(opcional)</span>
      </label>
      <textarea
        id="comentario"
        className="input min-h-[112px] resize-none"
        placeholder={prompt.placeholder}
        value={draft.comentario}
        maxLength={600}
        onChange={(e) => onChange({ comentario: e.target.value })}
      />

      {prompt.pedirContacto && (
        <fieldset className="mt-6 rounded-3xl border-2 border-alert/20 bg-red-50/60 p-4">
          <legend className="px-1 text-sm font-bold text-alert">Para que el encargado te escriba hoy</legend>
          <p className="mb-3 text-sm text-slate-600">Dejanos un contacto si querés que te llamemos. Es opcional.</p>
          <label htmlFor="contactoNombre" className="label">
            Tu nombre
          </label>
          <input
            id="contactoNombre"
            className="input"
            autoComplete="name"
            placeholder="Cómo te llamás"
            value={draft.contactoNombre}
            onChange={(e) => onChange({ contactoNombre: e.target.value })}
          />
          <label htmlFor="contactoWhatsapp" className="label mt-3">
            Tu WhatsApp
          </label>
          <input
            id="contactoWhatsapp"
            className="input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+54 9 11 ..."
            value={draft.contactoWhatsapp}
            aria-invalid={!whatsappOk}
            aria-describedby={whatsappOk ? undefined : 'contactoWhatsapp-error'}
            onChange={(e) => onChange({ contactoWhatsapp: e.target.value })}
          />
          {!whatsappOk && (
            <p id="contactoWhatsapp-error" className="mt-1.5 text-sm font-medium text-alert">
              Revisá el número: necesita entre 8 y 15 dígitos.
            </p>
          )}
        </fieldset>
      )}
    </StepShell>
  )
}
