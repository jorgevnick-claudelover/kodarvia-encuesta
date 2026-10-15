import type { ReactNode } from 'react'

interface Props {
  titulo: string
  ayuda?: string
  children: ReactNode
}

/** Marco de cada pregunta: una por pantalla, título grande y contenido */
export function StepShell({ titulo, ayuda, children }: Props) {
  return (
    <section key={titulo} className="animate-slide-in">
      <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">{titulo}</h1>
      {ayuda && <p className="mt-2 text-base text-slate-600">{ayuda}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}
