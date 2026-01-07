const createNextIntlPlugin = require('next-intl/plugin')
const withNextIntl = createNextIntlPlugin('./i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  // ISR 配置
  async rewrites() {
    return []
  },
  // 环境变量
  env: {
    NEXT_PUBLIC_APP_NAME: 'Perps News',
    NEXT_PUBLIC_GITHUB_URL: 'https://github.com/gunksd/Perps-news'
  },
  // 图片优化
  images: {
    domains: [],
    unoptimized: true
  }
}

module.exports = withNextIntl(nextConfig)
