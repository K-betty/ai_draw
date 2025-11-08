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

创建 `.env.local` 文件并配置以下环境变量：

```env
# MidJourney API配置（如果有）
MIDJOURNEY_API_URL=https://api.midjourney.com/v1
MIDJOURNEY_API_KEY=your_api_key_here

# 换脸API配置（如果有）
FACE_SWAP_API_URL=https://api.faceswap.com/v1
FACE_SWAP_API_KEY=your_api_key_here
```

**注意**：MidJourney 目前没有官方公开 API。你可以：
1. 使用第三方 MidJourney API 服务
2. 使用 Stable Diffusion API 作为替代
3. 使用其他 AI 生图服务

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
  "imageUrl": "/generated/image.png"
}
```

### 图生图 API

**端点**：`POST /api/image-to-image`

**请求体**：FormData
- `image`: 图片文件
- `prompt`: 图片描述
- `strength`: 变化强度 (0-1)

**响应**：
```json
{
  "imageUrl": "/generated/image.png"
}
```

### 换脸 API

**端点**：`POST /api/face-swap`

**请求体**：FormData
- `sourceImage`: 源人脸图片
- `targetImage`: 目标场景图片
- `scenePrompt`: 场景描述（可选）

**响应**：
```json
{
  "imageUrl": "/generated/swapped_image.png"
}
```

## 人脸检测和换脸实现

目前代码中的人脸检测和换脸功能是占位实现。要启用完整功能，你需要：

### 方案1：使用 face-api.js

```bash
npm install face-api.js
```

然后在 `lib/faceDetection.ts` 中集成：

```typescript
import * as faceapi from 'face-api.js'

// 加载模型
await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
```

### 方案2：使用 InsightFace

```bash
npm install insightface
```

### 方案3：使用第三方API

配置 `FACE_SWAP_API_URL` 和 `FACE_SWAP_API_KEY` 环境变量。

## 替代方案

如果无法使用 MidJourney API，可以考虑以下替代方案：

1. **Stable Diffusion API**
   - Replicate API
   - Stability AI API
   - Hugging Face Inference API

2. **其他AI生图服务**
   - DALL-E API
   - Leonardo.ai API
   - Playground AI API

修改 `app/api/text-to-image/route.ts` 和 `app/api/image-to-image/route.ts` 中的API调用即可。

## 注意事项

1. **API密钥安全**：不要将API密钥提交到版本控制系统
2. **文件大小限制**：默认最大上传10MB，可在 `lib/utils.ts` 中调整
3. **存储空间**：生成的图片会保存在 `public/generated/` 目录，注意定期清理
4. **性能优化**：生产环境建议使用对象存储服务（如AWS S3）保存图片

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

