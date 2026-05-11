
"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkStored = localStorage.getItem("axon-theme") === "dark" || !localStorage.getItem("axon-theme")
    setIsDark(isDarkStored)
    if (isDarkStored) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    if (newTheme) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("axon-theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("axon-theme", "light")
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      className="h-9 w-9 rounded-xl border border-primary/10 hover:bg-primary/5 transition-all shadow-sm"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-primary" />
      ) : (
        <Moon className="h-5 w-5 text-primary" />
      )}
    </Button>
  )
}
