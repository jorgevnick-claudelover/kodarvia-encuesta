interface Props {
  options: string[]
  selected: string[]
  onToggle: (chip: string) => void
  label: string
}

/** Chips de selección múltiple */
export function ChipGroup({ options, selected, onToggle, label }: Props) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((chip) => {
        const on = selected.includes(chip)
        return (
          <button
            key={chip}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(chip)}
            className={`chip rounded-full px-4 py-2.5 text-sm ${on ? 'chip-selected' : ''}`}
          >
            {chip}
          </button>
        )
      })}
    </div>
  )
}
