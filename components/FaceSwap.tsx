'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

export default function FaceSwap() {
  const [sourceImage, setSourceImage] = useState<File | null>(null)
  const [targetImage, setTargetImage] = useState<File | null>(null)
  const [sourcePreview, setSourcePreview] = useState<string | null>(null)
  const [targetPreview, setTargetPreview] = useState<string | null>(null)
  const [scenePrompt, setScenePrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const sourceInputRef = useRef<HTMLInputElement>(null)
  const targetInputRef = useRef<HTMLInputElement>(null)

  const handleSourceImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('请选择图片文件')
        return
      }
      setSourceImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSourcePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleTargetImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('请选择图片文件')
        return
      }
      setTargetImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setTargetPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleGenerate = async () => {
    if (!sourceImage) {
      setError('请上传要替换的人脸图片')
      return
    }

    if (!targetImage) {
      setError('请上传目标场景图片')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('sourceImage', sourceImage)
      formData.append('targetImage', targetImage)
      if (scenePrompt.trim()) {
        formData.append('scenePrompt', scenePrompt)
      }

      const response = await fetch('/api/face-swap', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || '换脸失败'
        const errorHint = data.hint || ''
        throw new Error(errorHint ? `${errorMessage}\n提示: ${errorHint}` : errorMessage)
      }

      setResult(data.imageUrl)
    } catch (err: any) {
      const errorMessage = err.message || '换脸时发生错误'
      setError(errorMessage)
      console.error('换脸错误:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">人物换脸</h2>

      <div className="space-y-6">
        {/* 双图片上传 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 源图片（要替换的人脸） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              要替换的人脸 <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => sourceInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-pink-500 transition-colors h-64 flex items-center justify-center"
            >
              {sourcePreview ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  <Image
                    src={sourcePreview}
                    alt="源图片"
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
                  <p className="mt-2 text-sm text-gray-600">上传人脸图片</p>
                </div>
              )}
              <input
                ref={sourceInputRef}
                type="file"
                accept="image/*"
                onChange={handleSourceImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* 目标图片（场景图片） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目标场景图片 <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => targetInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-pink-500 transition-colors h-64 flex items-center justify-center"
            >
              {targetPreview ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  <Image
                    src={targetPreview}
                    alt="目标图片"
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
                  <p className="mt-2 text-sm text-gray-600">上传场景图片</p>
                </div>
              )}
              <input
                ref={targetInputRef}
                type="file"
                accept="image/*"
                onChange={handleTargetImageSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* 场景描述（可选） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            场景描述（可选，用于生成多样化场景）
          </label>
          <textarea
            value={scenePrompt}
            onChange={(e) => setScenePrompt(e.target.value)}
            placeholder="例如：在海边、在咖啡厅、在办公室、在花园等"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {loading ? '处理中...' : '开始换脸'}
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">换脸结果</h3>
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={result}
                alt="换脸结果"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
            <p className="text-gray-600">正在处理换脸，请稍候...</p>
          </div>
        )}
      </div>
    </div>
  )
}

