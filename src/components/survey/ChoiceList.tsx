import type { ReactNode } from 'react'
import { CheckIcon } from '../ui/BikeIcon'

interface Option<T extends string> {
  value: T
  label: string
  descripcion?: string
  icon?: ReactNode
}

interface Props<T extends string> {
  options: Option<T>[]
  value: T | null
  onChange: (value: T) => void
  name: string
}

/** Lista de elección única: grandes, táctiles y con avance automático desde el padre */
export function ChoiceList<T extends string>({ options, value, onChange, name }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-col gap-3">
      {options.map((o) => {
        const selected = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={`chip min-h-[60px] justify-between px-5 text-left ${selected ? 'chip-selected' : ''}`}
          >
            <span className="flex items-center gap-3">
              {o.icon && <span className={selected ? 'text-brand' : 'text-slate-400'}>{o.icon}</span>}
              <span>
                <span className="block text-base font-semibold">{o.label}</span>
                {o.descripcion && <span className="block text-sm font-normal text-slate-500">{o.descripcion}</span>}
              </span>
            </span>
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
                selected ? 'border-brand bg-brand text-white' : 'border-slate-300'
              }`}
              aria-hidden="true"
            >
              {selected && <CheckIcon className="h-4 w-4" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
