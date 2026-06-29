import type { RouteRecord } from 'vite-react-ssg'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Listings from '@/pages/Listings'
import PropertyDetail from '@/pages/PropertyDetail'
import Projects from '@/pages/Projects'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import GuidesIndex from '@/pages/GuidesIndex'
import GuideDetail from '@/pages/GuideDetail'
import RootRedirect from '@/pages/RootRedirect'
import { LOCALES, type Locale } from '@/i18n'
import { getAllSlugs } from '@/data'
import { getGuidesForLocale } from '@/data/guides'

// Build the page set for one locale. Paths are relative to the Layout at '/'.
function localeRoutes(locale: string): RouteRecord[] {
  // Absolute paths (nested under the Layout at '/') keep prerendered URLs clean.
  return [
    { path: `/${locale}`, Component: Home, entry: 'src/pages/Home.tsx' },
    { path: `/${locale}/buy`, element: <Listings dealType="buy" />, entry: 'src/pages/Listings.tsx' },
    { path: `/${locale}/rent`, element: <Listings dealType="rent" />, entry: 'src/pages/Listings.tsx' },
    { path: `/${locale}/projects`, Component: Projects, entry: 'src/pages/Projects.tsx' },
    { path: `/${locale}/about`, Component: About, entry: 'src/pages/About.tsx' },
    { path: `/${locale}/contact`, Component: Contact, entry: 'src/pages/Contact.tsx' },
    {
      path: `/${locale}/property/:slug`,
      Component: PropertyDetail,
      entry: 'src/pages/PropertyDetail.tsx',
      // One prerendered page per published listing per locale.
      getStaticPaths: () => getAllSlugs().map((slug) => `/${locale}/property/${slug}`),
    },
    { path: `/${locale}/guides`, Component: GuidesIndex, entry: 'src/pages/GuidesIndex.tsx' },
    {
      path: `/${locale}/guides/:slug`,
      Component: GuideDetail,
      entry: 'src/pages/GuideDetail.tsx',
      // One prerendered page per guide, but only for locales that guide exists in.
      getStaticPaths: () =>
        getGuidesForLocale(locale as Locale).map((g) => `/${locale}/guides/${g.slug}`),
    },
  ]
}

export const routes: RouteRecord[] = [
  {
    path: '/',
    Component: Layout,
    entry: 'src/components/Layout.tsx',
    children: [
      { index: true, Component: RootRedirect, entry: 'src/pages/RootRedirect.tsx' },
      ...LOCALES.flatMap((l) => localeRoutes(l)),
    ],
  },
]
