import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MessageCircle } from 'lucide-react'
import type { Locale } from '@/i18n'
import { localePath } from '@/lib/locale'
import { zaloLink } from '@/config/site'
import Reveal from './Reveal'

export default function CtaBand({ locale }: { locale: Locale }) {
  const { t } = useTranslation()
  return (
    <section className="border-y border-line bg-bg-2">
      <div className="container-lux py-24 text-center lg:py-32">
        <Reveal>
          <p className="eyebrow">{t('contact.eyebrow')}</p>
          <h2 className="mx-auto mt-5 max-w-[18ch] font-display text-text" style={{ fontSize: 'clamp(2rem, 1.4rem + 2.8vw, 3.75rem)' }}>
            {t('contact.headline')}
          </h2>
          <p className="lead mx-auto mt-6 text-center">{t('contact.body')}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to={localePath(locale, 'contact')} className="btn btn-primary">
              {t('contact.send')}
            </Link>
            <a href={zaloLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <MessageCircle size={16} strokeWidth={1.5} />
              {t('detail.inquireZalo')}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
