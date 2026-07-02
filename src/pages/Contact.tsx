import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MessageCircle, Mail, Phone, MapPin, Check } from 'lucide-react'
import Seo from '@/components/Seo'
import PageHeader from '@/components/PageHeader'
import { useLocale } from '@/lib/locale'
import { localePath } from '@/lib/locale'
import { SITE, zaloLink, whatsappLink } from '@/config/site'

export default function Contact() {
  const { t } = useTranslation()
  const locale = useLocale()
  const meta = t('meta.contact', { returnObjects: true }) as { title: string; description: string }
  // No backend: the form POSTs to FormSubmit, which emails the message straight
  // to Toan's inbox and redirects back here with ?sent=1 for the confirmation.
  const [searchParams] = useSearchParams()
  const sent = searchParams.get('sent') === '1'
  const nextUrl = `${SITE.url}${localePath(locale, 'contact')}?sent=1`

  const promises = [t('contact.promise1'), t('contact.promise2'), t('contact.promise3')]

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
        <div className="container-lux grid gap-14 pb-24 pt-20 lg:grid-cols-[1.2fr_1fr] lg:gap-24 lg:pb-32 lg:pt-28">
          {/* Form */}
          <div>
            {/* Why write: three quiet promises above the form. */}
            <ul className="mb-10 space-y-3">
              {promises.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[15px] font-light text-ink/80">
                  <Check size={16} strokeWidth={2} className="mt-1 shrink-0 text-gold-ink" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>

            {sent ? (
              <div className="rounded-[4px] border border-gold-ink/40 bg-white p-10 text-center">
                <p className="font-display text-xl text-ink">{t('contact.sent')}</p>
                <a
                  href={`mailto:${SITE.email}`}
                  className="mt-4 inline-block text-sm text-gold-ink underline-offset-4 transition-colors hover:underline"
                >
                  {SITE.email}
                </a>
              </div>
            ) : (
              <form action={`https://formsubmit.co/${SITE.email}`} method="POST" className="space-y-6">
                {/* FormSubmit config: subject line, readable table layout, no
                    captcha page, then back to this page for the confirmation. */}
                <input type="hidden" name="_subject" value="Website inquiry, toanhuyhoang" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_next" value={nextUrl} />
                {/* Honeypot: bots fill it, FormSubmit drops those messages. */}
                <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="name" label={t('contact.name')} required />
                  <Field id="email" label={t('contact.email')} type="email" required />
                </div>
                <Field id="phone" label={t('contact.phone')} type="tel" autoComplete="tel" />
                <div>
                  <label htmlFor="message" className="mb-2 block text-xs uppercase tracking-[0.18em] text-ink/70">
                    {t('contact.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="input-light resize-none"
                    placeholder={t('contact.messagePlaceholder')}
                  />
                </div>
                <button type="submit" className="btn btn-slate">
                  {t('contact.send')}
                </button>
                <p className="text-sm font-light text-ink/70">
                  {t('contact.writeDirect')}{' '}
                  <a href={`mailto:${SITE.email}`} className="text-gold-ink underline-offset-4 hover:underline">
                    {SITE.email}
                  </a>
                </p>
              </form>
            )}
          </div>

          {/* Direct details */}
          <aside className="lg:border-l lg:border-ink/12 lg:pl-16">
            <p className="eyebrow-ink">{t('contact.directTitle')}</p>
            <ul className="mt-8 space-y-6">
              <ContactRow icon={MessageCircle} label={t('nav.zalo')} href={zaloLink()} value={SITE.phone} external />
              <ContactRow icon={MessageCircle} label="WhatsApp" href={whatsappLink()} value={SITE.phone} external />
              <ContactRow icon={Mail} label={t('contact.email')} href={`mailto:${SITE.email}`} value={SITE.email} />
              <ContactRow icon={Phone} label={t('contact.phone')} href={`tel:${SITE.phone.replace(/\s/g, '')}`} value={SITE.phone} />
              <ContactRow icon={MapPin} label={t('contact.office')} value={t('contact.officeValue')} />
            </ul>
            <div className="mt-10 flex flex-col gap-3">
              <a
                href={zaloLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn border border-ink/45 font-medium text-ink transition-colors hover:border-gold-ink hover:text-gold-ink"
              >
                <MessageCircle size={16} strokeWidth={1.5} />
                {t('contact.orZalo')}
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn border border-ink/45 font-medium text-ink transition-colors hover:border-gold-ink hover:text-gold-ink"
              >
                <MessageCircle size={16} strokeWidth={1.5} />
                {t('contact.orWhatsApp')}
              </a>
            </div>
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
      <label htmlFor={id} className="mb-2 block text-xs uppercase tracking-[0.18em] text-ink/70">
        {label}
        {required && <span className="ml-1 text-gold-ink">*</span>}
      </label>
      <input id={id} name={id} type={type} required={required} autoComplete={autoComplete} className="input-light" />
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
      <Icon size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold-ink" />
      <span>
        <span className="block text-xs uppercase tracking-[0.18em] text-ink/70">{label}</span>
        <span className="mt-1 block text-ink">{value}</span>
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
        className="flex gap-4 transition-colors hover:text-gold-ink"
      >
        {content}
      </a>
    </li>
  )
}
