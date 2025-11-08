/**
 * 图片存储工具
 * 支持本地存储和对象存储（AWS S3、阿里云OSS等）
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

// 动态导入AWS SDK（可选依赖）
let S3Client: any, PutObjectCommand: any
try {
  const awsSdk = require('@aws-sdk/client-s3')
  S3Client = awsSdk.S3Client
  PutObjectCommand = awsSdk.PutObjectCommand
} catch {
  // AWS SDK未安装时忽略
}

// 存储配置
// 检测是否在 Vercel 或 Netlify 环境
const IS_VERCEL = process.env.VERCEL === '1'
const IS_NETLIFY = process.env.NETLIFY === 'true' || process.env.NETLIFY === '1'
const IS_SERVERLESS = IS_VERCEL || IS_NETLIFY
// 在无服务器环境下，默认使用外部存储（因为文件系统是只读的）
const STORAGE_TYPE = process.env.STORAGE_TYPE || (IS_SERVERLESS ? 's3' : 'local') // 'local' | 's3' | 'oss'
const STORAGE_BASE_URL = process.env.STORAGE_BASE_URL || ''

// AWS S3 配置
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || ''
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || ''
const AWS_REGION = process.env.AWS_REGION || 'us-east-1'
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || ''

// 阿里云OSS配置
const OSS_ACCESS_KEY_ID = process.env.OSS_ACCESS_KEY_ID || ''
const OSS_ACCESS_KEY_SECRET = process.env.OSS_ACCESS_KEY_SECRET || ''
const OSS_REGION = process.env.OSS_REGION || ''
const OSS_BUCKET = process.env.OSS_BUCKET || ''
const OSS_ENDPOINT = process.env.OSS_ENDPOINT || ''

/**
 * 保存图片到存储
 * @param buffer 图片Buffer
 * @param prefix 文件前缀（如 'text-to-image', 'face-swap'）
 * @param extension 文件扩展名（如 'png', 'jpg'）
 * @returns 图片URL
 */
export async function saveImageToStorage(
  buffer: Buffer,
  prefix: string,
  extension: string = 'png'
): Promise<string> {
  switch (STORAGE_TYPE) {
    case 's3':
      return await saveToS3(buffer, prefix, extension)
    case 'oss':
      return await saveToOSS(buffer, prefix, extension)
    case 'local':
    default:
      return await saveToLocal(buffer, prefix, extension)
  }
}

/**
 * 保存到本地存储
 * 注意：Vercel 文件系统是只读的，此方法在 Vercel 环境下会失败
 */
async function saveToLocal(
  buffer: Buffer,
  prefix: string,
  extension: string
): Promise<string> {
  // 在无服务器环境下，尝试使用外部存储
  if (IS_SERVERLESS) {
    const platform = IS_VERCEL ? 'Vercel' : IS_NETLIFY ? 'Netlify' : '无服务器'
    console.warn(`${platform} 环境不支持本地文件存储，尝试使用外部存储...`)
    // 如果配置了 S3，使用 S3
    if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_S3_BUCKET) {
      return await saveToS3(buffer, prefix, extension)
    }
    // 如果配置了 OSS，使用 OSS
    if (OSS_ACCESS_KEY_ID && OSS_ACCESS_KEY_SECRET && OSS_BUCKET) {
      return await saveToOSS(buffer, prefix, extension)
    }
    throw new Error(`${platform} 环境需要配置外部存储（S3 或 OSS）。请设置 STORAGE_TYPE=s3 或 STORAGE_TYPE=oss 并配置相应的环境变量。`)
  }

  const generatedDir = path.join(process.cwd(), 'public', 'generated', prefix)
  try {
    await fs.mkdir(generatedDir, { recursive: true })
  } catch (error: any) {
    // 如果创建目录失败，尝试使用外部存储
    console.warn('创建本地目录失败，尝试使用外部存储:', error.message)
    if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_S3_BUCKET) {
      return await saveToS3(buffer, prefix, extension)
    }
    if (OSS_ACCESS_KEY_ID && OSS_ACCESS_KEY_SECRET && OSS_BUCKET) {
      return await saveToOSS(buffer, prefix, extension)
    }
    throw new Error(`无法创建本地目录且未配置外部存储: ${error.message}`)
  }

  const filename = `${uuidv4()}.${extension}`
  const filepath = path.join(generatedDir, filename)

  await fs.writeFile(filepath, buffer)

  // 返回相对于public目录的URL
  return `/generated/${prefix}/${filename}`
}

/**
 * 保存到AWS S3
 */
async function saveToS3(
  buffer: Buffer,
  prefix: string,
  extension: string
): Promise<string> {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
    console.warn('AWS S3配置不完整，回退到本地存储')
    return await saveToLocal(buffer, prefix, extension)
  }

  try {
    if (!S3Client || !PutObjectCommand) {
      throw new Error('AWS SDK未安装，请运行: npm install @aws-sdk/client-s3')
    }

    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    })

    const filename = `${prefix}/${uuidv4()}.${extension}`
    const contentType = `image/${extension === 'jpg' ? 'jpeg' : extension}`

    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    })

    await s3Client.send(command)

    // 返回S3 URL
    if (STORAGE_BASE_URL) {
      return `${STORAGE_BASE_URL}/${filename}`
    }
    return `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${filename}`
  } catch (error: any) {
    console.error('S3上传失败，回退到本地存储:', error)
    return await saveToLocal(buffer, prefix, extension)
  }
}

/**
 * 保存到阿里云OSS
 */
async function saveToOSS(
  buffer: Buffer,
  prefix: string,
  extension: string
): Promise<string> {
  if (!OSS_ACCESS_KEY_ID || !OSS_ACCESS_KEY_SECRET || !OSS_BUCKET) {
    console.warn('阿里云OSS配置不完整，回退到本地存储')
    return await saveToLocal(buffer, prefix, extension)
  }

  try {
    // 动态导入 ali-oss（可选依赖）
    let OSS: any
    try {
      OSS = require('ali-oss')
    } catch (importError) {
      console.warn('ali-oss 未安装，回退到本地存储')
      console.warn('如需使用 OSS，请运行: npm install ali-oss')
      return await saveToLocal(buffer, prefix, extension)
    }

    const client = new OSS({
      accessKeyId: OSS_ACCESS_KEY_ID,
      accessKeySecret: OSS_ACCESS_KEY_SECRET,
      bucket: OSS_BUCKET,
      region: OSS_REGION,
      endpoint: OSS_ENDPOINT,
    })

    const filename = `${prefix}/${uuidv4()}.${extension}`
    const result = await client.put(filename, buffer, {
      headers: {
        'Content-Type': `image/${extension === 'jpg' ? 'jpeg' : extension}`,
      },
    })

    return result.url
  } catch (error: any) {
    console.error('OSS上传失败，回退到本地存储:', error)
    return await saveToLocal(buffer, prefix, extension)
  }
}

/**
 * 删除图片
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  if (STORAGE_TYPE === 'local') {
    // 从URL提取文件路径
    const filepath = path.join(process.cwd(), 'public', imageUrl.replace(/^\//, ''))
    try {
      await fs.unlink(filepath)
    } catch (error) {
      // 文件不存在时忽略错误
      console.warn('删除文件失败:', filepath)
    }
  }
  // S3和OSS的删除功能可以后续实现
}

