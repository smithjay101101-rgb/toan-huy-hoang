import type { ChangeEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import type { DealType } from '@/data/types'
import type { Locale } from '@/i18n'
import { LOCATIONS } from '@/data/locations'

export interface ListingFilter {
  category: string
  district: string
  budget: string
  bedrooms: string
  code: string
}

export const EMPTY_FILTER: ListingFilter = {
  category: 'all',
  district: 'all',
  budget: 'any',
  bedrooms: 'any',
  code: '',
}

interface Bracket {
  key: string
  min: number
  max: number
  en: string
  vi: string
  ru: string
}

// Budget brackets per deal type. Ranges are inclusive of min, exclusive of max.
const BUDGETS: Record<DealType, Bracket[]> = {
  buy: [
    { key: 'any', min: 0, max: Infinity, en: 'Any price', vi: 'Tùy giá', ru: 'Любая цена' },
    { key: 'u1m', min: 0, max: 1_000_000, en: 'Under $1M', vi: 'Dưới $1M', ru: 'До $1M' },
    { key: '1to3m', min: 1_000_000, max: 3_000_000, en: '$1M – $3M', vi: '$1M – $3M', ru: '$1M – $3M' },
    { key: '3to5m', min: 3_000_000, max: 5_000_000, en: '$3M – $5M', vi: '$3M – $5M', ru: '$3M – $5M' },
    { key: '5mplus', min: 5_000_000, max: Infinity, en: '$5M+', vi: '$5M+', ru: '$5M+' },
  ],
  rent: [
    { key: 'any', min: 0, max: Infinity, en: 'Any price', vi: 'Tùy giá', ru: 'Любая цена' },
    { key: 'u2500', min: 0, max: 2_500, en: 'Under $2,500 / mo', vi: 'Dưới $2,500 / tháng', ru: 'До $2,500 / мес' },
    { key: '2500to5000', min: 2_500, max: 5_000, en: '$2,500 – $5,000 / mo', vi: '$2,500 – $5,000 / tháng', ru: '$2,500 – $5,000 / мес' },
    { key: '5000plus', min: 5_000, max: Infinity, en: '$5,000+ / mo', vi: '$5,000+ / tháng', ru: '$5,000+ / мес' },
  ],
}

/** [min, max] for a budget key; max is exclusive (Infinity = open-ended). */
export function budgetRange(deal: DealType, key: string): [number, number] {
  const b = BUDGETS[deal].find((x) => x.key === key) ?? BUDGETS[deal][0]
  return [b.min, b.max]
}

const controlCls =
  'w-full rounded-[2px] border border-ink/15 bg-[#faf8f3] px-4 text-sm text-ink outline-none transition-colors focus:border-gold-ink'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.66rem] font-medium uppercase tracking-[0.24em] text-ink/60">
        {label}
      </span>
      {children}
    </label>
  )
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
  children: ReactNode
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`${controlCls} appearance-none py-3 pr-10`}
          style={{ colorScheme: 'light', minHeight: 46 }}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/40"
          aria-hidden="true"
        />
      </div>
    </Field>
  )
}

interface Props {
  dealType: DealType
  locale: Locale
  categories: string[]
  value: ListingFilter
  onChange: (next: ListingFilter) => void
  onSearch: () => void
}

export default function ListingSearch({ dealType, locale, categories, value, onChange, onSearch }: Props) {
  const { t } = useTranslation()
  const set = (patch: Partial<ListingFilter>) => onChange({ ...value, ...patch })

  return (
    <div
      className="rounded-[4px] border border-ink/10 bg-white p-5 shadow-[0_24px_60px_rgba(28,38,48,0.18)] lg:p-7"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSearch()
        }}
        className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <Select label={t('search.type')} value={value.category} onChange={(e) => set({ category: e.target.value })}>
          <option value="all">{t('search.anyType')}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <Select label={t('search.location')} value={value.district} onChange={(e) => set({ district: e.target.value })}>
          <option value="all">{t('search.anyLocation')}</option>
          {LOCATIONS.map((l) => (
            <option key={l.value} value={l.value}>
              {l[locale]}
            </option>
          ))}
        </Select>

        <Select label={t('search.budget')} value={value.budget} onChange={(e) => set({ budget: e.target.value })}>
          {BUDGETS[dealType].map((b) => (
            <option key={b.key} value={b.key}>
              {b[locale]}
            </option>
          ))}
        </Select>

        <Select label={t('search.bedrooms')} value={value.bedrooms} onChange={(e) => set({ bedrooms: e.target.value })}>
          <option value="any">{t('search.anyBeds')}</option>
          {['1', '2', '3', '4', '5'].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </Select>

        <Field label={t('search.code')}>
          <input
            value={value.code}
            onChange={(e) => set({ code: e.target.value })}
            placeholder={t('search.codePlaceholder')}
            className={`${controlCls} py-3 placeholder:text-ink/35`}
            style={{ minHeight: 46 }}
            inputMode="text"
          />
        </Field>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-[2px] bg-ink px-6 text-[0.8rem] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-gold-ink"
            style={{ minHeight: 46 }}
          >
            {t('search.search')}
          </button>
        </div>
      </form>
    </div>
  )
}
