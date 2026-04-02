'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface DarkModeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined)

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(true)

  const applyTheme = (isDark: boolean) => {
    if (typeof window === 'undefined') return

    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
    document.body.style.colorScheme = isDark ? 'dark' : 'light'
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') !== 'false'
      
      setDarkMode(isDark)
      applyTheme(isDark)
    }
  }, [])

  const toggleDarkMode = () => {
    if (typeof window !== 'undefined') {
      const newDarkMode = !darkMode
      setDarkMode(newDarkMode)
      localStorage.setItem('darkMode', String(newDarkMode))
      applyTheme(newDarkMode)
    }
  }

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}
