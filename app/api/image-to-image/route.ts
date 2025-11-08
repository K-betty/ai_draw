import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
import { writeFile } from 'fs/promises'
import { saveImageToStorage } from '@/lib/storage'

// API配置
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || ''
const STABILITY_API_KEY = process.env.STABILITY_API_KEY || ''
const USE_REPLICATE = process.env.USE_REPLICATE === 'true' || !!REPLICATE_API_TOKEN
const USE_STABILITY = process.env.USE_STABILITY === 'true' || !!STABILITY_API_KEY

// Replicate 图生图模型
const REPLICATE_IMG2IMG_MODEL = process.env.REPLICATE_IMG2IMG_MODEL || 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'

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

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: '提示词不能为空' },
        { status: 400 }
      )
    }

    // 验证文件大小（最大10MB）
    const maxSize = 10 * 1024 * 1024
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: '图片大小不能超过10MB' },
        { status: 400 }
      )
    }

    // 读取图片数据
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 保存上传的图片（可选，用于调试）
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })
    const filename = `${uuidv4()}_${image.name}`
    const filepath = path.join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    let resultImageUrl: string

    // 优先使用 Stability AI API
    if (USE_STABILITY && STABILITY_API_KEY) {
      try {
        resultImageUrl = await generateWithStabilityAI(buffer, prompt, strength)
      } catch (error: any) {
        console.error('Stability AI API error:', error)
        // 如果 Stability AI 失败，尝试 Replicate API 作为备用
        if (USE_REPLICATE && REPLICATE_API_TOKEN) {
          console.log('Stability AI 失败，尝试使用 Replicate API...')
          try {
            resultImageUrl = await generateWithReplicate(buffer, prompt, strength, image.type)
          } catch (replicateError: any) {
            // 如果 Replicate 也失败，返回原始错误
            throw error
          }
        } else {
          throw error
        }
      }
    } 
    // 使用 Replicate API（如果未配置 Stability AI）
    else if (USE_REPLICATE && REPLICATE_API_TOKEN) {
      resultImageUrl = await generateWithReplicate(buffer, prompt, strength, image.type)
    } 
    // 如果没有配置API，返回错误
    else {
      return NextResponse.json(
        { 
          error: '未配置AI生图API。请设置 REPLICATE_API_TOKEN 或 STABILITY_API_KEY 环境变量',
          hint: '查看 README.md 了解如何配置API密钥'
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ imageUrl: resultImageUrl })
  } catch (error: any) {
    console.error('Image-to-image error:', error)
    return NextResponse.json(
      { 
        error: error.message || '生成图片时发生错误',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// 使用 Replicate API 进行图生图
async function generateWithReplicate(
  imageBuffer: Buffer, 
  prompt: string, 
  strength: number,
  imageType: string
): Promise<string> {
  // 将图片转换为 base64
  const base64Image = imageBuffer.toString('base64')
  const dataUri = `data:${imageType};base64,${base64Image}`

  // 创建预测
  const predictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: REPLICATE_IMG2IMG_MODEL,
      input: {
        image: dataUri,
        prompt: prompt,
        strength: strength,
        num_outputs: 1,
        num_inference_steps: 50,
        guidance_scale: 7.5,
      },
    }),
  })

  if (!predictionResponse.ok) {
    const error = await predictionResponse.json().catch(() => ({}))
    throw new Error(error.detail || `Replicate API错误: ${predictionResponse.statusText}`)
  }

  const prediction = await predictionResponse.json()

  // 轮询获取结果
  let result = prediction
  const maxAttempts = 60
  let attempts = 0

  while (result.status === 'starting' || result.status === 'processing') {
    if (attempts >= maxAttempts) {
      throw new Error('生成超时，请稍后重试')
    }

    await new Promise(resolve => setTimeout(resolve, 2000))

    const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      },
    })

    if (!statusResponse.ok) {
      throw new Error('获取生成状态失败')
    }

    result = await statusResponse.json()
    attempts++
  }

  if (result.status === 'failed' || result.status === 'canceled') {
    throw new Error(result.error || '图片生成失败')
  }

  if (!result.output || result.output.length === 0) {
    throw new Error('未收到生成的图片')
  }

  const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output
  return await saveImageFromUrl(imageUrl, 'image-to-image')
}

// 使用 Stability AI 进行图生图
async function generateWithStabilityAI(
  imageBuffer: Buffer,
  prompt: string,
  strength: number
): Promise<string> {
  // 使用 form-data 包处理 multipart/form-data
  const FormData = require('form-data')
  const formData = new FormData()
  
  formData.append('init_image', imageBuffer, {
    filename: 'image.png',
    contentType: 'image/png',
  })
  formData.append('text_prompts[0][text]', prompt)
  formData.append('text_prompts[0][weight]', '1')
  formData.append('image_strength', strength.toString())
  formData.append('cfg_scale', '7')
  formData.append('steps', '50')
  formData.append('samples', '1')

  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${STABILITY_API_KEY}`,
      ...formData.getHeaders(),
    },
    body: formData as any,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Stability AI错误: ${response.statusText}`)
  }

  const data = await response.json()
  
  if (!data.artifacts || data.artifacts.length === 0) {
    throw new Error('未收到生成的图片')
  }

  const imageBase64 = data.artifacts[0].base64
  const imageBufferResult = Buffer.from(imageBase64, 'base64')
  
  return await saveImageToStorage(imageBufferResult, 'image-to-image', 'png')
}

// 从URL下载并保存图片
async function saveImageFromUrl(url: string, prefix: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('下载生成的图片失败')
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  const extension = url.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || 'png'
  
  return await saveImageToStorage(buffer, prefix, extension)
}

