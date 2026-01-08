import {defineRouting} from 'next-intl/routing'
import {createNavigation} from 'next-intl/navigation'

export const routing = defineRouting({
  // 所有支持的语言
  locales: ['zh', 'en'],

  // 默认语言
  defaultLocale: 'zh'
})

// 轻量级的导航 API，封装了 Next.js 导航 API
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing)
