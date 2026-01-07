/**
 * 测试 DeepSeek API 配置
 * 用法：npm run test:api
 */

// 加载环境变量
import { config } from 'dotenv'
import { resolve } from 'path'

// 加载 .env.local 文件
config({ path: resolve(process.cwd(), '.env.local') })

async function testDeepSeekAPI() {
  console.log('🔍 测试 DeepSeek API 配置...\n')

  const apiKey = process.env.OPENAI_API_KEY
  const endpoint = process.env.AI_API_ENDPOINT || 'https://api.deepseek.com/v1/chat/completions'
  const model = process.env.AI_MODEL || 'deepseek-chat'

  // 检查配置
  if (!apiKey) {
    console.error('❌ 错误：未找到 OPENAI_API_KEY 环境变量')
    console.log('   请在 .env.local 中配置 DeepSeek API Key\n')
    process.exit(1)
  }

  console.log('✅ 配置检查通过')
  console.log(`   API 端点: ${endpoint}`)
  console.log(`   模型: ${model}`)
  console.log(`   API Key: ${apiKey.substring(0, 10)}...\n`)

  // 测试请求
  console.log('📡 发送测试请求...\n')

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的金融新闻分析师。'
          },
          {
            role: 'user',
            content: '请用一句话介绍你自己。'
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API 请求失败 (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    const reply = data.choices[0].message.content

    console.log('✅ API 测试成功！\n')
    console.log('📝 AI 回复：')
    console.log(`   ${reply}\n`)
    console.log('🎉 DeepSeek API 配置正确，项目可以正常运行！')

  } catch (error) {
    console.error('❌ API 测试失败：', error)
    console.log('\n💡 解决建议：')
    console.log('   1. 检查 API Key 是否正确')
    console.log('   2. 确认网络连接正常')
    console.log('   3. 验证 API 端点地址')
    console.log('   4. 查看 DeepSeek 控制台是否有使用限额\n')
    process.exit(1)
  }
}

testDeepSeekAPI().catch(console.error)
