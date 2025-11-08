import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
import { writeFile } from 'fs/promises'
import sharp from 'sharp'
import { detectFaces } from '@/lib/faceDetection'

// 人脸检测和换脸配置
const FACE_SWAP_API_URL = process.env.FACE_SWAP_API_URL || 'https://api.faceswap.com/v1'
const API_KEY = process.env.FACE_SWAP_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const sourceImage = formData.get('sourceImage') as File
    const targetImage = formData.get('targetImage') as File
    const scenePrompt = formData.get('scenePrompt') as string | null

    if (!sourceImage || !targetImage) {
      return NextResponse.json(
        { error: '请上传源图片和目标图片' },
        { status: 400 }
      )
    }

    // 保存上传的图片
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    const sourceBytes = await sourceImage.arrayBuffer()
    const targetBytes = await targetImage.arrayBuffer()
    
    const sourceBuffer = Buffer.from(sourceBytes)
    const targetBuffer = Buffer.from(targetBytes)

    const sourceFilename = `${uuidv4()}_source_${sourceImage.name}`
    const targetFilename = `${uuidv4()}_target_${targetImage.name}`

    const sourcePath = path.join(uploadsDir, sourceFilename)
    const targetPath = path.join(uploadsDir, targetFilename)

    await writeFile(sourcePath, sourceBuffer)
    await writeFile(targetPath, targetBuffer)

    // 检测人脸
    const sourceFaces = await detectFaces(sourceBuffer)
    const targetFaces = await detectFaces(targetBuffer)

    if (sourceFaces.length === 0) {
      return NextResponse.json(
        { error: '源图片中未检测到人脸' },
        { status: 400 }
      )
    }

    if (targetFaces.length === 0) {
      return NextResponse.json(
        { error: '目标图片中未检测到人脸' },
        { status: 400 }
      )
    }

    // 执行换脸
    let resultImageUrl: string
    if (API_KEY) {
      // 调用换脸API
      const swapFormData = new FormData()
      const sourceBlob = new Blob([sourceBuffer], { type: sourceImage.type })
      const targetBlob = new Blob([targetBuffer], { type: targetImage.type })
      swapFormData.append('source', sourceBlob, sourceFilename)
      swapFormData.append('target', targetBlob, targetFilename)
      if (scenePrompt) {
        swapFormData.append('scene_prompt', scenePrompt)
      }

      const headers: HeadersInit = {
        'Authorization': `Bearer ${API_KEY}`,
      }

      const response = await fetch(`${FACE_SWAP_API_URL}/swap`, {
        method: 'POST',
        headers,
        body: swapFormData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return NextResponse.json(
          { error: errorData.error || '换脸API调用失败' },
          { status: response.status }
        )
      }

      const data = await response.json()
      resultImageUrl = data.image_url || data.url || await performLocalFaceSwap(sourceBuffer, targetBuffer)
    } else {
      // 本地换脸处理（简化版，实际应使用专业库如insightface）
      resultImageUrl = await performLocalFaceSwap(sourceBuffer, targetBuffer)
    }

    // 如果提供了场景描述，生成多样化场景
    if (scenePrompt) {
      resultImageUrl = await generateSceneVariations(resultImageUrl, scenePrompt)
    }

    return NextResponse.json({ imageUrl: resultImageUrl })
  } catch (error: any) {
    console.error('Face swap error:', error)
    return NextResponse.json(
      { error: error.message || '换脸时发生错误' },
      { status: 500 }
    )
  }
}

// 检测人脸函数已从 lib/faceDetection 导入

// 本地换脸处理（简化版）
async function performLocalFaceSwap(sourceBuffer: Buffer, targetBuffer: Buffer): Promise<string> {
  const generatedDir = path.join(process.cwd(), 'public', 'generated')
  await fs.mkdir(generatedDir, { recursive: true })

  // 实际换脸逻辑应该：
  // 1. 使用insightface或类似库检测和提取人脸特征
  // 2. 将源人脸特征应用到目标图片
  // 3. 保存结果

  // 目前返回一个占位图片
  const filename = `${uuidv4()}_swapped.png`
  const filepath = path.join(generatedDir, filename)

  // 使用sharp创建一个简单的合成图片（实际应使用换脸算法）
  await sharp(targetBuffer)
    .composite([{
      input: sourceBuffer,
      blend: 'over',
      left: 0,
      top: 0,
    }])
    .toFile(filepath)
    .catch(() => {
      // 如果处理失败，至少保存目标图片
      return writeFile(filepath, targetBuffer)
    })

  return `/generated/${filename}`
}

// 生成场景变化
async function generateSceneVariations(imageUrl: string, scenePrompt: string): Promise<string> {
  // 这里可以调用图生图API，基于换脸结果生成不同场景
  // 目前返回原图片URL
  return imageUrl
}

