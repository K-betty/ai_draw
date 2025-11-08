'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function TextToImage() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [optimizedPrompt, setOptimizedPrompt] = useState<string | null>(null)
  const [usedOpenAI, setUsedOpenAI] = useState<boolean | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState('1024x1024')
  const [imageQuality, setImageQuality] = useState('hd')

  const handleOptimizePrompt = async () => {
    if (!prompt.trim()) {
      setError('请先输入提示词')
      return
    }

    setOptimizing(true)
    setError(null)
    setOptimizedPrompt(null)

    try {
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      }).catch((fetchError) => {
        throw new Error(`网络请求失败: ${fetchError.message || '无法连接到服务器'}`)
      })

      if (!response) {
        throw new Error('服务器无响应，请检查网络连接')
      }

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        const text = await response.text()
        throw new Error(`服务器响应错误: ${text || response.statusText}`)
      }

      if (!response.ok) {
        const errorMessage = data.error || '优化提示词失败'
        throw new Error(errorMessage)
      }

      setOptimizedPrompt(data.optimizedPrompt)
      setUsedOpenAI(data.usedOpenAI || false)
      
      // 在开发环境下显示使用的优化方式
      if (data.usedOpenAI !== undefined) {
        console.log('优化方式:', data.usedOpenAI ? 'OpenAI API' : '本地优化')
      }
    } catch (err: any) {
      const errorMessage = err.message || '优化提示词时发生错误'
      setError(errorMessage)
      console.error('优化提示词错误:', err)
    } finally {
      setOptimizing(false)
    }
  }

  const handleUseOptimized = () => {
    if (optimizedPrompt) {
      setPrompt(optimizedPrompt)
      setOptimizedPrompt(null)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('请输入图片描述')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          negativePrompt: negativePrompt || undefined,
          size: imageSize,
          quality: imageQuality,
        }),
      }).catch((fetchError) => {
        // 捕获网络错误
        throw new Error(`网络请求失败: ${fetchError.message || '无法连接到服务器'}`)
      })

      if (!response) {
        throw new Error('服务器无响应，请检查网络连接')
      }

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        // 如果响应不是JSON，尝试获取文本
        const text = await response.text()
        throw new Error(`服务器响应错误: ${text || response.statusText}`)
      }

      if (!response.ok) {
        const errorMessage = data.error || '生成图片失败'
        const errorHint = data.hint || ''
        const errorCode = data.code || ''
        throw new Error(errorHint ? `${errorMessage}\n提示: ${errorHint}` : errorMessage)
      }

      setResult(data.imageUrl)
    } catch (err: any) {
      let errorMessage = err.message || '生成图片时发生错误'
      
      // 提供更友好的错误提示
      if (errorMessage.includes('fetch failed') || errorMessage.includes('Failed to fetch')) {
        errorMessage = '网络连接失败，请检查：\n1. 网络连接是否正常\n2. 服务器是否正在运行\n3. 防火墙是否阻止了连接'
      } else if (errorMessage.includes('NetworkError') || errorMessage.includes('network')) {
        errorMessage = '网络错误，请稍后重试'
      } else if (errorMessage.includes('余额不足') || errorMessage.includes('insufficient credit')) {
        errorMessage = 'Replicate 账户余额不足\n\n解决方案：\n1. 访问 https://replicate.com/account/billing#billing 充值\n2. 充值后等待几分钟再重试\n3. 或配置 Stability AI API 作为替代方案'
      }
      
      setError(errorMessage)
      console.error('生成图片错误:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">文生图</h2>

      <div className="space-y-6">
        {/* 提示词输入 */}
        <div>
          <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-700 mb-2">
            图片描述 <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-2">（提示：详细描述有助于生成更准确的图片）</span>
          </label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例如：一只可爱的猫咪坐在窗台上，阳光透过窗户洒在它身上，背景是美丽的花园，高清，细节丰富"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none outline-none bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={4}
            disabled={loading}
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              💡 提示词技巧：描述主体、动作、场景、风格、光线、细节等，越详细越好
            </p>
            <button
              onClick={handleOptimizePrompt}
              disabled={optimizing || !prompt.trim() || loading}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              {optimizing ? (
                <>
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  优化中...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI优化
                </>
              )}
            </button>
          </div>
          
          {/* 优化后的提示词显示 */}
          {optimizedPrompt && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-800">优化后的提示词</p>
                    {usedOpenAI !== null && (
                      <p className="text-xs text-green-600 mt-0.5">
                        {usedOpenAI ? '✨ 使用 OpenAI AI 优化' : '🔧 使用本地算法优化'}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOptimizedPrompt(null)
                    setUsedOpenAI(null)
                  }}
                  className="text-green-600 hover:text-green-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-green-700 mb-3 whitespace-pre-wrap">{optimizedPrompt}</p>
              <button
                onClick={handleUseOptimized}
                className="w-full px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                使用优化后的提示词
              </button>
            </div>
          )}
        </div>

        {/* 负面提示词 */}
        <div>
          <label htmlFor="negative-prompt-input" className="block text-sm font-medium text-gray-700 mb-2">
            负面提示词（可选）
          </label>
          <input
            id="negative-prompt-input"
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="例如：模糊、低质量、变形"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={loading}
          />
        </div>

        {/* 图片尺寸和质量选项 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="image-size" className="block text-sm font-medium text-gray-700 mb-2">
              图片尺寸
            </label>
            <select
              id="image-size"
              value={imageSize}
              onChange={(e) => setImageSize(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <option value="1024x1024">1024×1024 (正方形)</option>
              <option value="1792x1024">1792×1024 (横向)</option>
              <option value="1024x1792">1024×1792 (纵向)</option>
            </select>
          </div>
          <div>
            <label htmlFor="image-quality" className="block text-sm font-medium text-gray-700 mb-2">
              图片质量
            </label>
            <select
              id="image-quality"
              value={imageQuality}
              onChange={(e) => setImageQuality(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <option value="standard">标准质量</option>
              <option value="hd">高清质量 (HD)</option>
            </select>
          </div>
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {loading ? '生成中...' : '生成图片'}
        </button>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-medium">错误</p>
                <p className="text-sm mt-1 whitespace-pre-line">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 结果展示 */}
        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">生成结果</h3>
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={result}
                alt="生成的图片"
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-4 flex gap-4">
              <a
                href={result}
                download
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-center font-medium transition-colors"
              >
                下载图片
              </a>
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 relative z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">正在生成图片，请稍候...</p>
          </div>
        )}
      </div>
    </div>
  )
}

