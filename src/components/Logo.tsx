import { useTranslation } from 'react-i18next'

/**
 * The Toan Huy Hoang brand logo, used exactly as supplied: original artwork,
 * colours, white background and all. It is NOT edited (no recolour, no cutout).
 * On the dark site it sits on a clean white plate so it appears identical to the
 * reference. 760 x 522 (trimmed of empty margin only).
 */
export default function Logo({ height = 84, className }: { height?: number; className?: string }) {
  const { t } = useTranslation()
  const width = Math.round((760 / 522) * height)
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[4px] bg-white ${className ?? ''}`}
      style={{ padding: Math.round(height * 0.16) }}
    >
      <img
        src="/media/logo.png"
        alt={t('footer.signature')}
        width={width}
        height={height}
        style={{ height, width: 'auto', display: 'block' }}
        decoding="async"
      />
    </span>
  )
}
