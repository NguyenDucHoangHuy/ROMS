import React, { createContext, useContext, useState, useEffect } from 'react'

export type AppLocale = 'en' | 'vi'

interface ManagerLocaleContextType {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  toggleLocale: () => void
  isEn: boolean
  t: (vi: string, en: string) => string
}

const ManagerLocaleContext = createContext<ManagerLocaleContextType>({
  locale: 'en',
  setLocale: () => {},
  toggleLocale: () => {},
  isEn: true,
  t: (_vi, en) => en,
})

export function ManagerLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => {
    try {
      const saved = localStorage.getItem('roms-manager-locale')
      if (saved === 'vi' || saved === 'en') return saved
    } catch {
      // ignore
    }
    return 'en' // Default to English as per team consensus
  })

  useEffect(() => {
    try {
      localStorage.setItem('roms-manager-locale', locale)
    } catch {
      // ignore
    }
  }, [locale])

  const setLocale = (l: AppLocale) => {
    setLocaleState(l)
  }

  const toggleLocale = () => {
    setLocaleState((prev) => (prev === 'en' ? 'vi' : 'en'))
  }

  const t = (vi: string, en: string) => (locale === 'en' ? en : vi)

  return (
    <ManagerLocaleContext.Provider
      value={{
        locale,
        setLocale,
        toggleLocale,
        isEn: locale === 'en',
        t,
      }}
    >
      {children}
    </ManagerLocaleContext.Provider>
  )
}

export function useManagerLocale() {
  return useContext(ManagerLocaleContext)
}
