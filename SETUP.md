# 配置指南

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制环境变量示例文件：

```bash
# Windows
copy .env.example .env.local

# Linux/Mac
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入你的API密钥。

### 3. 启动开发服务器

```bash
npm run dev
```

## 详细配置

### AI 生图 API 配置

#### 方案1：Replicate API（推荐）

1. 访问 https://replicate.com 注册账号
2. 在 https://replicate.com/account/api-tokens 获取 API Token
3. 在 `.env.local` 中配置：

```env
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
USE_REPLICATE=true
```

#### 方案2：Stability AI API

1. 访问 https://platform.stability.ai 注册账号
2. 在 https://platform.stability.ai/account/keys 获取 API Key
3. 在 `.env.local` 中配置：

```env
STABILITY_API_KEY=sk-xxxxxxxxxxxxx
USE_STABILITY=true
```

### 人脸检测配置

#### 使用 face-api.js（本地检测）

1. 创建模型目录：
```bash
mkdir -p public/models
```

2. 下载模型文件：
   - 访问：https://github.com/justadudewhohacks/face-api.js-models
   - 下载以下文件到 `public/models/` 目录：
     - `ssd_mobilenetv1_model-weights_manifest.json`
     - `ssd_mobilenetv1_model-shard1`
     - `face_landmark_68_model-weights_manifest.json`
     - `face_landmark_68_model-shard1`
     - `face_recognition_model-weights_manifest.json`
     - `face_recognition_model-shard1`

3. 配置环境变量：
```env
USE_FACE_API=true
FACE_API_MODELS_PATH=./public/models
```

#### 使用第三方API

```env
FACE_DETECTION_API_URL=https://api.facedetection.com/v1
FACE_SWAP_API_URL=https://api.faceswap.com/v1
FACE_SWAP_API_KEY=your_api_key
```

### 图片存储配置

#### 本地存储（默认）

无需额外配置，图片会保存在 `public/generated/` 目录。

#### AWS S3

1. 安装 AWS SDK：
```bash
npm install @aws-sdk/client-s3
```

2. 配置环境变量：
```env
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name
```

#### 阿里云OSS

1. 安装 OSS SDK：
```bash
npm install ali-oss
```

2. 配置环境变量：
```env
STORAGE_TYPE=oss
OSS_ACCESS_KEY_ID=your_access_key
OSS_ACCESS_KEY_SECRET=your_secret_key
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=your_bucket_name
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
```

## 常见问题

### Q: 如何选择使用哪个AI生图服务？

A: 
- **Replicate**：推荐，易于使用，支持多种模型
- **Stability AI**：官方服务，稳定性好

可以同时配置两个，系统会优先使用 Replicate，失败时自动切换到 Stability AI。

### Q: 人脸检测不工作？

A: 
1. 检查是否下载了 face-api.js 模型文件
2. 检查 `USE_FACE_API=true` 是否设置
3. 检查模型文件路径是否正确
4. 建议使用第三方API服务以获得更好性能

### Q: 换脸功能不工作？

A: 
1. 确保配置了 `FACE_SWAP_API_URL`
2. 或者配置了 `USE_FACE_API=true` 并下载了模型
3. 确保上传的图片包含清晰的人脸

### Q: 如何部署到生产环境？

A: 
1. 配置生产环境变量（不要使用 `.env.local`）
2. 使用对象存储服务（S3/OSS）保存图片
3. 配置 CDN 加速图片访问
4. 定期清理临时文件

## 下一步

- 查看 [README.md](./README.md) 了解完整功能
- 查看 [USAGE.md](./USAGE.md) 了解使用方法

