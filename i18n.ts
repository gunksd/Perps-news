import {getRequestConfig} from 'next-intl/server'
import {routing} from './i18n/routing'

export default getRequestConfig(async ({requestLocale}) => {
  // 使用 await requestLocale 替代废弃的 locale 参数
  let locale = await requestLocale

  // 确保 locale 有效
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})

