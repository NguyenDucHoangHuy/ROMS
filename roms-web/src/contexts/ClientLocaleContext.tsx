import React, { createContext, useContext, useState, useEffect } from 'react'

export type AppLocale = 'en' | 'vi'

interface ClientLocaleContextType {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  toggleLocale: () => void
  isEn: boolean
  t: (vi: string, en: string) => string
}

const ClientLocaleContext = createContext<ClientLocaleContextType>({
  locale: 'en',
  setLocale: () => {},
  toggleLocale: () => {},
  isEn: true,
  t: (_vi, en) => en,
})

export function ClientLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => {
    try {
      const saved = localStorage.getItem('roms-client-locale')
      if (saved === 'vi' || saved === 'en') return saved
    } catch {
      // ignore
    }
    return 'en'
  })

  useEffect(() => {
    try {
      localStorage.setItem('roms-client-locale', locale)
    } catch {
      // ignore
    }
  }, [locale])

  const setLocale = (l: AppLocale) => setLocaleState(l)
  const toggleLocale = () => setLocaleState((prev) => (prev === 'en' ? 'vi' : 'en'))
  const t = (vi: string, en: string) => (locale === 'en' ? en : vi)

  return (
    <ClientLocaleContext.Provider
      value={{ locale, setLocale, toggleLocale, isEn: locale === 'en', t }}
    >
      {children}
    </ClientLocaleContext.Provider>
  )
}

export function useClientLocale() {
  return useContext(ClientLocaleContext)
}
