import { whatsappLink } from '@/config/site'

/**
 * WhatsApp entry point, styled identically to the Zalo pill. Quiet hairline
 * affordance for international clients who prefer WhatsApp over Zalo.
 */
export default function WhatsAppButton({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="inline-flex items-center gap-2 rounded-[2px] border border-line px-3 text-text/80 transition-colors duration-200 hover:border-gold hover:text-text"
      style={{ minHeight: 40 }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.3.7-1.9 1-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.7 1.7c.1.1.1.3 0 .5l-.3.5-.3.4c-.1.1-.3.3-.1.5.1.3.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.6-.8c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.5.3.1.2.1.7-.1 1.4Z" />
      </svg>
      {!compact && (
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em]">WhatsApp</span>
      )}
    </a>
  )
}
