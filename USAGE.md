# 使用说明

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入你的API密钥：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入你的API配置。

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 即可使用。

## 功能使用

### 文生图

1. 切换到"文生图"标签页
2. 在"图片描述"输入框中输入你想要的图片描述
3. （可选）在"负面提示词"中输入不想要的内容
4. 点击"生成图片"按钮
5. 等待生成完成，可以下载结果

### 图生图

1. 切换到"图生图"标签页
2. 点击上传区域，选择一张参考图片
3. 输入图片描述，说明你希望生成的内容
4. 调整"变化强度"滑块（0-100%）
   - 较低值：保持原图更多特征
   - 较高值：生成更多变化
5. 点击"生成图片"按钮
6. 等待生成完成，可以下载结果

### 人物换脸

1. 切换到"人物换脸"标签页
2. 上传"要替换的人脸"图片（源图片）
3. 上传"目标场景图片"（目标图片）
4. （可选）输入场景描述，用于生成多样化场景
5. 点击"开始换脸"按钮
6. 等待处理完成，可以下载结果

## API集成指南

### 使用Stable Diffusion API（推荐替代方案）

由于MidJourney没有公开API，可以使用Stable Diffusion作为替代：

#### 方案1：使用Replicate API

1. 注册 Replicate 账号：https://replicate.com
2. 获取API token
3. 修改 `app/api/text-to-image/route.ts`：

```typescript
const response = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    version: 'your-model-version',
    input: { prompt, negative_prompt: negativePrompt },
  }),
})
```

#### 方案2：使用Stability AI API

1. 注册 Stability AI：https://platform.stability.ai
2. 获取API key
3. 修改API路由使用Stability AI的端点

### 人脸检测和换脸

#### 使用face-api.js

1. 安装依赖：
```bash
npm install face-api.js
```

2. 下载模型文件到 `public/models/` 目录

3. 修改 `lib/faceDetection.ts` 实现真实的人脸检测

#### 使用InsightFace

1. 安装依赖：
```bash
npm install insightface
```

2. 按照InsightFace文档配置模型

#### 使用第三方换脸API

可以集成以下服务：
- FaceSwap API
- DeepFaceLab API
- 其他商业换脸服务

## 常见问题

### Q: 为什么生成的图片是占位符？

A: 如果没有配置真实的API密钥，系统会返回占位图片。请按照上述API集成指南配置真实的API服务。

### Q: 如何提高生成质量？

A: 
1. 使用更详细的提示词
2. 调整生成参数（如steps、guidance等）
3. 使用高质量的参考图片

### Q: 换脸功能不工作？

A: 当前换脸功能是简化实现。要启用完整功能，需要：
1. 集成真实的人脸检测库（face-api.js或InsightFace）
2. 或使用第三方换脸API服务

### Q: 如何部署到生产环境？

A: 
1. 构建项目：`npm run build`
2. 配置生产环境变量
3. 使用Vercel、Netlify或其他平台部署
4. 配置对象存储服务（如AWS S3）保存图片

## 技术支持

如有问题，请查看：
- README.md - 项目文档
- GitHub Issues - 问题反馈

