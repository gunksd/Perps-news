#!/usr/bin/env node
/**
 * 下载PDF中文字体
 *
 * 从GitHub下载开源的Noto Sans SC字体（Google提供）
 * 这是一个轻量级的中文字体，适合Web使用
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

// 字体URL - 使用Noto Sans SC Regular（约3-4MB）
const FONT_URL = 'https://github.com/notofonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf'

// 如果上面的链接不可用，可以使用这个备用链接：
// const FONT_URL = 'https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf'

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'fonts')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'NotoSansSC-Regular.ttf')

console.log('🚀 开始下载PDF中文字体...\n')

// 创建输出目录
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  console.log(`📁 创建目录: ${OUTPUT_DIR}`)
}

// 检查文件是否已存在
if (fs.existsSync(OUTPUT_FILE)) {
  const stats = fs.statSync(OUTPUT_FILE)
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
  console.log(`✅ 字体文件已存在: ${OUTPUT_FILE} (${sizeMB} MB)`)
  console.log('\n如需重新下载，请先删除该文件')
  process.exit(0)
}

console.log(`📥 下载地址: ${FONT_URL}`)
console.log(`💾 保存位置: ${OUTPUT_FILE}`)
console.log('\n正在下载... (约3-4MB，可能需要几秒钟)\n')

// 下载字体文件
https.get(FONT_URL, (response) => {
  if (response.statusCode === 302 || response.statusCode === 301) {
    // 处理重定向
    console.log('🔄 跟随重定向...')
    https.get(response.headers.location, downloadHandler)
    return
  }

  downloadHandler(response)
}).on('error', (error) => {
  console.error('❌ 下载失败:', error.message)
  console.error('\n请检查网络连接，或手动下载字体文件：')
  console.error('1. 访问: https://fonts.google.com/noto/specimen/Noto+Sans+SC')
  console.error('2. 下载 Noto Sans SC Regular')
  console.error(`3. 保存为: ${OUTPUT_FILE}`)
  process.exit(1)
})

function downloadHandler(response) {
  if (response.statusCode !== 200) {
    console.error(`❌ 下载失败: HTTP ${response.statusCode}`)
    process.exit(1)
  }

  const fileStream = fs.createWriteStream(OUTPUT_FILE)
  let downloadedBytes = 0
  const totalBytes = parseInt(response.headers['content-length'] || '0')

  response.on('data', (chunk) => {
    downloadedBytes += chunk.length
    if (totalBytes > 0) {
      const progress = ((downloadedBytes / totalBytes) * 100).toFixed(1)
      const downloadedMB = (downloadedBytes / 1024 / 1024).toFixed(2)
      const totalMB = (totalBytes / 1024 / 1024).toFixed(2)
      process.stdout.write(`\r下载进度: ${progress}% (${downloadedMB}MB / ${totalMB}MB)`)
    }
  })

  response.pipe(fileStream)

  fileStream.on('finish', () => {
    fileStream.close()
    const stats = fs.statSync(OUTPUT_FILE)
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
    console.log(`\n\n✅ 下载完成！`)
    console.log(`📊 文件大小: ${sizeMB} MB`)
    console.log(`📁 文件位置: ${OUTPUT_FILE}`)
    console.log('\n🎉 PDF中文字体已准备就绪！')
    console.log('\n现在可以在PDF导出中使用中文字符了。')
  })

  fileStream.on('error', (error) => {
    console.error('\n❌ 文件写入失败:', error.message)
    fs.unlink(OUTPUT_FILE, () => {})
    process.exit(1)
  })
}
