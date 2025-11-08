/**
 * 人脸检测相关工具函数
 * 支持 face-api.js 和第三方API
 */

import { createCanvas, loadImage } from 'canvas'
import * as faceapi from 'face-api.js'
import * as path from 'path'
import * as fs from 'fs/promises'

export interface FaceDetection {
  x: number
  y: number
  width: number
  height: number
  confidence?: number
  landmarks?: Array<{ x: number; y: number }>
}

// 人脸检测配置
const USE_FACE_API = process.env.USE_FACE_API === 'true'
const FACE_API_MODELS_PATH = process.env.FACE_API_MODELS_PATH || path.join(process.cwd(), 'public', 'models')
const FACE_DETECTION_API_URL = process.env.FACE_DETECTION_API_URL || ''
const FACE_SWAP_API_URL = process.env.FACE_SWAP_API_URL || ''
const FACE_SWAP_API_KEY = process.env.FACE_SWAP_API_KEY || ''

// 是否已加载模型
let modelsLoaded = false

/**
 * 加载 face-api.js 模型
 */
async function loadFaceAPIModels(): Promise<void> {
  if (modelsLoaded || !USE_FACE_API) {
    return
  }

  try {
    // 检查模型文件是否存在
    const modelsDir = FACE_API_MODELS_PATH
    try {
      await fs.access(modelsDir)
    } catch {
      console.warn('face-api.js 模型文件不存在，请下载模型到:', modelsDir)
      console.warn('模型下载地址: https://github.com/justadudewhohacks/face-api.js-models')
      return
    }

    // 加载模型
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsDir)
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsDir)
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsDir)
    
    modelsLoaded = true
    console.log('face-api.js 模型加载成功')
  } catch (error) {
    console.error('加载 face-api.js 模型失败:', error)
    console.warn('将使用API或简化检测')
  }
}

/**
 * 检测图片中的人脸
 */
export async function detectFaces(imageBuffer: Buffer): Promise<FaceDetection[]> {
  // 优先使用 face-api.js
  if (USE_FACE_API) {
    try {
      await loadFaceAPIModels()
      if (modelsLoaded) {
        return await detectFacesWithFaceAPI(imageBuffer)
      }
    } catch (error) {
      console.error('face-api.js 检测失败:', error)
    }
  }

  // 使用第三方API
  if (FACE_DETECTION_API_URL) {
    try {
      return await detectFacesWithAPI(imageBuffer)
    } catch (error) {
      console.error('人脸检测API失败:', error)
    }
  }

  // 如果都不可用，返回空数组（表示未检测到人脸）
  console.warn('未配置人脸检测服务，返回空结果')
  return []
}

/**
 * 使用 face-api.js 检测人脸
 */
async function detectFacesWithFaceAPI(imageBuffer: Buffer): Promise<FaceDetection[]> {
  const img = await loadImage(imageBuffer)
  const canvas = createCanvas(img.width, img.height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)

  const detections = await faceapi
    .detectAllFaces(canvas as any)
    .withFaceLandmarks()
    .withFaceDescriptors()

  return detections.map((detection: any) => {
    const box = detection.detection.box
    return {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      confidence: detection.detection.score,
      landmarks: detection.landmarks?.positions?.map((p: any) => ({ x: p.x, y: p.y })) || [],
    }
  })
}

/**
 * 使用第三方API检测人脸
 */
async function detectFacesWithAPI(imageBuffer: Buffer): Promise<FaceDetection[]> {
  // 在Node.js环境中，需要使用form-data包或手动构建multipart/form-data
  // 这里使用简化的base64方式（如果API支持）
  const base64Image = imageBuffer.toString('base64')
  
  const response = await fetch(`${FACE_DETECTION_API_URL}/detect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: `data:image/png;base64,${base64Image}`,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || '人脸检测API调用失败')
  }

  const data = await response.json()
  return data.faces || []
}

/**
 * 提取人脸特征
 */
export async function extractFaceFeatures(imageBuffer: Buffer): Promise<Float32Array | null> {
  if (USE_FACE_API && modelsLoaded) {
    try {
      const img = await loadImage(imageBuffer)
      const canvas = createCanvas(img.width, img.height)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const detection = await faceapi
        .detectSingleFace(canvas as any)
        .withFaceLandmarks()
        .withFaceDescriptor()

      return detection?.descriptor || null
    } catch (error) {
      console.error('提取人脸特征失败:', error)
    }
  }

  return null
}

/**
 * 执行人脸交换
 * 支持使用第三方API或本地处理
 */
export async function swapFaces(
  sourceImage: Buffer,
  targetImage: Buffer,
  sourceFaceIndex: number = 0,
  targetFaceIndex: number = 0
): Promise<Buffer> {
  // 优先使用第三方换脸API
  if (FACE_SWAP_API_URL) {
    try {
      return await swapFacesWithAPI(sourceImage, targetImage, sourceFaceIndex, targetFaceIndex)
    } catch (error) {
      console.error('换脸API失败:', error)
      // 继续尝试本地处理
    }
  }

  // 本地换脸处理（简化版）
  // 注意：完整的换脸算法需要复杂的深度学习模型
  // 这里提供一个基础实现，实际生产环境建议使用专业服务
  return await swapFacesLocal(sourceImage, targetImage, sourceFaceIndex, targetFaceIndex)
}

/**
 * 使用第三方API换脸
 */
async function swapFacesWithAPI(
  sourceImage: Buffer,
  targetImage: Buffer,
  sourceFaceIndex: number,
  targetFaceIndex: number
): Promise<Buffer> {
  // 将图片转换为base64（如果API支持JSON格式）
  // 如果API需要multipart/form-data，需要使用form-data包
  const sourceBase64 = sourceImage.toString('base64')
  const targetBase64 = targetImage.toString('base64')

  const response = await fetch(`${FACE_SWAP_API_URL}/swap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(FACE_SWAP_API_KEY ? { 'Authorization': `Bearer ${FACE_SWAP_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      source_image: `data:image/png;base64,${sourceBase64}`,
      target_image: `data:image/png;base64,${targetBase64}`,
      source_face_index: sourceFaceIndex,
      target_face_index: targetFaceIndex,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || '换脸API调用失败')
  }

  // 如果返回的是JSON格式的base64图片
  const data = await response.json()
  if (data.image_base64) {
    return Buffer.from(data.image_base64, 'base64')
  }
  
  // 如果返回的是二进制数据
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * 本地换脸处理（简化版）
 * 注意：这是一个基础实现，实际换脸需要复杂的算法
 */
async function swapFacesLocal(
  sourceImage: Buffer,
  targetImage: Buffer,
  sourceFaceIndex: number,
  targetFaceIndex: number
): Promise<Buffer> {
  // 检测两张图片中的人脸
  const sourceFaces = await detectFaces(sourceImage)
  const targetFaces = await detectFaces(targetImage)

  if (sourceFaces.length === 0) {
    throw new Error('源图片中未检测到人脸')
  }

  if (targetFaces.length === 0) {
    throw new Error('目标图片中未检测到人脸')
  }

  if (sourceFaceIndex >= sourceFaces.length || targetFaceIndex >= targetFaces.length) {
    throw new Error('指定的人脸索引超出范围')
  }

  // 这里应该实现实际的换脸算法
  // 可以使用以下方案：
  // 1. 使用 insightface + onnxruntime
  // 2. 使用 roop 等开源项目
  // 3. 调用专业的换脸服务

  // 目前返回目标图片（占位实现）
  // 实际使用时需要实现完整的人脸提取、对齐、融合等步骤
  console.warn('使用简化换脸实现，建议配置 FACE_SWAP_API_URL 使用专业服务')
  
  return targetImage
}

