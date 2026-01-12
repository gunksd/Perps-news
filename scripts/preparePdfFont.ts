/**
 * PDF中文字体准备工具
 *
 * 使用轻量级的思源黑体子集（常用汉字）
 * 如果需要完整字体支持，请手动下载完整字体文件
 */

import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'

const FONT_DIR = path.join(process.cwd(), 'public', 'fonts')
const FONT_OUTPUT_DIR = path.join(process.cwd(), 'lib', 'fonts')

// 使用GitHub上的开源中文字体子集
const FONT_URLS = {
  // 思源黑体 CN Regular - 轻量级子集（约2MB，包含常用6763个汉字）
  'SourceHanSansCN-Regular': 'https://raw.githubusercontent.com/adobe-fonts/source-han-sans/release/SubsetOTF/CN/SourceHanSansCN-Regular.otf'
}

async function downloadFont(name: string, url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    console.log(`📥 下载字体: ${name}...`)
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败: ${response.statusCode}`))
        return
      }

      const chunks: Buffer[] = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => {
        const buffer = Buffer.concat(chunks)
        console.log(`✅ 下载完成: ${name} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`)
        resolve(buffer)
      })
    }).on('error', reject)
  })
}

function convertToBase64(buffer: Buffer): string {
  return buffer.toString('base64')
}

async function generateFontModule(name: string, base64: string, format: 'truetype' | 'opentype') {
  const moduleContent = `/**
 * ${name} 字体模块
 * 自动生成 - 请勿手动编辑
 * 生成时间: ${new Date().toISOString()}
 */

import { jsPDF } from 'jspdf'

// 字体数据（Base64编码）
const fontData = '${base64}'

/**
 * 注册${name}字体到jsPDF
 */
export function register${name}Font(doc: jsPDF) {
  // 将base64字体添加到jsPDF
  doc.addFileToVFS('${name}.${format === 'truetype' ? 'ttf' : 'otf'}', fontData)
  doc.addFont('${name}.${format === 'truetype' ? 'ttf' : 'otf'}', '${name}', 'normal')
}

/**
 * 设置文档使用${name}字体
 */
export function use${name}Font(doc: jsPDF) {
  register${name}Font(doc)
  doc.setFont('${name}')
}

export default { register${name}Font, use${name}Font }
`

  const outputPath = path.join(FONT_OUTPUT_DIR, `${name}.ts`)
  fs.writeFileSync(outputPath, moduleContent, 'utf-8')
  console.log(`📝 生成字体模块: ${outputPath}`)
}

async function main() {
  console.log('🚀 开始准备PDF中文字体...\n')

  // 创建目录
  if (!fs.existsSync(FONT_DIR)) {
    fs.mkdirSync(FONT_DIR, { recursive: true })
  }
  if (!fs.existsSync(FONT_OUTPUT_DIR)) {
    fs.mkdirSync(FONT_OUTPUT_DIR, { recursive: true })
  }

  try {
    for (const [name, url] of Object.entries(FONT_URLS)) {
      // 下载字体
      const fontBuffer = await downloadFont(name, url)

      // 保存原始字体文件
      const fontPath = path.join(FONT_DIR, `${name}.otf`)
      fs.writeFileSync(fontPath, fontBuffer)
      console.log(`💾 保存字体文件: ${fontPath}`)

      // 转换为Base64
      console.log(`🔄 转换为Base64...`)
      const base64 = convertToBase64(fontBuffer)

      // 生成TypeScript模块
      await generateFontModule(name, base64, 'opentype')

      console.log(`\n`)
    }

    // 生成索引文件
    const indexContent = `/**
 * PDF字体模块索引
 * 自动生成 - 请勿手动编辑
 */

export { registerSourceHanSansCNRegularFont, useSourceHanSansCNRegularFont } from './SourceHanSansCN-Regular'

// 默认导出 - 思源黑体
export { useSourceHanSansCNRegularFont as useDefaultChineseFont } from './SourceHanSansCN-Regular'
`

    const indexPath = path.join(FONT_OUTPUT_DIR, 'index.ts')
    fs.writeFileSync(indexPath, indexContent, 'utf-8')
    console.log(`📝 生成索引文件: ${indexPath}`)

    console.log('\n✅ 字体准备完成！')
    console.log('\n使用方法:')
    console.log('  import { useDefaultChineseFont } from "@/lib/fonts"')
    console.log('  useDefaultChineseFont(doc)')
    console.log('\n⚠️  注意: 字体文件较大（约2MB），首次加载可能需要几秒钟')

  } catch (error) {
    console.error('❌ 错误:', error)
    process.exit(1)
  }
}

// 运行脚本
main()
