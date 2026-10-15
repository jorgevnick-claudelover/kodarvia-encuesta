interface Props {
  className?: string
  title?: string
}

/** Bici simple en SVG inline, hereda el color del texto */
export function BikeIcon({ className = 'h-6 w-6', title }: Props) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="13" cy="27" r="10" />
      <circle cx="51" cy="27" r="10" />
      <path d="M13 27l11-17h13l7 17M24 10l-4-6h-6M32 27l-4-17M32 27h19" />
      <circle cx="40" cy="4" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function HelmetIcon({ className = 'h-6 w-6' }: Props) {
  return (
    <svg viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 22a20 20 0 0 1 40 0v2H4z" />
      <path d="M12 22c2-8 6-12 12-14M24 8c6 2 10 6 12 14" />
      <path d="M14 24l2 5M34 24l-2 5" />
    </svg>
  )
}

export function MapPinIcon({ className = 'h-6 w-6' }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

export function StarIcon({ className = 'h-6 w-6', filled = false }: Props & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M12 2.8l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.6 6.1 20.9l1.3-6.6L2.5 9.7l6.6-.8z" />
    </svg>
  )
}

export function ArrowLeftIcon({ className = 'h-5 w-5' }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  )
}

export function CheckIcon({ className = 'h-5 w-5' }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

export function BellIcon({ className = 'h-5 w-5' }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function ExternalIcon({ className = 'h-5 w-5' }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  )
}
