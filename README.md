# AI Draw - 智能生图平台

基于 MidJourney API 的生图网站，支持文生图、图生图和人物换脸功能。

## 功能特性

- 🎨 **文生图**：根据文本描述生成高质量图片
- 🖼️ **图生图**：基于参考图片生成新图片，支持强度调节
- 👤 **人物换脸**：上传图片后替换指定人脸并生成多样化场景图片
- 🎯 **现代化UI**：美观的渐变设计和流畅的用户体验

## 技术栈

- **前端框架**：Next.js 14 (React 18)
- **样式**：Tailwind CSS
- **语言**：TypeScript
- **图片处理**：Sharp
- **人脸检测**：face-api.js / InsightFace（需配置）

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 环境配置

复制 `.env.example` 为 `.env.local` 并配置以下环境变量：

```bash
cp .env.example .env.local
```

#### AI 生图 API 配置（必选其一）

**方案1：使用 Replicate API（推荐）**

1. 注册账号：https://replicate.com
2. 获取 API Token：https://replicate.com/account/api-tokens
3. 配置环境变量：

```env
REPLICATE_API_TOKEN=your_replicate_api_token_here
USE_REPLICATE=true
```

**方案2：使用 Stability AI API**

1. 注册账号：https://platform.stability.ai
2. 获取 API Key：https://platform.stability.ai/account/keys
3. 配置环境变量：

```env
STABILITY_API_KEY=your_stability_api_key_here
USE_STABILITY=true
```

#### 人脸检测和换脸配置（可选）

**使用 face-api.js（本地检测）**

1. 下载模型文件到 `public/models/` 目录：
   - 模型下载地址：https://github.com/justadudewhohacks/face-api.js-models
   - 需要下载：`ssd_mobilenetv1_model-weights_manifest.json`、`face_landmark_68_model-weights_manifest.json` 等
2. 配置环境变量：

```env
USE_FACE_API=true
FACE_API_MODELS_PATH=./public/models
```

**使用第三方换脸API（推荐）**

```env
FACE_SWAP_API_URL=https://api.faceswap.com/v1
FACE_SWAP_API_KEY=your_api_key_here
```

#### 图片存储配置（可选）

默认使用本地存储，生产环境建议使用对象存储：

**AWS S3：**

```env
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name
```

**阿里云OSS：**

```env
STORAGE_TYPE=oss
OSS_ACCESS_KEY_ID=your_access_key
OSS_ACCESS_KEY_SECRET=your_secret_key
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=your_bucket_name
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
```

### 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 🚀 部署

### Vercel 部署（推荐）

项目已配置好 Vercel 部署，支持一键部署：

1. **快速部署**：查看 [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
2. **详细部署指南**：查看 [DEPLOY.md](./DEPLOY.md)

**重要提示**：
- Vercel 文件系统是只读的，必须配置外部存储（S3 或 OSS）
- 在 Vercel 项目设置中配置环境变量
- 推荐使用 AWS S3 或阿里云 OSS 存储生成的图片

### 静态导出部署（国内 CDN）

支持静态导出到国内 CDN（腾讯云、阿里云等），详见 [DEPLOY.md](./DEPLOY.md)

⚠️ **注意**：静态导出不支持 API Routes，需要特殊配置

## 项目结构

```
ai_draw/
├── app/
│   ├── api/              # API路由
│   │   ├── text-to-image/    # 文生图API
│   │   ├── image-to-image/   # 图生图API
│   │   └── face-swap/        # 换脸API
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 主页
├── components/           # React组件
│   ├── TextToImage.tsx   # 文生图组件
│   ├── ImageToImage.tsx  # 图生图组件
│   └── FaceSwap.tsx      # 换脸组件
├── lib/                  # 工具函数
│   ├── utils.ts          # 通用工具
│   └── faceDetection.ts  # 人脸检测工具
├── public/               # 静态资源
│   ├── uploads/          # 上传的图片
│   └── generated/        # 生成的图片
└── package.json
```

## API 集成说明

### 文生图 API

**端点**：`POST /api/text-to-image`

**请求体**：
```json
{
  "prompt": "图片描述",
  "negativePrompt": "负面提示词（可选）"
}
```

**响应**：
```json
{
  "imageUrl": "/generated/text-to-image/image.png"
}
```

**错误响应**：
```json
{
  "error": "错误信息",
  "hint": "提示信息（可选）",
  "code": "ERROR_CODE"
}
```

### 图生图 API

**端点**：`POST /api/image-to-image`

**请求体**：FormData
- `image`: 图片文件（最大10MB）
- `prompt`: 图片描述
- `strength`: 变化强度 (0-1)

**响应**：
```json
{
  "imageUrl": "/generated/image-to-image/image.png"
}
```

### 换脸 API

**端点**：`POST /api/face-swap`

**请求体**：FormData
- `sourceImage`: 源人脸图片（最大10MB）
- `targetImage`: 目标场景图片（最大10MB）
- `scenePrompt`: 场景描述（可选）

**响应**：
```json
{
  "imageUrl": "/generated/face-swap/image.png",
  "sourceFacesCount": 1,
  "targetFacesCount": 1
}
```

**错误响应**：
```json
{
  "error": "错误信息",
  "code": "ERROR_CODE",
  "hint": "提示信息（可选）"
}
```

## 人脸检测和换脸实现

项目已集成人脸检测和换脸功能，支持多种配置方式：

### 方案1：使用 face-api.js（本地检测）

1. 下载模型文件：
   ```bash
   # 创建模型目录
   mkdir -p public/models
   
   # 下载模型文件（需要手动下载）
   # 访问: https://github.com/justadudewhohacks/face-api.js-models
   # 下载以下文件到 public/models/ 目录：
   # - ssd_mobilenetv1_model-weights_manifest.json
   # - ssd_mobilenetv1_model-shard1
   # - face_landmark_68_model-weights_manifest.json
   # - face_landmark_68_model-shard1
   # - face_recognition_model-weights_manifest.json
   # - face_recognition_model-shard1
   ```

2. 配置环境变量：
   ```env
   USE_FACE_API=true
   FACE_API_MODELS_PATH=./public/models
   ```

### 方案2：使用第三方API（推荐）

配置第三方人脸检测和换脸服务：

```env
FACE_DETECTION_API_URL=https://api.facedetection.com/v1
FACE_SWAP_API_URL=https://api.faceswap.com/v1
FACE_SWAP_API_KEY=your_api_key
```

### 方案3：使用 InsightFace（高级）

需要额外配置 Python 环境和模型文件，适合高级用户。

## 功能特性

### ✅ 已实现功能

- ✅ **文生图**：支持 DALL-E 3、Replicate 和 Stability AI
- ✅ **图生图**：支持强度调节和多种模型
- ✅ **AI 提示词优化**：使用 ChatGPT 自动优化提示词
- ✅ **人脸检测**：支持 face-api.js 和第三方API
- ✅ **换脸功能**：支持第三方API和基础本地处理
- ✅ **错误处理**：完善的错误提示和用户反馈
- ✅ **图片存储**：支持本地、AWS S3、阿里云OSS
- ✅ **响应式UI**：现代化的渐变设计和流畅体验
- ✅ **Vercel 部署**：一键部署到 Vercel
- ✅ **静态导出**：支持导出到国内 CDN

### 🔄 支持的API服务

**AI生图服务：**
- ✅ Replicate API（推荐）
- ✅ Stability AI API
- 🔄 可扩展支持其他服务

**人脸检测和换脸：**
- ✅ face-api.js（本地）
- ✅ 第三方API服务
- 🔄 可扩展支持 InsightFace 等

## 注意事项

1. **API密钥安全**：
   - 不要将API密钥提交到版本控制系统
   - 使用 `.env.local` 文件存储密钥（已加入 `.gitignore`）
   - 生产环境使用环境变量或密钥管理服务

2. **文件大小限制**：
   - 默认最大上传10MB
   - 可在 API 路由中调整 `maxSize` 变量

3. **存储空间**：
   - 本地存储：图片保存在 `public/generated/` 目录，注意定期清理
   - 生产环境：强烈建议使用对象存储服务（AWS S3、阿里云OSS等）

4. **性能优化**：
   - 使用对象存储服务减少服务器负载
   - 配置 CDN 加速图片访问
   - 定期清理临时文件

5. **人脸检测模型**：
   - face-api.js 模型文件较大（约10MB），首次使用需要下载
   - 建议使用第三方API服务以获得更好的性能

## 开发计划

- [ ] 集成真实的人脸检测库
- [ ] 添加图片编辑功能
- [ ] 支持批量生成
- [ ] 添加历史记录功能
- [ ] 用户认证和账户系统
- [ ] 图片管理后台

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

