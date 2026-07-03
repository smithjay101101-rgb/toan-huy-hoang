import { useTranslation } from 'react-i18next'
import { Mail, Phone, MapPin, Check } from 'lucide-react'
import Seo from '@/components/Seo'
import PageHeader from '@/components/PageHeader'
import { ChannelIcon } from '@/components/icons'
import { SITE, PHONES, allChannels } from '@/config/site'

/**
 * Contact page. No form: one tap opens the visitor's channel of choice with a
 * prefilled inquiry they can personalize (WhatsApp, Telegram and mail support
 * prefill; Zalo and KakaoTalk open the chat directly).
 */
export default function Contact() {
  const { t } = useTranslation()
  const meta = t('meta.contact', { returnObjects: true }) as { title: string; description: string }

  const prefill = t('contact.prefill')
  const channels = allChannels(prefill)
  const mailHref = `mailto:${SITE.email}?subject=${encodeURIComponent('Property inquiry')}&body=${encodeURIComponent(prefill)}`
  const promises = [t('contact.promise1'), t('contact.promise2'), t('contact.promise3')]

  const rowCls =
    'btn justify-start gap-3 border border-ink/45 font-medium text-ink transition-colors hover:border-gold-ink hover:text-gold-ink'

  return (
    <>
      <Seo title={meta.title} description={meta.description} />
      <PageHeader
        title={t('contact.headline')}
        lead={t('contact.body')}
        image={{
          avif: '/media/hero-city.avif',
          webp: '/media/hero-city.webp',
          jpg: '/media/hero-city.jpg',
          alt: 'The Da Nang skyline along the coast',
        }}
      />

      <section className="bg-cream text-ink">
        <div className="container-lux grid gap-14 pb-24 pt-20 lg:grid-cols-[1fr_1.2fr] lg:gap-24 lg:pb-32 lg:pt-28">
          {/* Why write: three quiet promises, then the office. */}
          <div>
            <p className="eyebrow-ink">{t('contact.directTitle')}</p>
            <ul className="mt-8 space-y-4">
              {promises.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[16px] font-light leading-relaxed text-ink/80">
                  <Check size={16} strokeWidth={2} className="mt-1.5 shrink-0 text-gold-ink" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-12 border-t border-ink/12 pt-8">
              <span className="block text-xs uppercase tracking-[0.18em] text-ink/70">{t('contact.office')}</span>
              <p className="mt-3 flex gap-2.5 leading-relaxed text-ink">
                <MapPin size={17} strokeWidth={1.5} className="mt-1 shrink-0 text-gold-ink" aria-hidden="true" />
                <span>{t('contact.officeValue')}</span>
              </p>
            </div>
          </div>

          {/* One tap per channel, prefilled where the platform allows it. */}
          <div className="flex flex-col gap-3">
            {channels.map((ch) => (
              <a
                key={ch.kind}
                href={ch.href}
                target={ch.href.startsWith('http') ? '_blank' : undefined}
                rel={ch.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={rowCls}
              >
                <ChannelIcon kind={ch.kind} size={17} />
                {t('contact.orMessageOn', { channel: ch.label })}
              </a>
            ))}
            {PHONES.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} className={rowCls}>
                <Phone size={17} strokeWidth={1.5} />
                {t('contact.phone')}
                <span className="ml-auto font-light tabular-nums text-ink/70">{p.display}</span>
              </a>
            ))}
            <a href={mailHref} className={rowCls}>
              <Mail size={17} strokeWidth={1.5} />
              {t('contact.email')}
              <span className="ml-auto truncate font-light text-ink/70">{SITE.email}</span>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
