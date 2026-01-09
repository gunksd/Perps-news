import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from 'next-themes'
import Header from './components/Header'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'
import '../globals.css'

// Metadata 配置
export const metadata: Metadata = {
  title: 'Perps News',
  description: 'AI 驱动的财经新闻分析平台',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
}

// Viewport 配置
export const viewport = {
  themeColor: '#667eea',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // 启用静态渲染
  setRequestLocale(locale)

  // 验证 locale
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = (await import(`../../messages/${locale}.json`)).default

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
              <Header />
              <main>{children}</main>
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
