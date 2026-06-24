import type { RouteRecord } from 'vite-react-ssg'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Listings from '@/pages/Listings'
import PropertyDetail from '@/pages/PropertyDetail'
import Projects from '@/pages/Projects'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import RootRedirect from '@/pages/RootRedirect'
import { LOCALES } from '@/i18n'
import { getAllSlugs } from '@/data'

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
