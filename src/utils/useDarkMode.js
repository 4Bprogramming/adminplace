"use client"
import { useEffect, useState } from 'react'

export default function useDarkMode() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    }
  }, [])

  const toggleDarkMode = () => {
    const isCurrentlyDark = document.documentElement.classList.toggle('dark')
    setIsDark(isCurrentlyDark)
    localStorage.setItem('theme', isCurrentlyDark ? 'dark' : 'light')
  }

  return [isDark, toggleDarkMode]
}