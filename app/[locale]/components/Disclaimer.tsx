'use client'

import { useTranslations } from 'next-intl'

export default function Disclaimer() {
  const t = useTranslations()

  return (
    <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
        {t('disclaimer.text')}
      </p>
    </div>
  )
}
