import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LevelUpProvider } from '@/contexts/LevelUpContext'
import { ConfettiWrapper } from '@/components/ConfettiWrapper'
import { VersionFooter } from '@/components/VersionFooter'
import { ToastContainer } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'CoachBase - Faire Mannschaftswahl',
  description: 'Automatisierte und faire Teamaufteilung für Teamsport',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover', // iOS Safe Area support
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E8F5E9' },
    { media: '(prefers-color-scheme: dark)', color: '#003D29' },
  ],
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
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LevelUpProvider>
            {children}
            <ConfettiWrapper />
            <VersionFooter />
            <ToastContainer />
          </LevelUpProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
