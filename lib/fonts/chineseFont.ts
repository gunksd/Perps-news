/**
 * PDF中文字体加载器
 *
 * 使用轻量级的Noto Sans SC字体
 * 字体文件从public目录动态加载，避免打包体积过大
 */

import { jsPDF } from 'jspdf'

// 字体文件路径 - 相对于public目录
const FONT_PATH = '/fonts/NotoSansSC-Regular.ttf'

// 缓存字体数据
let fontDataCache: string | null = null
let fontLoadPromise: Promise<string> | null = null

/**
 * 从public目录加载中文字体
 */
async function loadChineseFont(): Promise<string> {
  // 如果已经加载，直接返回缓存
  if (fontDataCache) {
    return fontDataCache
  }

  // 如果正在加载，返回现有的Promise
  if (fontLoadPromise) {
    return fontLoadPromise
  }

  // 开始加载字体
  fontLoadPromise = (async () => {
    try {
      console.log('📥 正在加载中文字体...')
      const response = await fetch(FONT_PATH)

      if (!response.ok) {
        throw new Error(`字体加载失败: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()

      // 转换为base64
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      )

      fontDataCache = base64
      const sizeMB = (arrayBuffer.byteLength / 1024 / 1024).toFixed(2)
      console.log(`✅ 中文字体加载成功 (${sizeMB} MB)`)
      return base64
    } catch (error) {
      console.error('❌ 中文字体加载失败:', error)
      fontLoadPromise = null // 重置以允许重试
      throw error
    }
  })()

  return fontLoadPromise
}

/**
 * 注册中文字体到jsPDF文档
 */
export async function registerChineseFont(doc: jsPDF): Promise<void> {
  try {
    const fontData = await loadChineseFont()

    // 添加字体文件到虚拟文件系统
    doc.addFileToVFS('NotoSansSC-Regular.ttf', fontData)

    // 注册字体
    doc.addFont('NotoSansSC-Regular.ttf', 'NotoSansSC', 'normal')

    console.log('✅ Chinese font registered to PDF')
  } catch (error) {
    console.error('❌ Failed to register Chinese font:', error)
    throw new Error('Chinese font registration failed. PDF may not display Chinese characters correctly.')
  }
}

/**
 * 设置文档使用中文字体
 */
export async function useChineseFont(doc: jsPDF): Promise<void> {
  await registerChineseFont(doc)
  doc.setFont('NotoSansSC')
}

/**
 * 检查字体是否已加载
 */
export function isFontLoaded(): boolean {
  return fontDataCache !== null
}

/**
 * 预加载字体（在用户操作前）
 */
export async function preloadChineseFont(): Promise<void> {
  await loadChineseFont()
}

/**
 * 清除字体缓存（用于测试或重置）
 */
export function clearFontCache(): void {
  fontDataCache = null
  fontLoadPromise = null
}
