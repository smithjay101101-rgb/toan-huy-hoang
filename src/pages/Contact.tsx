import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle, Mail, Phone, MapPin } from 'lucide-react'
import Seo from '@/components/Seo'
import PageHeader from '@/components/PageHeader'
import { SITE, zaloLink } from '@/config/site'

export default function Contact() {
  const { t } = useTranslation()
  const meta = t('meta.contact', { returnObjects: true }) as { title: string; description: string }
  const [sent, setSent] = useState(false)

  // No backend yet. Capture intent gracefully; SWAP with a real endpoint
  // (Cloudflare Pages Function, Formspree, or email service) before launch.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <>
      <Seo title={meta.title} description={meta.description} />
      <PageHeader eyebrow={t('contact.eyebrow')} title={t('contact.headline')} lead={t('contact.body')} />

      <section className="section">
        <div className="container-lux grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
          {/* Form */}
          <div>
            {sent ? (
              <div className="rounded-[4px] border border-gold/40 bg-card p-10 text-center">
                <p className="font-display text-xl text-text">{t('contact.sent')}</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="name" label={t('contact.name')} required />
                  <Field id="email" label={t('contact.email')} type="email" required />
                </div>
                <Field id="phone" label={t('contact.phone')} type="tel" autoComplete="tel" />
                <div>
                  <label htmlFor="message" className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted">
                    {t('contact.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="input resize-none"
                    placeholder={t('contact.messagePlaceholder')}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  {t('contact.send')}
                </button>
              </form>
            )}
          </div>

          {/* Direct details */}
          <aside className="lg:border-l lg:border-line lg:pl-16">
            <p className="eyebrow">{t('contact.directTitle')}</p>
            <ul className="mt-8 space-y-6">
              <ContactRow icon={MessageCircle} label={t('nav.zalo')} href={zaloLink()} value={SITE.phone} external />
              <ContactRow icon={Mail} label={t('contact.email')} href={`mailto:${SITE.email}`} value={SITE.email} />
              <ContactRow icon={Phone} label={t('contact.phone')} href={`tel:${SITE.phone.replace(/\s/g, '')}`} value={SITE.phone} />
              <ContactRow icon={MapPin} label={t('contact.office')} value={t('contact.officeValue')} />
            </ul>
            <a href={zaloLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-10">
              <MessageCircle size={16} strokeWidth={1.5} />
              {t('contact.orZalo')}
            </a>
          </aside>
        </div>
      </section>
    </>
  )
}

function Field({
  id,
  label,
  type = 'text',
  required,
  autoComplete,
}: {
  id: string
  label: string
  type?: string
  required?: boolean
  autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted">
        {label}
        {required && <span className="ml-1 text-gold">*</span>}
      </label>
      <input id={id} name={id} type={type} required={required} autoComplete={autoComplete} className="input" />
    </div>
  )
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: typeof Mail
  label: string
  value: string
  href?: string
  external?: boolean
}) {
  const content = (
    <>
      <Icon size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold" />
      <span>
        <span className="block text-xs uppercase tracking-[0.18em] text-muted">{label}</span>
        <span className="mt-1 block text-text">{value}</span>
      </span>
    </>
  )
  if (!href) return <li className="flex gap-4">{content}</li>
  return (
    <li>
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="flex gap-4 transition-colors hover:text-gold"
      >
        {content}
      </a>
    </li>
  )
}
