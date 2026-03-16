"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [spinning, setSpinning] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <Button variant="ghost" size="sm" className="size-8 p-0 opacity-0" disabled />
  }

  const toggle = () => {
    setSpinning(true)
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
    setTimeout(() => setSpinning(false), 400)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="size-8 p-0 text-muted-foreground hover:text-foreground"
      onClick={toggle}
      aria-label="Alternar tema"
    >
      <span
        style={{
          display: "inline-flex",
          transition: "transform 0.35s ease, opacity 0.25s ease",
          transform: spinning ? "rotate(90deg) scale(0.8)" : "rotate(0deg) scale(1)",
          opacity: spinning ? 0.4 : 1,
        }}
      >
        {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </span>
    </Button>
  )
}
