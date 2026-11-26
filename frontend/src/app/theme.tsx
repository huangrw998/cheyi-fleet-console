import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#080b0f' : '#f4f5f7')
}

function initialTheme(): Theme {
  const saved = localStorage.getItem('cheyi-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const dom = document.documentElement.dataset.theme
    return dom === 'dark' ? 'dark' : dom === 'light' ? 'light' : initialTheme()
  })
  const switchTimer = useRef<number | null>(null)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => () => {
    if (switchTimer.current !== null) window.clearTimeout(switchTimer.current)
    const root = document.documentElement
    root.classList.remove('theme-switching')
    root.style.removeProperty('--scrollbar-track')
    root.style.removeProperty('--scrollbar-thumb')
  }, [])

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem('cheyi-theme', next)
    applyTheme(next)
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const commit = () => {
      localStorage.setItem('cheyi-theme', next)
      flushSync(() => setThemeState(next))
      applyTheme(next)
    }

    const root = document.documentElement
    const computed = getComputedStyle(root)
    // 冻结主滚动条颜色，扩散动画结束后再切换。
    root.style.setProperty('--scrollbar-track', computed.getPropertyValue('--accent-soft').trim())
    root.style.setProperty('--scrollbar-thumb', computed.getPropertyValue('--accent').trim())
    root.classList.add('theme-switching')

    const release = () => {
      const next = getComputedStyle(root)
      root.style.setProperty('--scrollbar-track', next.getPropertyValue('--accent-soft').trim())
      root.style.setProperty('--scrollbar-thumb', next.getPropertyValue('--accent').trim())
      root.classList.remove('theme-switching')
    }

    if (!reduce && 'startViewTransition' in document) {
      const transition = document.startViewTransition(commit)
      transition.finished.finally(release)
      return
    }

    commit()
    if (switchTimer.current !== null) window.clearTimeout(switchTimer.current)
    switchTimer.current = window.setTimeout(() => {
      switchTimer.current = null
      release()
    }, 320)
  }, [theme])

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}