import type { ChangeEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import type { DealType } from '@/data/types'
import type { Locale } from '@/i18n'
import { LOCATIONS } from '@/data/locations'
import { useCurrency } from '@/lib/currency'
import { formatBound } from '@/lib/format'

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
}

// Budget brackets per deal type, sized for the Da Nang market (most sales fall
// between $100K and $1M). Bounds are USD; labels render in the active display
// currency. Ranges are inclusive of min, exclusive of max.
const BUDGETS: Record<DealType, Bracket[]> = {
  buy: [
    { key: 'any', min: 0, max: Infinity },
    { key: 'u100k', min: 0, max: 100_000 },
    { key: '100to250k', min: 100_000, max: 250_000 },
    { key: '250to500k', min: 250_000, max: 500_000 },
    { key: '500kto1m', min: 500_000, max: 1_000_000 },
    { key: '1mplus', min: 1_000_000, max: Infinity },
  ],
  rent: [
    { key: 'any', min: 0, max: Infinity },
    { key: 'u500', min: 0, max: 500 },
    { key: '500to1000', min: 500, max: 1_000 },
    { key: '1000to2000', min: 1_000, max: 2_000 },
    { key: '2000to3000', min: 2_000, max: 3_000 },
    { key: '3000plus', min: 3_000, max: Infinity },
  ],
}

/** The categories offered on Buy/Rent (Projects live on their own page). */
export const LISTING_CATEGORIES = ['Villa', 'Apartment', 'Land'] as const

/** [min, max] for a budget key; max is exclusive (Infinity = open-ended). */
export function budgetRange(deal: DealType, key: string): [number, number] {
  const b = BUDGETS[deal].find((x) => x.key === key) ?? BUDGETS[deal][0]
  return [b.min, b.max]
}

/** Valid budget keys for a deal type (used to validate URL filter params). */
export function budgetKeys(deal: DealType): string[] {
  return BUDGETS[deal].map((b) => b.key)
}

// 16px on small screens (below md) so iOS Safari does not auto-zoom the page
// when a control gains focus; the tighter 14px only applies on desktop.
const controlCls =
  'w-full rounded-[2px] border border-ink/15 bg-[#faf8f3] px-4 text-base md:text-sm text-ink outline-none transition-colors focus:border-gold-ink'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.72rem] font-medium uppercase tracking-[0.24em] text-ink/70">
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
  const { currency } = useCurrency()
  const set = (patch: Partial<ListingFilter>) => onChange({ ...value, ...patch })
  // Localized label for a category value; unknown values pass through as-is.
  const catLabel = (c: string) => t(`listings.categoryNames.${c.toLowerCase()}`, { defaultValue: c })

  // Budget labels render in the active display currency (bounds stay USD).
  const per = dealType === 'rent' ? ` ${t('listings.perMonth')}` : ''
  const budgetLabel = (b: Bracket) => {
    if (b.key === 'any') return t('search.anyPrice')
    if (b.min === 0) return `${t('search.under', { amount: formatBound(b.max, currency) })}${per}`
    if (b.max === Infinity) return `${formatBound(b.min, currency)}+${per}`
    return `${formatBound(b.min, currency)} – ${formatBound(b.max, currency)}${per}`
  }

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
              {catLabel(c)}
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
              {budgetLabel(b)}
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
