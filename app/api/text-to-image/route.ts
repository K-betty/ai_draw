import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'

// MidJourney API配置（需要替换为实际的API端点）
const MIDJOURNEY_API_URL = process.env.MIDJOURNEY_API_URL || 'https://api.midjourney.com/v1'
const API_KEY = process.env.MIDJOURNEY_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, negativePrompt } = body

    if (!prompt) {
      return NextResponse.json(
        { error: '提示词不能为空' },
        { status: 400 }
      )
    }

    // 调用MidJourney API（这里需要根据实际API文档调整）
    // 如果没有真实API，可以使用模拟响应
    const response = await fetch(`${MIDJOURNEY_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: negativePrompt,
        width: 1024,
        height: 1024,
        steps: 50,
      }),
    })

    if (!response.ok && API_KEY) {
      // 如果API调用失败且配置了API密钥，返回错误
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error || 'API调用失败' },
        { status: response.status }
      )
    }

    // 如果没有配置API密钥或API调用失败，使用模拟数据
    let imageUrl: string
    if (!API_KEY || !response.ok) {
      // 生成一个占位图片URL（实际使用时需要替换为真实API返回的图片）
      imageUrl = await generatePlaceholderImage(prompt)
    } else {
      const data = await response.json()
      imageUrl = data.image_url || data.url || await generatePlaceholderImage(prompt)
    }

    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error('Text-to-image error:', error)
    return NextResponse.json(
      { error: error.message || '生成图片时发生错误' },
      { status: 500 }
    )
  }
}

// 生成占位图片（用于演示，实际应使用真实API）
async function generatePlaceholderImage(prompt: string): Promise<string> {
  // 创建public/generated目录（如果不存在）
  const generatedDir = path.join(process.cwd(), 'public', 'generated')
  await fs.mkdir(generatedDir, { recursive: true })

  // 生成一个占位图片文件名
  const filename = `${uuidv4()}.png`
  const filepath = path.join(generatedDir, filename)

  // 这里应该调用实际的图片生成API
  // 目前返回一个占位URL
  // 实际使用时，应该：
  // 1. 调用MidJourney API获取图片
  // 2. 下载图片到本地
  // 3. 返回本地URL

  return `/generated/${filename}`
}

