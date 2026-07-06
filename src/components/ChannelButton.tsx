import type { ContactChannel } from '@/config/site'
import { ChannelIcon } from './icons'

/**
 * Quiet hairline pill for a contact channel (Zalo, WhatsApp, KakaoTalk,
 * Telegram), one visual treatment for every locale's channel set.
 */
export default function ChannelButton({ channel, compact = false }: { channel: ContactChannel; compact?: boolean }) {
  const external = channel.href.startsWith('http')
  return (
    <a
      href={channel.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={channel.label}
      className="inline-flex items-center gap-2 rounded-[2px] border border-line px-3 text-text/80 transition-colors duration-200 hover:border-gold hover:text-text"
      style={{ minHeight: 44 }}
    >
      <ChannelIcon kind={channel.kind} size={16} />
      {!compact && (
        <span className="text-[0.72rem] font-medium uppercase tracking-[0.18em]">{channel.label}</span>
      )}
    </a>
  )
}
