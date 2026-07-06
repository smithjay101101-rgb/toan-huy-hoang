import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import type { Locale } from '@/i18n'
import { localePath } from '@/lib/locale'
import { SITE, contactFor } from '@/config/site'
import LanguageSwitcher from './LanguageSwitcher'
import { ChannelIcon } from './icons'

const EXPLORE = ['buy', 'rent', 'projects', 'guides', 'about', 'contact'] as const

// inline-block + vertical padding keeps footer tap areas comfortable on touch
// (py-2 + the 14px row gap ≈ a 44px rhythm between adjacent links).
const linkCls = 'inline-block cursor-pointer py-2 transition-colors duration-200 hover:text-gold-2'

export default function Footer({ locale }: { locale: Locale }) {
  const { t } = useTranslation()
  const contact = contactFor(locale)
  return (
    <footer className="bg-card" style={{ color: '#eef0f0', fontFamily: "'Jost', sans-serif" }}>
      <div className="mx-auto max-w-[1280px]" style={{ padding: '96px clamp(40px,6vw,96px) 0' }}>
        {/* Closing CTA */}
        <div
          className="flex flex-wrap items-end justify-between gap-10 border-b pb-16"
          style={{ borderColor: 'rgba(255,255,255,0.14)' }}
        >
          <div>
            <div className="text-[13px] uppercase" style={{ letterSpacing: '0.4em', color: 'var(--gold-2)', marginBottom: 22 }}>
              {t('footer.eyebrow')}
            </div>
            <h2 className="font-display font-semibold" style={{ fontSize: 'clamp(38px,4vw,60px)', lineHeight: 1.05, maxWidth: '16ch' }}>
              {t('footer.closing')}
            </h2>
          </div>
          <Link
            to={localePath(locale, 'contact')}
            className="inline-flex items-center gap-3 whitespace-nowrap bg-gold-2 px-[40px] py-[18px] text-[13px] font-semibold uppercase tracking-[0.22em] text-ink transition-colors duration-200 hover:bg-white"
          >
            {t('footer.book')}
          </Link>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display text-[22px] font-semibold uppercase tracking-[0.28em]" style={{ marginBottom: 18 }}>
              Toan Huy Hoang
            </div>
            <p className="text-[14px] font-light leading-[1.7]" style={{ color: 'rgba(238,240,240,0.7)', maxWidth: '34ch' }}>
              {t('footer.blurb')}
            </p>
          </div>

          <div>
            <div className="text-[12px] uppercase" style={{ letterSpacing: '0.24em', color: 'var(--gold-2)', marginBottom: 20 }}>
              {t('footer.explore')}
            </div>
            <ul className="flex flex-col gap-[14px] text-[15px] font-light">
              {EXPLORE.map((it) => (
                <li key={it}>
                  <Link to={localePath(locale, it)} className={linkCls}>
                    {t(`nav.${it}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[12px] uppercase" style={{ letterSpacing: '0.24em', color: 'var(--gold-2)', marginBottom: 20 }}>
              {t('footer.contactTitle')}
            </div>
            <ul className="flex flex-col gap-[14px] text-[15px] font-light">
              {contact.channels.map((ch) => (
                <li key={ch.kind}>
                  <a
                    href={ch.href}
                    target={ch.href.startsWith('http') ? '_blank' : undefined}
                    rel={ch.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`${linkCls} inline-flex items-center gap-2`}
                  >
                    <ChannelIcon kind={ch.kind} size={14} />
                    {ch.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${SITE.email}`} className={linkCls}>
                  {SITE.email}
                </a>
              </li>
              <li>
                <a href={`tel:${contact.phoneTel}`} style={{ color: 'rgba(238,240,240,0.7)' }} className="inline-block py-2 transition-colors duration-200 hover:text-gold-2">
                  {contact.phoneDisplay}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[12px] uppercase" style={{ letterSpacing: '0.24em', color: 'var(--gold-2)', marginBottom: 20 }}>
              {t('footer.officeTitle')}
            </div>
            <p className="flex gap-2.5 text-[15px] font-light leading-[1.7]" style={{ color: 'rgba(238,240,240,0.85)' }}>
              <MapPin size={16} strokeWidth={1.5} className="mt-1 shrink-0" style={{ color: 'var(--gold-2)' }} aria-hidden="true" />
              <span>{t('footer.officeValue')}</span>
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 border-t py-7 text-[13px] font-light"
          style={{ borderColor: 'rgba(255,255,255,0.14)', color: 'rgba(238,240,240,0.6)', paddingBottom: 40 }}
        >
          <span>
            © {new Date().getFullYear()} {SITE.name}. {t('footer.rights')}
          </span>
          {/* Privacy/Terms links return when those pages exist; fake links erode trust. */}
          <LanguageSwitcher current={locale} />
        </div>
      </div>
    </footer>
  )
}
