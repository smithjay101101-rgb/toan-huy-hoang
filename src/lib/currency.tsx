import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Currency = 'usd' | 'vnd'

const STORAGE_KEY = 'thh-currency'

const CurrencyContext = createContext<{ currency: Currency; setCurrency: (c: Currency) => void }>({
  currency: 'usd',
  setCurrency: () => {},
})

/**
 * Site-wide price currency (USD or VND). Defaults to USD on the server and the
 * first client render (so hydration matches), then restores the visitor's
 * saved choice after mount and persists changes.
 */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('usd')

  useEffect(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (saved === 'vnd') setCurrencyState('vnd')
  }, [])

  const setCurrency = (c: Currency) => {
    setCurrencyState(c)
    try {
      localStorage.setItem(STORAGE_KEY, c)
    } catch {
      // private mode etc.: the choice simply lasts for the visit
    }
  }

  return <CurrencyContext.Provider value={{ currency, setCurrency }}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
