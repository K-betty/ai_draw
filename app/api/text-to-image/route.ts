import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
import { writeFile } from 'fs/promises'
import { saveImageToStorage } from '@/lib/storage'

// API配置 - 支持多种服务
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').trim().replace(/\r?\n/g, '')
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || ''
const STABILITY_API_KEY = process.env.STABILITY_API_KEY || ''
const USE_OPENAI = !!OPENAI_API_KEY && OPENAI_API_KEY.length > 10
const USE_REPLICATE = process.env.USE_REPLICATE === 'true' || !!REPLICATE_API_TOKEN
const USE_STABILITY = process.env.USE_STABILITY === 'true' || !!STABILITY_API_KEY

// 默认使用 DALL-E 3（如果配置了 OpenAI API）
const DALL_E_MODEL = process.env.DALL_E_MODEL || 'dall-e-3'
const DALL_E_QUALITY = process.env.DALL_E_QUALITY || 'hd' // standard 或 hd
const DALL_E_SIZE = process.env.DALL_E_SIZE || '1024x1024' // 1024x1024, 1792x1024, 1024x1792

// Replicate Stable Diffusion 模型版本
const REPLICATE_MODEL = process.env.REPLICATE_MODEL || 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, negativePrompt, size, quality } = body

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: '提示词不能为空' },
        { status: 400 }
      )
    }

    // 优化提示词：如果配置了 OpenAI API，使用 ChatGPT 优化提示词
    let optimizedPrompt = prompt
    if (USE_OPENAI && OPENAI_API_KEY) {
      try {
        console.log('🎨 使用 ChatGPT 优化提示词...')
        optimizedPrompt = await optimizePromptWithChatGPT(prompt)
        console.log('✅ 提示词优化成功:', optimizedPrompt.substring(0, 100) + '...')
      } catch (error: any) {
        console.warn('⚠️ 提示词优化失败，使用原始提示词:', error.message)
        // 如果优化失败，使用原始提示词
        optimizedPrompt = enhancePrompt(prompt)
      }
    } else {
      // 使用本地增强
      optimizedPrompt = enhancePrompt(prompt)
    }

    let imageUrl: string
    const imageSize = size || DALL_E_SIZE
    const imageQuality = quality || DALL_E_QUALITY

    // 优先使用 DALL-E（如果配置了 OpenAI API）
    if (USE_OPENAI && OPENAI_API_KEY) {
      try {
        console.log('🎨 使用 DALL-E 生成图片...')
        imageUrl = await generateWithDALLE(optimizedPrompt, imageSize, imageQuality)
        console.log('✅ DALL-E 生成成功')
      } catch (error: any) {
        console.error('DALL-E API error:', error)
        // 如果 DALL-E 失败，尝试其他 API 作为备用
        if (USE_STABILITY && STABILITY_API_KEY) {
          console.log('DALL-E 失败，尝试使用 Stability AI...')
          try {
            imageUrl = await generateWithStabilityAI(optimizedPrompt, negativePrompt)
          } catch (stabilityError: any) {
            if (USE_REPLICATE && REPLICATE_API_TOKEN) {
              console.log('Stability AI 失败，尝试使用 Replicate API...')
              imageUrl = await generateWithReplicate(optimizedPrompt, negativePrompt)
            } else {
              throw error
            }
          }
        } else if (USE_REPLICATE && REPLICATE_API_TOKEN) {
          console.log('DALL-E 失败，尝试使用 Replicate API...')
          imageUrl = await generateWithReplicate(optimizedPrompt, negativePrompt)
        } else {
          throw error
        }
      }
    }
    // 优先使用 Stability AI API
    else if (USE_STABILITY && STABILITY_API_KEY) {
      try {
        imageUrl = await generateWithStabilityAI(optimizedPrompt, negativePrompt)
      } catch (error: any) {
        console.error('Stability AI API error:', error)
        // 如果 Stability AI 失败，尝试 Replicate API 作为备用
        if (USE_REPLICATE && REPLICATE_API_TOKEN) {
          console.log('Stability AI 失败，尝试使用 Replicate API...')
          try {
            imageUrl = await generateWithReplicate(optimizedPrompt, negativePrompt)
          } catch (replicateError: any) {
            // 如果 Replicate 也失败，返回原始错误
            throw error
          }
        } else {
          throw error
        }
      }
    } 
    // 使用 Replicate API（如果未配置其他 API）
    else if (USE_REPLICATE && REPLICATE_API_TOKEN) {
      imageUrl = await generateWithReplicate(optimizedPrompt, negativePrompt)
    } 
    // 如果没有配置API，返回错误
    else {
      return NextResponse.json(
        { 
          error: '未配置AI生图API。请设置 OPENAI_API_KEY、REPLICATE_API_TOKEN 或 STABILITY_API_KEY 环境变量',
          hint: '查看 README.md 了解如何配置API密钥'
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error('Text-to-image error:', error)
    return NextResponse.json(
      { 
        error: error.message || '生成图片时发生错误',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * 使用 ChatGPT 优化提示词（专门为图片生成优化）
 */
async function optimizePromptWithChatGPT(prompt: string): Promise<string> {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim().replace(/\r?\n/g, '')
  
  if (!apiKey || apiKey.length < 10) {
    throw new Error('OpenAI API Key 未配置')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的AI图片生成提示词优化专家。你的任务是将用户提供的简单提示词优化为详细、准确、高质量的提示词，用于DALL-E、Stable Diffusion等AI图片生成模型。优化后的提示词应该：1. 详细描述主体、动作、场景、风格、光线、细节；2. 使用英文输出；3. 保持简洁但详细；4. 直接输出优化后的提示词，不要添加任何解释。'
        },
        {
          role: 'user',
          content: `请优化以下提示词，使其更适合AI图片生成（特别是DALL-E）：${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
    signal: (() => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 30000)
      return controller.signal
    })(),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`OpenAI API错误: ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  const optimized = data.choices?.[0]?.message?.content?.trim()
  
  if (!optimized) {
    throw new Error('未收到优化后的提示词')
  }

  return optimized
}

// 增强提示词函数（本地优化）
function enhancePrompt(prompt: string): string {
  // 如果提示词已经包含质量关键词，则不添加
  const qualityKeywords = ['high quality', 'detailed', 'professional', '4k', '8k', 'masterpiece', 'best quality']
  const hasQualityKeywords = qualityKeywords.some(keyword => 
    prompt.toLowerCase().includes(keyword.toLowerCase())
  )
  
  if (hasQualityKeywords) {
    return prompt
  }
  
  // 添加质量增强关键词
  return `${prompt}, high quality, detailed, professional, masterpiece, best quality, sharp focus`
}

// 使用 Replicate API 生成图片
async function generateWithReplicate(prompt: string, negativePrompt?: string): Promise<string> {
  // 增强提示词
  const enhancedPrompt = enhancePrompt(prompt)
  
  // 默认负面提示词
  const defaultNegativePrompt = 'blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, out of frame, ugly, extra limbs, bad anatomy, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, bad body, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed, mutated, mutilated, out of frame, ugly'
  const finalNegativePrompt = negativePrompt || defaultNegativePrompt

  // 创建预测
  let predictionResponse
  try {
    predictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: REPLICATE_MODEL,
        input: {
          prompt: enhancedPrompt,
          negative_prompt: finalNegativePrompt,
          num_outputs: 1,
          width: 1024,
          height: 1024,
          num_inference_steps: 60, // 增加步数提高质量
          guidance_scale: 8, // 提高引导强度
        },
      }),
      // 使用 AbortController 实现超时
      signal: (() => {
        const controller = new AbortController()
        setTimeout(() => controller.abort(), 30000) // 30秒超时
        return controller.signal
      })(),
    })
  } catch (fetchError: any) {
    if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
      throw new Error('请求超时，请检查网络连接或稍后重试')
    }
    throw new Error(`无法连接到 Replicate API: ${fetchError.message || '网络错误'}`)
  }

  if (!predictionResponse.ok) {
    let errorDetail = ''
    try {
      const error = await predictionResponse.json()
      errorDetail = error.detail || error.message || predictionResponse.statusText
    } catch {
      errorDetail = predictionResponse.statusText || '未知错误'
    }
    
    if (predictionResponse.status === 401) {
      throw new Error('Replicate API Token 无效，请检查环境变量配置')
    } else if (predictionResponse.status === 402) {
      throw new Error('Replicate 账户余额不足。请访问 https://replicate.com/account/billing#billing 充值后重试')
    } else if (predictionResponse.status === 429) {
      throw new Error('API 请求频率过高，请稍后重试')
    } else {
      throw new Error(`Replicate API错误 (${predictionResponse.status}): ${errorDetail}`)
    }
  }

  const prediction = await predictionResponse.json()

  // 轮询获取结果
  let result = prediction
  const maxAttempts = 60 // 最多等待60次（约5分钟）
  let attempts = 0

  while (result.status === 'starting' || result.status === 'processing') {
    if (attempts >= maxAttempts) {
      throw new Error('生成超时，请稍后重试')
    }

    await new Promise(resolve => setTimeout(resolve, 2000)) // 等待2秒

    let statusResponse
    try {
      statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        },
        // 使用 AbortController 实现超时
        signal: (() => {
          const controller = new AbortController()
          setTimeout(() => controller.abort(), 10000) // 10秒超时
          return controller.signal
        })(),
      })
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
        throw new Error('获取生成状态超时，请稍后重试')
      }
      throw new Error(`无法获取生成状态: ${fetchError.message || '网络错误'}`)
    }

    if (!statusResponse.ok) {
      throw new Error(`获取生成状态失败 (${statusResponse.status})`)
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

  // 下载并保存图片
  const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output
  return await saveImageFromUrl(imageUrl, 'text-to-image')
}

/**
 * 使用 DALL-E 生成图片
 */
async function generateWithDALLE(prompt: string, size: string = DALL_E_SIZE, quality: string = DALL_E_QUALITY): Promise<string> {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim().replace(/\r?\n/g, '')
  
  if (!apiKey || apiKey.length < 10) {
    throw new Error('OpenAI API Key 未配置')
  }

  // DALL-E 3 支持的尺寸
  const validSizes = ['1024x1024', '1792x1024', '1024x1792']
  const imageSize = validSizes.includes(size) ? size : '1024x1024'
  
  // DALL-E 3 支持的质量选项
  const imageQuality = quality === 'hd' ? 'hd' : 'standard'

  console.log('📤 调用 DALL-E API...')
  console.log('- 模型:', DALL_E_MODEL)
  console.log('- 尺寸:', imageSize)
  console.log('- 质量:', imageQuality)
  console.log('- 提示词:', prompt.substring(0, 100) + '...')

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DALL_E_MODEL,
      prompt: prompt,
      n: 1,
      size: imageSize,
      quality: imageQuality,
      response_format: 'url', // 或 'b64_json'
    }),
    signal: (() => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 60000) // 60秒超时
      return controller.signal
    })(),
  })

  if (!response.ok) {
    let errorDetail = ''
    try {
      const errorData = await response.json()
      errorDetail = errorData.error?.message || errorData.message || response.statusText
      console.error('DALL-E API 错误响应:', JSON.stringify(errorData, null, 2))
    } catch (parseError) {
      const text = await response.text().catch(() => '')
      errorDetail = text || response.statusText || '未知错误'
      console.error('DALL-E API 错误响应（非JSON）:', text)
    }
    
    if (response.status === 401) {
      throw new Error(`OpenAI API Key 无效或已过期。错误: ${errorDetail}`)
    } else if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after') || '60'
      throw new Error(`OpenAI API 请求频率过高，请等待 ${retryAfter} 秒后重试。错误: ${errorDetail}`)
    } else if (response.status === 400) {
      throw new Error(`DALL-E API 请求参数错误: ${errorDetail}`)
    } else {
      throw new Error(`DALL-E API错误 (${response.status}): ${errorDetail}`)
    }
  }

  const data = await response.json()
  
  if (!data.data || data.data.length === 0 || !data.data[0].url) {
    throw new Error('未收到生成的图片')
  }

  const imageUrl = data.data[0].url
  console.log('✅ DALL-E 生成成功，图片URL:', imageUrl.substring(0, 50) + '...')
  
  // 下载并保存图片
  return await saveImageFromUrl(imageUrl, 'text-to-image')
}

// 使用 Stability AI 生成图片
async function generateWithStabilityAI(prompt: string, negativePrompt?: string): Promise<string> {
  // 增强提示词：添加质量相关的关键词
  const enhancedPrompt = enhancePrompt(prompt)
  
  // 默认负面提示词：包含常见质量问题
  const defaultNegativePrompt = 'blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, out of frame, ugly, extra limbs, bad anatomy, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, bad body, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed, mutated, mutilated, out of frame, ugly'
  const finalNegativePrompt = negativePrompt || defaultNegativePrompt

  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${STABILITY_API_KEY}`,
    },
    body: JSON.stringify({
      text_prompts: [
        {
          text: enhancedPrompt,
          weight: 1,
        },
        {
          text: finalNegativePrompt,
          weight: -1,
        },
      ],
      cfg_scale: 8, // 提高引导强度，使结果更符合提示词
      height: 1024,
      width: 1024,
      steps: 50, // Stability AI 最大支持 50 步
      samples: 1,
      // style_preset 可选值: enhance, anime, photographic, digital-art, comic-book, fantasy-art, line-art, analog-film, neon-punk, isometric, low-poly, origami, modeling-compound, cinematic, 3d-model, pixel-art, tile-texture
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Stability AI错误: ${response.statusText}`)
  }

  const data = await response.json()
  
  if (!data.artifacts || data.artifacts.length === 0) {
    throw new Error('未收到生成的图片')
  }

  // Stability AI 返回 base64 图片
  const imageBase64 = data.artifacts[0].base64
  const imageBuffer = Buffer.from(imageBase64, 'base64')
  
  return await saveImageToStorage(imageBuffer, 'text-to-image', 'png')
}

// 从URL下载并保存图片
async function saveImageFromUrl(url: string, prefix: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('下载生成的图片失败')
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  // 从URL推断文件扩展名
  const extension = url.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || 'png'
  
  return await saveImageToStorage(buffer, prefix, extension)
}

