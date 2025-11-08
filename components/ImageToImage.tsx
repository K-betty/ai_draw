'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

export default function ImageToImage() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [strength, setStrength] = useState(0.75)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('请选择图片文件')
        return
      }
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleGenerate = async () => {
    if (!image) {
      setError('请先上传图片')
      return
    }

    if (!prompt.trim()) {
      setError('请输入图片描述')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('prompt', prompt)
      formData.append('strength', strength.toString())

      const response = await fetch('/api/image-to-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '生成图片失败')
      }

      setResult(data.imageUrl)
    } catch (err: any) {
      setError(err.message || '生成图片时发生错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">图生图</h2>

      <div className="space-y-6">
        {/* 图片上传 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            上传参考图片 <span className="text-red-500">*</span>
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            {preview ? (
              <div className="relative w-full aspect-square max-w-md mx-auto rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt="预览"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">点击上传图片</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* 提示词输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            图片描述 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述你希望生成的图片内容"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={4}
          />
        </div>

        {/* 强度控制 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            变化强度: {Math.round(strength * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={strength}
            onChange={(e) => setStrength(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>保持原图</span>
            <span>完全变化</span>
          </div>
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {loading ? '生成中...' : '生成图片'}
        </button>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
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
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-gray-600">正在生成图片，请稍候...</p>
          </div>
        )}
      </div>
    </div>
  )
}

