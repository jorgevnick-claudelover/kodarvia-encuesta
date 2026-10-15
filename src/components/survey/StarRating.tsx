import { STAR_VALUES, starsLabel } from '../../lib/survey'
import type { Stars } from '../../types'
import { StarIcon } from '../ui/BikeIcon'

interface Props {
  value: Stars | null
  onChange: (value: Stars) => void
  name: string
  size?: 'lg' | 'md'
}

const DESCRIPCION: Record<Stars, string> = {
  1: 'Muy malo',
  2: 'Malo',
  3: 'Regular',
  4: 'Bueno',
  5: 'Excelente',
}

export function StarRating({ value, onChange, name, size = 'lg' }: Props) {
  const dim = size === 'lg' ? 'h-12 w-12 sm:h-14 sm:w-14' : 'h-10 w-10'
  return (
    <div>
      <div role="radiogroup" aria-label={name} className="flex justify-between gap-1">
        {STAR_VALUES.map((n) => {
          const activa = value !== null && n <= value
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={starsLabel(n)}
              onClick={() => onChange(n)}
              className={`grid min-h-[56px] flex-1 place-items-center rounded-2xl transition active:scale-95 ${
                activa ? 'text-accent' : 'text-slate-300 hover:text-lime-300'
              }`}
            >
              <StarIcon className={dim} filled={activa} />
            </button>
          )
        })}
      </div>
      <p className="mt-3 h-6 text-center text-sm font-semibold text-slate-500" aria-live="polite">
        {value ? DESCRIPCION[value] : 'Tocá una estrella'}
      </p>
    </div>
  )
}
