// Monochrome brand glyphs for the contact channels, matching the existing
// icon treatment (16px default, currentColor, aria-hidden). SVG only.
import type { ChannelKind } from '@/config/site'

interface IconProps {
  size?: number
  className?: string
  /** Accepted for drop-in parity with lucide icons; stroke is not used. */
  strokeWidth?: number
}

/** Zalo: chat bubble carrying a Z, reads on any surface at 16px. */
export function ZaloIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2.5C6.2 2.5 1.5 6.25 1.5 10.88c0 2.95 1.91 5.54 4.8 7.02-.21.81-.77 2.94-.88 3.39-.14.56.2.56.42.4.18-.12 2.78-1.93 3.9-2.71.73.11 1.49.17 2.26.17 5.8 0 10.5-3.75 10.5-8.37S17.8 2.5 12 2.5Zm-3.4 5.4h6.8v1.9l-4.3 3.4h4.3v1.9H8.6v-1.9l4.3-3.4H8.6V7.9Z"
      />
    </svg>
  )
}

export function WhatsAppIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.3.7-1.9 1-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.7 1.7c.1.1.1.3 0 .5l-.3.5-.3.4c-.1.1-.3.3-.1.5.1.3.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.6-.8c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.5.3.1.2.1.7-.1 1.4Z" />
    </svg>
  )
}

/** KakaoTalk: the Kakao speech bubble (simple-icons path). */
export function KakaoIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 3c-5.799 0-10.5 3.664-10.5 8.185 0 2.882 1.912 5.414 4.797 6.86-.212.795-.767 2.87-.878 3.316-.136.55.2.542.423.395.174-.116 2.774-1.883 3.896-2.65.734.108 1.49.164 2.262.164 5.799 0 10.5-3.664 10.5-8.185S17.799 3 12 3" />
    </svg>
  )
}

/** Telegram: the paper-plane roundel (simple-icons path). */
export function TelegramIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

/** Icon for a channel kind, sharing one signature with the pieces above. */
export function ChannelIcon({ kind, ...props }: IconProps & { kind: ChannelKind }) {
  switch (kind) {
    case 'zalo':
      return <ZaloIcon {...props} />
    case 'whatsapp':
      return <WhatsAppIcon {...props} />
    case 'kakao':
      return <KakaoIcon {...props} />
    case 'telegram':
      return <TelegramIcon {...props} />
  }
}
