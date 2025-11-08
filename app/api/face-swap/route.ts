import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
import { writeFile } from 'fs/promises'
import sharp from 'sharp'
import { detectFaces, swapFaces } from '@/lib/faceDetection'
import { saveImageToStorage } from '@/lib/storage'

// 人脸检测和换脸配置
const FACE_SWAP_API_URL = process.env.FACE_SWAP_API_URL || ''
const FACE_SWAP_API_KEY = process.env.FACE_SWAP_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const sourceImage = formData.get('sourceImage') as File
    const targetImage = formData.get('targetImage') as File
    const scenePrompt = formData.get('scenePrompt') as string | null

    // 验证输入
    if (!sourceImage || !targetImage) {
      return NextResponse.json(
        { 
          error: '请上传源图片和目标图片',
          code: 'MISSING_IMAGES'
        },
        { status: 400 }
      )
    }

    // 验证文件大小（最大10MB）
    const maxSize = 10 * 1024 * 1024
    if (sourceImage.size > maxSize) {
      return NextResponse.json(
        { 
          error: '源图片大小不能超过10MB',
          code: 'SOURCE_IMAGE_TOO_LARGE'
        },
        { status: 400 }
      )
    }

    if (targetImage.size > maxSize) {
      return NextResponse.json(
        { 
          error: '目标图片大小不能超过10MB',
          code: 'TARGET_IMAGE_TOO_LARGE'
        },
        { status: 400 }
      )
    }

    // 读取图片数据
    const sourceBytes = await sourceImage.arrayBuffer()
    const targetBytes = await targetImage.arrayBuffer()
    
    const sourceBuffer = Buffer.from(sourceBytes)
    const targetBuffer = Buffer.from(targetBytes)

    // 保存上传的图片（用于调试和备份）
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    const sourceFilename = `${uuidv4()}_source_${sourceImage.name}`
    const targetFilename = `${uuidv4()}_target_${targetImage.name}`

    const sourcePath = path.join(uploadsDir, sourceFilename)
    const targetPath = path.join(uploadsDir, targetFilename)

    await writeFile(sourcePath, sourceBuffer).catch(() => {})
    await writeFile(targetPath, targetBuffer).catch(() => {})

    // 检测人脸
    let sourceFaces, targetFaces
    try {
      sourceFaces = await detectFaces(sourceBuffer)
      targetFaces = await detectFaces(targetBuffer)
    } catch (error: any) {
      return NextResponse.json(
        { 
          error: '人脸检测失败: ' + (error.message || '未知错误'),
          code: 'FACE_DETECTION_FAILED',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      )
    }

    if (sourceFaces.length === 0) {
      return NextResponse.json(
        { 
          error: '源图片中未检测到人脸，请确保图片清晰且包含正面人脸',
          code: 'NO_FACE_IN_SOURCE',
          hint: '建议使用清晰、正面的人脸照片'
        },
        { status: 400 }
      )
    }

    if (targetFaces.length === 0) {
      return NextResponse.json(
        { 
          error: '目标图片中未检测到人脸，请确保图片清晰且包含正面人脸',
          code: 'NO_FACE_IN_TARGET',
          hint: '建议使用清晰、正面的人脸照片'
        },
        { status: 400 }
      )
    }

    // 执行换脸
    let resultBuffer: Buffer
    try {
      resultBuffer = await swapFaces(sourceBuffer, targetBuffer, 0, 0)
    } catch (error: any) {
      return NextResponse.json(
        { 
          error: '换脸处理失败: ' + (error.message || '未知错误'),
          code: 'FACE_SWAP_FAILED',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      )
    }

    // 保存结果图片
    let resultImageUrl: string
    try {
      resultImageUrl = await saveImageToStorage(resultBuffer, 'face-swap', 'png')
    } catch (error: any) {
      return NextResponse.json(
        { 
          error: '保存结果图片失败: ' + (error.message || '未知错误'),
          code: 'SAVE_IMAGE_FAILED'
        },
        { status: 500 }
      )
    }

    // 如果提供了场景描述，可以调用图生图API生成多样化场景
    // 这里暂时跳过，因为需要额外的API调用

    return NextResponse.json({ 
      imageUrl: resultImageUrl,
      sourceFacesCount: sourceFaces.length,
      targetFacesCount: targetFaces.length
    })
  } catch (error: any) {
    console.error('Face swap error:', error)
    return NextResponse.json(
      { 
        error: error.message || '换脸时发生未知错误',
        code: 'UNKNOWN_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

