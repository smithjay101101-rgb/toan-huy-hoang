import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import type { Locale } from '@/i18n'
import { getFeatured } from '@/data'
import { localePath } from '@/lib/locale'
import PropertyCard from './PropertyCard'
import Reveal from './Reveal'

export default function Showcase({ locale }: { locale: Locale }) {
  const { t } = useTranslation()
  const featured = getFeatured(4)
  if (featured.length === 0) return null
  const [lead, ...rest] = featured

  return (
    <section className="section">
      <div className="container-lux">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{t('showcase.eyebrow')}</p>
            <h2 className="mt-5 font-display text-text" style={{ fontSize: 'clamp(2rem, 1.4rem + 2.6vw, 3.5rem)' }}>
              {t('showcase.headline')}
            </h2>
            <p className="lead mt-5">{t('showcase.body')}</p>
          </div>
          <Link
            to={localePath(locale, 'buy')}
            className="group inline-flex items-center gap-2 whitespace-nowrap text-xs uppercase tracking-[0.2em] text-text/80 transition-colors hover:text-gold"
          >
            {t('showcase.viewAll')}
            <ArrowRight size={16} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-14 grid gap-6">
          <Reveal>
            <PropertyCard listing={lead} locale={locale} feature priority />
          </Reveal>
          {rest.length > 0 && (
            <Reveal stagger className="grid gap-6 md:grid-cols-3">
              {rest.map((l) => (
                <PropertyCard key={l.id} listing={l} locale={locale} />
              ))}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
