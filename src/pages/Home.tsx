import { useTranslation } from 'react-i18next'
import { useLocale } from '@/lib/locale'
import Seo from '@/components/Seo'
import Hero from '@/components/Hero'
import SonTra from '@/components/SonTra'
import MeetToan from '@/components/MeetToan'

// Homepage flow per the Da Nang handoff: hero, the Son Tra coastline with its
// featured listing, then Meet Toan. The slate footer (with the closing CTA)
// renders site-wide from the Layout.
export default function Home() {
  const { t } = useTranslation()
  const locale = useLocale()

  return (
    <>
      <Seo title={t('meta.home.title')} description={t('meta.home.description')} />
      <Hero locale={locale} />
      <SonTra locale={locale} />
      <MeetToan locale={locale} />
    </>
  )
}
