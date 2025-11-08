'use client'

import { useState } from 'react'
import TextToImage from '@/components/TextToImage'
import ImageToImage from '@/components/ImageToImage'
import FaceSwap from '@/components/FaceSwap'

type TabType = 'text' | 'image' | 'face'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('text')

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Draw
          </h1>
          <p className="text-gray-600 text-lg">
            智能生图平台1 - 文生图、图生图、人物换脸
          </p>
        </header>

        {/* 标签页导航 */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-lg p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'text'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              文生图1
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'image'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              图生图2
            </button>
            <button
              onClick={() => setActiveTab('face')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'face'
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              人物换脸3
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'text' && <TextToImage />}
          {activeTab === 'image' && <ImageToImage />}
          {activeTab === 'face' && <FaceSwap />}
        </div>
      </div>
    </main>
  )
}

