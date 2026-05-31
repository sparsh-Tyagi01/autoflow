import './globals.css'

import type { Metadata } from 'next'

import { Inter } from 'next/font/google'

import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'AutoFlow AI — Enterprise Agent Platform',
  description:
    'Build, deploy, and manage intelligent AI agents for your business. Conversational AI, RAG pipelines, multi-agent orchestration, and workflow automation.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}