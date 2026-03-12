'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const lightStyles = {
  '--normal-bg': 'var(--popover)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border)',
  '--success-bg': 'oklch(0.95 0.05 150)',
  '--success-text': 'oklch(0.3 0.1 150)',
  '--success-border': 'oklch(0.8 0.1 150)',
  '--error-bg': 'oklch(0.95 0.05 25)',
  '--error-text': 'oklch(0.35 0.15 25)',
  '--error-border': 'oklch(0.75 0.15 25)',
  '--warning-bg': 'oklch(0.96 0.06 85)',
  '--warning-text': 'oklch(0.35 0.1 85)',
  '--warning-border': 'oklch(0.8 0.12 85)',
  '--info-bg': 'oklch(0.95 0.04 240)',
  '--info-text': 'oklch(0.35 0.12 240)',
  '--info-border': 'oklch(0.8 0.1 240)',
} as React.CSSProperties

const darkStyles = {
  '--normal-bg': 'var(--popover)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border)',
  '--success-bg': 'oklch(0.25 0.04 150)',
  '--success-text': 'oklch(0.85 0.08 150)',
  '--success-border': 'oklch(0.4 0.08 150)',
  '--error-bg': 'oklch(0.25 0.04 25)',
  '--error-text': 'oklch(0.85 0.1 25)',
  '--error-border': 'oklch(0.4 0.1 25)',
  '--warning-bg': 'oklch(0.28 0.05 85)',
  '--warning-text': 'oklch(0.88 0.08 85)',
  '--warning-border': 'oklch(0.45 0.08 85)',
  '--info-bg': 'oklch(0.25 0.03 240)',
  '--info-text': 'oklch(0.85 0.08 240)',
  '--info-border': 'oklch(0.4 0.08 240)',
} as React.CSSProperties

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="bottom-right"
      style={isDark ? darkStyles : lightStyles}
      {...props}
    />
  )
}

export { Toaster }
