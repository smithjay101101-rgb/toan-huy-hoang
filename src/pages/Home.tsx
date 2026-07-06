import { Head } from 'vite-react-ssg'
import { useTranslation } from 'react-i18next'
import { useLocale } from '@/lib/locale'
import { mediaSrcSet } from '@/lib/media'
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
      <Head>
        {/* Preload the hero poster (the LCP element) so the fetch starts before
            the body is parsed. AVIF only — supported by all modern browsers.
            imagesrcset/imagesizes make the preload pick the same viewport-sized
            candidate the <picture> will request (no double download). */}
        <link
          rel="preload"
          as="image"
          href="/media/hero-city.avif"
          type="image/avif"
          {...{
            fetchpriority: 'high',
            imagesrcset: mediaSrcSet('/media/hero-city', 'avif'),
            imagesizes: '100vw',
          }}
        />
      </Head>
      <Hero locale={locale} />
      <SonTra locale={locale} />
      <MeetToan locale={locale} />
    </>
  )
}
