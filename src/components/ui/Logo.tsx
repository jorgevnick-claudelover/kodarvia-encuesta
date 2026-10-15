import { config } from '../../config'
import { BikeIcon } from './BikeIcon'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand text-white">
        <BikeIcon className="h-6 w-6" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-base font-extrabold tracking-tight text-ink">{config.operador}</span>
          <span className="block text-xs font-medium text-slate-500">{config.lema}</span>
        </span>
      )}
    </div>
  )
}
