import { MessageCircle } from 'lucide-react'
import { zaloLink } from '@/config/site'

/**
 * Subtle Zalo entry point. Zalo is the primary channel in Vietnam, so it is
 * present but quiet, a hairline pill rather than a loud floating bubble.
 */
export default function ZaloButton({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href={zaloLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Zalo"
      className="inline-flex items-center gap-2 rounded-[2px] border border-line px-3 text-text/80 transition-colors duration-200 hover:border-gold hover:text-text"
      style={{ minHeight: 40 }}
    >
      <MessageCircle size={16} strokeWidth={1.5} aria-hidden="true" />
      {!compact && (
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em]">Zalo</span>
      )}
    </a>
  )
}
