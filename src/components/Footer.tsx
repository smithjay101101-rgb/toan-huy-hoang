import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Locale } from '@/i18n'
import { localePath } from '@/lib/locale'
import { SITE, zaloLink, whatsappLink } from '@/config/site'
import LanguageSwitcher from './LanguageSwitcher'

const EXPLORE = ['buy', 'rent', 'projects', 'about'] as const

const linkCls = 'cursor-pointer transition-colors duration-200 hover:text-gold-2'

export default function Footer({ locale }: { locale: Locale }) {
  const { t } = useTranslation()
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
              <li>
                <a href={zaloLink()} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  {t('nav.zalo')}
                </a>
              </li>
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className={linkCls}>
                  {SITE.email}
                </a>
              </li>
              <li>
                <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} style={{ color: 'rgba(238,240,240,0.7)' }} className="transition-colors duration-200 hover:text-gold-2">
                  {SITE.phone}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[12px] uppercase" style={{ letterSpacing: '0.24em', color: 'var(--gold-2)', marginBottom: 20 }}>
              {t('footer.officeTitle')}
            </div>
            <p className="text-[15px] font-light leading-[1.7]" style={{ color: 'rgba(238,240,240,0.85)' }}>
              {t('footer.officeValue')}
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
          <span className="flex items-center gap-6">
            <span className={linkCls}>{t('footer.privacy')}</span>
            <span className={linkCls}>{t('footer.terms')}</span>
            <LanguageSwitcher current={locale} />
          </span>
        </div>
      </div>
    </footer>
  )
}
