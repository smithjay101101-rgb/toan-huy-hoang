import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Minus, ShieldCheck, MapPinned, EyeOff } from 'lucide-react'
import Seo from '@/components/Seo'
import JsonLd from '@/components/JsonLd'
import PageHeader from '@/components/PageHeader'
import Reveal from '@/components/Reveal'
import { faqSchema } from '@/lib/schema'

const VALUE_ICONS = { trust: ShieldCheck, local: MapPinned, discretion: EyeOff }

export default function About() {
  const { t } = useTranslation()
  const meta = t('meta.about', { returnObjects: true }) as { title: string; description: string }
  const values = t('about.values', { returnObjects: true }) as Record<
    'trust' | 'local' | 'discretion',
    { title: string; body: string }
  >
  const faq = t('about.faq', { returnObjects: true }) as { q: string; a: string }[]
  const [open, setOpen] = useState<number | null>(0)

  return (
    <>
      <Seo title={meta.title} description={meta.description} />
      <JsonLd data={faqSchema(faq)} />

      <PageHeader eyebrow={t('about.eyebrow')} title={t('about.headline')} />

      <section className="section">
        <div className="container-lux grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <img
              src="/placeholders/founder.svg"
              alt="Toan Huy Hoang"
              width={1200}
              height={1500}
              loading="lazy"
              className="w-full rounded-[4px] border border-line object-cover"
              style={{ aspectRatio: '4 / 5' }}
            />
          </Reveal>
          <Reveal stagger className="flex flex-col justify-center">
            <p className="max-w-prose text-lg leading-relaxed text-text/85">{t('about.body1')}</p>
            <p className="mt-6 max-w-prose text-lg leading-relaxed text-text/85">{t('about.body2')}</p>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-line bg-bg-2">
        <div className="container-lux py-20 lg:py-28">
          <p className="eyebrow">{t('about.valuesTitle')}</p>
          <Reveal stagger className="mt-12 grid gap-10 md:grid-cols-3">
            {(['trust', 'local', 'discretion'] as const).map((key) => {
              const Icon = VALUE_ICONS[key]
              return (
                <div key={key}>
                  <Icon size={28} strokeWidth={1.25} className="text-gold" />
                  <h3 className="mt-5 font-display text-xl text-text">{values[key].title}</h3>
                  <p className="mt-3 text-muted">{values[key].body}</p>
                </div>
              )
            })}
          </Reveal>
        </div>
      </section>

      {/* FAQ for answer engines */}
      <section className="section">
        <div className="container-lux max-w-3xl">
          <p className="eyebrow">{t('about.faqTitle')}</p>
          <div className="mt-10 divide-y divide-[rgba(199,169,107,0.22)] border-y border-line">
            {faq.map((item, i) => {
              const isOpen = open === i
              return (
                <div key={i}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display text-lg text-text">{item.q}</span>
                    {isOpen ? (
                      <Minus size={20} strokeWidth={1.5} className="shrink-0 text-gold" />
                    ) : (
                      <Plus size={20} strokeWidth={1.5} className="shrink-0 text-gold" />
                    )}
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-prose pb-6 text-muted">{item.a}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
