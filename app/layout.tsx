import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LevelUpProvider } from '@/contexts/LevelUpContext'
import { ConfettiWrapper } from '@/components/ConfettiWrapper'

export const metadata: Metadata = {
  title: 'CoachBase - Faire Mannschaftswahl',
  description: 'Automatisierte und faire Teamaufteilung für Teamsport',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LevelUpProvider>
            {children}
            <ConfettiWrapper />
          </LevelUpProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
