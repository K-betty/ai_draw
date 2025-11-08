import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
import { writeFile } from 'fs/promises'

// MidJourney API配置
const MIDJOURNEY_API_URL = process.env.MIDJOURNEY_API_URL || 'https://api.midjourney.com/v1'
const API_KEY = process.env.MIDJOURNEY_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const prompt = formData.get('prompt') as string
    const strength = parseFloat(formData.get('strength') as string) || 0.75

    if (!image) {
      return NextResponse.json(
        { error: '请上传图片' },
        { status: 400 }
      )
    }

    if (!prompt) {
      return NextResponse.json(
        { error: '提示词不能为空' },
        { status: 400 }
      )
    }

    // 保存上传的图片
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `${uuidv4()}_${image.name}`
    const filepath = path.join(uploadsDir, filename)

    await writeFile(filepath, buffer)
    const imageUrl = `/uploads/${filename}`

    // 调用MidJourney API进行图生图
    // 构建新的FormData用于API调用
    const apiFormData = new FormData()
    const blob = new Blob([buffer], { type: image.type })
    apiFormData.append('image', blob, filename)
    apiFormData.append('prompt', prompt)
    apiFormData.append('strength', strength.toString())

    const headers: HeadersInit = {}
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`
    }

    const response = await fetch(`${MIDJOURNEY_API_URL}/img2img`, {
      method: 'POST',
      headers,
      body: apiFormData,
    })

    if (!response.ok && API_KEY) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error || 'API调用失败' },
        { status: response.status }
      )
    }

    // 如果没有配置API密钥，使用模拟数据
    let resultImageUrl: string
    if (!API_KEY || !response.ok) {
      resultImageUrl = await generatePlaceholderImage(prompt, imageUrl)
    } else {
      const data = await response.json()
      resultImageUrl = data.image_url || data.url || await generatePlaceholderImage(prompt, imageUrl)
    }

    return NextResponse.json({ imageUrl: resultImageUrl })
  } catch (error: any) {
    console.error('Image-to-image error:', error)
    return NextResponse.json(
      { error: error.message || '生成图片时发生错误' },
      { status: 500 }
    )
  }
}

async function generatePlaceholderImage(prompt: string, sourceImageUrl: string): Promise<string> {
  const generatedDir = path.join(process.cwd(), 'public', 'generated')
  await fs.mkdir(generatedDir, { recursive: true })

  const filename = `${uuidv4()}.png`
  // 实际使用时应该调用API生成图片并保存

  return `/generated/${filename}`
}

