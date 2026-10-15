interface Props {
  current: number
  total: number
}

export function ProgressBar({ current, total }: Props) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={`Paso ${current} de ${total}`}
      >
        <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-slate-500">
        {current}/{total}
      </span>
    </div>
  )
}
