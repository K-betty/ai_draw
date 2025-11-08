import { NextRequest, NextResponse } from 'next/server'

// 在模块加载时输出环境变量状态（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  console.log('\n🔧 [模块加载] 环境变量检查:')
  console.log('- process.env.OPENAI_API_KEY 存在:', !!process.env.OPENAI_API_KEY)
  console.log('- process.env.OPENAI_API_KEY 长度:', process.env.OPENAI_API_KEY?.length || 0)
  console.log('- process.env.OPENAI_API_KEY 前10字符:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, Math.min(10, process.env.OPENAI_API_KEY.length)) : 'N/A')
  console.log('- NODE_ENV:', process.env.NODE_ENV)
  console.log('')
}

/**
 * 获取 OpenAI API Key（每次调用时重新读取，确保获取最新值）
 */
function getOpenAIApiKey(): string {
  // 尝试多种方式获取环境变量
  let key = process.env.OPENAI_API_KEY || ''
  
  // 如果为空，尝试从其他可能的来源获取
  if (!key) {
    key = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  }
  
  // 清理 API Key（移除可能的换行符和空格）
  key = key.trim().replace(/\r?\n/g, '').replace(/\s+/g, '')
  
  return key
}

/**
 * 检查是否可以使用 OpenAI API
 */
function canUseOpenAI(): boolean {
  const key = getOpenAIApiKey()
  const isValid = !!key && key.length > 10 // 至少10个字符
  
  // 详细日志
  if (process.env.NODE_ENV === 'development') {
    console.log('[canUseOpenAI] 检查结果:')
    console.log('- key 存在:', !!key)
    console.log('- key 长度:', key.length)
    console.log('- key 前10字符:', key.length > 0 ? key.substring(0, 10) : 'N/A')
    console.log('- 是否有效:', isValid)
    console.log('- process.env.OPENAI_API_KEY 存在:', !!process.env.OPENAI_API_KEY)
    console.log('- process.env.OPENAI_API_KEY 长度:', process.env.OPENAI_API_KEY?.length || 0)
  }
  
  return isValid
}

/**
 * 优化提示词
 * 使用 AI 服务将用户的简单提示词优化为更详细、更准确的提示词
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: '提示词不能为空' },
        { status: 400 }
      )
    }

    // 每次请求时重新检查环境变量
    const apiKey = getOpenAIApiKey()
    const canUse = canUseOpenAI()
    
    // 详细的环境变量诊断
    const envKeys = Object.keys(process.env).filter(key => key.includes('OPENAI'))
    const rawEnvValue = process.env.OPENAI_API_KEY
    
    // 输出到控制台和响应中（用于调试）
    const diagnosticInfo = {
      prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
      rawEnvExists: !!rawEnvValue,
      rawEnvType: typeof rawEnvValue,
      rawEnvLength: rawEnvValue?.length || 0,
      rawEnvFirst10: rawEnvValue ? rawEnvValue.substring(0, Math.min(10, rawEnvValue.length)) : 'N/A',
      openaiEnvKeys: envKeys,
      processedKeyExists: !!apiKey,
      processedKeyLength: apiKey.length,
      processedKeyFirst10: apiKey.length > 0 ? apiKey.substring(0, 10) + '...' : 'N/A',
      canUseOpenAI: canUse,
      nodeEnv: process.env.NODE_ENV,
    }
    
    console.log('='.repeat(50))
    console.log('📝 提示词优化请求')
    console.log('- 提示词:', diagnosticInfo.prompt)
    console.log('')
    console.log('🔍 环境变量诊断:')
    console.log('- process.env.OPENAI_API_KEY 存在:', diagnosticInfo.rawEnvExists)
    console.log('- process.env.OPENAI_API_KEY 类型:', diagnosticInfo.rawEnvType)
    console.log('- process.env.OPENAI_API_KEY 长度:', diagnosticInfo.rawEnvLength)
    console.log('- process.env.OPENAI_API_KEY 前10字符:', diagnosticInfo.rawEnvFirst10)
    console.log('- 所有包含 OPENAI 的环境变量:', diagnosticInfo.openaiEnvKeys.join(', ') || '无')
    console.log('- NODE_ENV:', diagnosticInfo.nodeEnv)
    console.log('')
    console.log('🔑 处理后的 API Key:')
    console.log('- API Key 存在:', diagnosticInfo.processedKeyExists)
    console.log('- API Key 长度:', diagnosticInfo.processedKeyLength)
    console.log('- API Key 前10字符:', diagnosticInfo.processedKeyFirst10)
    console.log('- 可以使用 OpenAI:', diagnosticInfo.canUseOpenAI)
    console.log('='.repeat(50))

    let optimizedPrompt: string
    let usedOpenAI = false
    let errorInfo: any = null

    // 优先使用 OpenAI API
    console.log('🔍 条件检查:')
    console.log('- canUse:', canUse)
    console.log('- apiKey存在:', !!apiKey)
    console.log('- canUse && apiKey:', canUse && apiKey)
    
    if (canUse && apiKey) {
      console.log('🚀 尝试使用 OpenAI API 优化提示词...')
      try {
        console.log('📞 调用 optimizeWithOpenAI 函数...')
        optimizedPrompt = await optimizeWithOpenAI(prompt, apiKey)
        usedOpenAI = true
        console.log('✅ OpenAI API 优化成功')
      } catch (error: any) {
        errorInfo = {
          name: error.name || 'Unknown',
          message: error.message || '未知错误',
          statusCode: error.statusCode,
          retryAfter: error.retryAfter,
          stack: error.stack,
        }
        console.error('❌ OpenAI API 调用失败:')
        console.error('- 错误类型:', errorInfo.name)
        console.error('- 状态码:', errorInfo.statusCode || 'N/A')
        console.error('- 错误消息:', errorInfo.message)
        console.error('- 重试等待时间:', errorInfo.retryAfter ? `${errorInfo.retryAfter} 秒` : 'N/A')
        console.error('- 错误堆栈:', errorInfo.stack)
        
        // 对于 429 错误（请求频率过高），给用户更明确的提示
        if (errorInfo.statusCode === 429) {
          console.log('⚠️ OpenAI API 请求频率过高，回退到本地优化')
          console.log(`💡 提示: 请等待 ${errorInfo.retryAfter || 60} 秒后重试`)
          console.log('💡 速率限制说明:')
          console.log('   - 每分钟最多 600 次请求')
          console.log('   - 每分钟最多 150,000 tokens')
          console.log('   - 如果频繁使用，请控制请求频率或升级账户')
        } else {
          console.log('⚠️ OpenAI API 失败，回退到本地优化')
        }
        
        // 如果 OpenAI 失败，使用本地优化
        optimizedPrompt = optimizeLocally(prompt)
      }
    } else {
      console.log('⚠️ 未配置 OpenAI API，使用本地优化')
      console.log('- canUse:', canUse)
      console.log('- apiKey存在:', !!apiKey)
      console.log('- canUse && apiKey 结果:', canUse && apiKey)
      // 使用本地优化算法
      optimizedPrompt = optimizeLocally(prompt)
    }

    console.log('📤 返回优化结果')
    console.log('- 使用 OpenAI:', usedOpenAI)
    console.log('- 优化后提示词长度:', optimizedPrompt.length)
    console.log('='.repeat(50))

    return NextResponse.json({ 
      originalPrompt: prompt,
      optimizedPrompt: optimizedPrompt,
      usedOpenAI: usedOpenAI,
      // 在开发环境下返回诊断信息和错误信息
      ...(process.env.NODE_ENV === 'development' ? { 
        diagnostic: {
          ...diagnosticInfo,
          conditionCheck: {
            canUse,
            apiKeyExists: !!apiKey,
            conditionResult: canUse && apiKey,
          }
        },
        errorInfo: errorInfo
      } : {})
    })
  } catch (error: any) {
    console.error('❌ Optimize prompt error:', error)
    console.error('- 错误消息:', error.message)
    console.error('- 错误堆栈:', error.stack)
    return NextResponse.json(
      { 
        error: error.message || '优化提示词时发生错误',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * 使用 OpenAI API 优化提示词
 */
async function optimizeWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  if (!apiKey || apiKey.length < 10) {
    console.error('❌ OpenAI API Key 无效或未配置')
    console.error('- Key 长度:', apiKey.length)
    console.error('- Key 前10字符:', apiKey.length > 0 ? apiKey.substring(0, 10) : 'N/A')
    throw new Error('OpenAI API Key 未配置或格式错误')
  }

  console.log('📡 调用 OpenAI API')
  console.log('- 提示词:', prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''))
  console.log('- API Key 前10字符:', apiKey.substring(0, 10) + '...')
  console.log('- API Key 长度:', apiKey.length)

  let response
  try {
    // 优先使用 gpt-3.5-turbo，如果账户不支持则回退到 text-ada-001
    // 根据速率限制信息，某些账户可能只有 ada 模型的访问权限
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    
    const requestBody = {
      model: model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的AI图片生成提示词优化专家。你的任务是将用户提供的简单提示词优化为详细、准确、高质量的提示词，用于Stable Diffusion等AI图片生成模型。优化后的提示词应该包含：主体描述、动作、场景、风格、光线、细节等。使用英文输出，保持简洁但详细。直接输出优化后的提示词，不要添加任何解释。'
        },
        {
          role: 'user',
          content: `请优化以下提示词，使其更适合AI图片生成：${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    }
    
    console.log('📋 使用的模型:', model)

    console.log('📤 发送请求到 OpenAI API...')
    console.log('- URL: https://api.openai.com/v1/chat/completions')
    console.log('- Model:', model)
    console.log('- Request Body:', JSON.stringify(requestBody, null, 2))

    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      // 使用 AbortController 实现超时
      signal: (() => {
        const controller = new AbortController()
        setTimeout(() => controller.abort(), 30000) // 30秒超时
        return controller.signal
      })(),
    })
  } catch (fetchError: any) {
    if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
      throw new Error('OpenAI API 请求超时')
    }
    throw new Error(`无法连接到 OpenAI API: ${fetchError.message || '网络错误'}`)
  }

  if (!response.ok) {
    let errorDetail = ''
    let errorData: any = {}
    // 提取所有可能的请求 ID
    const requestId = response.headers.get('x-request-id') || 
                      response.headers.get('request-id') || 
                      response.headers.get('X-Request-Id') || 
                      'N/A'
    const clientRequestId = response.headers.get('x-client-request-id') || 
                           response.headers.get('X-Client-Request-Id') || 
                           'N/A'
    
    try {
      errorData = await response.json()
      errorDetail = errorData.error?.message || errorData.message || response.statusText
      console.error('OpenAI API 错误响应:')
      console.error('- 状态码:', response.status)
      console.error('- Request ID:', requestId)
      console.error('- Client Request ID:', clientRequestId)
      console.error('- 错误详情:', JSON.stringify(errorData, null, 2))
    } catch (parseError) {
      const text = await response.text().catch(() => '')
      errorDetail = text || response.statusText || '未知错误'
      console.error('OpenAI API 错误响应（非JSON）:')
      console.error('- 状态码:', response.status)
      console.error('- Request ID:', requestId)
      console.error('- Client Request ID:', clientRequestId)
      console.error('- 响应文本:', text)
    }
    
    const requestIds = [requestId, clientRequestId].filter(id => id !== 'N/A').join(', ')
    
    if (response.status === 401) {
      const error = new Error(`OpenAI API Key 无效或已过期。Request IDs: ${requestIds}。错误: ${errorDetail}`)
      ;(error as any).statusCode = 401
      throw error
    } else if (response.status === 429) {
      // 429 错误：请求频率过高，可以重试
      const retryAfter = response.headers.get('retry-after') || '60'
      // 尝试从响应体中获取速率限制信息
      let rateLimitInfo = ''
      try {
        if (errorData.rate_limit) {
          const limit = errorData.rate_limit
          rateLimitInfo = ` (限制: ${limit.max_requests_per_1_minute || 'N/A'} 请求/分钟, ${limit.max_tokens_per_1_minute || 'N/A'} tokens/分钟)`
        }
      } catch (e) {
        // 忽略解析错误
      }
      const error = new Error(`OpenAI API 请求频率过高，请等待 ${retryAfter} 秒后重试${rateLimitInfo}。Request IDs: ${requestIds}`)
      ;(error as any).statusCode = 429
      ;(error as any).retryAfter = parseInt(retryAfter, 10)
      throw error
    } else if (response.status === 400) {
      const error = new Error(`OpenAI API 请求参数错误。Request IDs: ${requestIds}。错误: ${errorDetail}`)
      ;(error as any).statusCode = 400
      throw error
    } else {
      const error = new Error(`OpenAI API错误 (${response.status})。Request IDs: ${requestIds}。错误: ${errorDetail}`)
      ;(error as any).statusCode = response.status
      throw error
    }
  }

  const data = await response.json()
  // 提取所有可能的请求 ID
  const requestId = response.headers.get('x-request-id') || 
                    response.headers.get('request-id') || 
                    response.headers.get('X-Request-Id') || 
                    'N/A'
  const clientRequestId = response.headers.get('x-client-request-id') || 
                          response.headers.get('X-Client-Request-Id') || 
                          'N/A'
  const optimized = data.choices?.[0]?.message?.content?.trim()
  
  if (!optimized) {
    console.error('OpenAI API 响应数据:', data)
    console.error('Request ID:', requestId)
    console.error('Client Request ID:', clientRequestId)
    throw new Error('未收到优化后的提示词')
  }

  console.log('✅ OpenAI API 优化成功')
  console.log('- Request ID:', requestId)
  console.log('- Client Request ID:', clientRequestId)
  console.log('- 优化结果:', optimized.substring(0, 100) + '...')
  return optimized
}

/**
 * 本地优化提示词（不使用外部API）
 * 基于规则和模板进行优化
 */
function optimizeLocally(prompt: string): string {
  const trimmedPrompt = prompt.trim()
  
  // 如果提示词已经很详细（超过50个字符），直接返回
  if (trimmedPrompt.length > 50) {
    return enhancePrompt(trimmedPrompt)
  }

  // 检测语言（简单检测）
  const isChinese = /[\u4e00-\u9fa5]/.test(trimmedPrompt)
  
  // 基础优化
  let optimized = trimmedPrompt

  // 添加质量关键词（如果还没有）
  const qualityKeywords = ['high quality', 'detailed', 'professional', 'masterpiece', 'best quality', 'sharp focus']
  const hasQualityKeywords = qualityKeywords.some(keyword => 
    optimized.toLowerCase().includes(keyword.toLowerCase())
  )
  
  if (!hasQualityKeywords) {
    if (isChinese) {
      optimized = `${optimized}, 高清, 细节丰富, 专业, 精美, 最佳质量`
    } else {
      optimized = `${optimized}, high quality, detailed, professional, masterpiece, best quality, sharp focus`
    }
  }

  // 添加风格和细节提示
  const styleKeywords = ['style', 'art', 'photo', 'drawing', 'painting', '风格', '艺术', '照片', '绘画']
  const hasStyleKeywords = styleKeywords.some(keyword => 
    optimized.toLowerCase().includes(keyword.toLowerCase())
  )
  
  if (!hasStyleKeywords) {
    if (isChinese) {
      optimized = `${optimized}, 精美艺术风格`
    } else {
      optimized = `${optimized}, beautiful art style`
    }
  }

  return optimized
}

/**
 * 增强提示词（添加质量关键词）
 */
function enhancePrompt(prompt: string): string {
  const qualityKeywords = ['high quality', 'detailed', 'professional', '4k', '8k', 'masterpiece', 'best quality']
  const hasQualityKeywords = qualityKeywords.some(keyword => 
    prompt.toLowerCase().includes(keyword.toLowerCase())
  )
  
  if (hasQualityKeywords) {
    return prompt
  }
  
  return `${prompt}, high quality, detailed, professional, masterpiece, best quality, sharp focus`
}

