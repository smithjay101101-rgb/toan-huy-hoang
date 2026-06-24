import type { ReactNode } from 'react'

/** Standard inner-page header. Clears the fixed nav, sets the editorial tone. */
export default function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string
  title: string
  lead?: string
  children?: ReactNode
}) {
  return (
    <header className="border-b border-line">
      <div className="container-lux pb-14 pt-36 lg:pb-20 lg:pt-48">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-5 max-w-[18ch] font-display text-text" style={{ fontSize: 'clamp(2.25rem, 1.6rem + 3.4vw, 4.5rem)', lineHeight: 1.04 }}>
          {title}
        </h1>
        {lead && <p className="lead mt-6">{lead}</p>}
        {children}
      </div>
    </header>
  )
}
