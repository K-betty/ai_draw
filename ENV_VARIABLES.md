# 环境变量完整配置指南

本文档提供所有环境变量的完整列表和说明。

## 📋 环境变量分类

### 🔴 必需的环境变量

这些变量是应用运行所必需的：

#### 1. OpenAI API（用于 DALL-E 和提示词优化）

```env
OPENAI_API_KEY=sk-proj-你的密钥
```

**说明**：
- 用于 DALL-E 3 图片生成
- 用于 ChatGPT 提示词优化
- 获取地址：https://platform.openai.com/api-keys

**示例**：
```env
OPENAI_API_KEY=sk-proj-你的实际密钥（请替换为真实密钥）
```

#### 2. 图片存储配置（Vercel/Netlify 必需）

**选项 A：使用 AWS S3**

```env
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=你的AWS访问密钥ID
AWS_SECRET_ACCESS_KEY=你的AWS密钥
AWS_REGION=us-east-1
AWS_S3_BUCKET=你的bucket名称
STORAGE_BASE_URL=https://your-cdn-domain.com
```

**选项 B：使用阿里云 OSS**

```env
STORAGE_TYPE=oss
OSS_ACCESS_KEY_ID=你的OSS访问密钥ID
OSS_ACCESS_KEY_SECRET=你的OSS密钥
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=你的bucket名称
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
```

**选项 C：本地存储（仅开发环境）**

```env
STORAGE_TYPE=local
```

⚠️ **注意**：Vercel 和 Netlify 不支持本地存储，必须使用 S3 或 OSS。

### 🟡 可选的环境变量（备用 API）

#### 3. Replicate API（备用生图服务）

```env
REPLICATE_API_TOKEN=r8_你的token
USE_REPLICATE=true
```

**说明**：
- 当 DALL-E 失败时作为备用
- 获取地址：https://replicate.com/account/api-tokens

**示例**：
```env
REPLICATE_API_TOKEN=r8_你的实际token（请替换为真实token）
```

#### 4. Stability AI API（备用生图服务）

```env
STABILITY_API_KEY=sk-你的密钥
USE_STABILITY=true
```

**说明**：
- 当 DALL-E 失败时作为备用
- 获取地址：https://platform.stability.ai/account/keys

**示例**：
```env
STABILITY_API_KEY=sk-你的实际密钥（请替换为真实密钥）
```

### 🟢 可选的环境变量（功能配置）

#### 5. DALL-E 配置（可选）

```env
DALL_E_MODEL=dall-e-3
DALL_E_QUALITY=hd
DALL_E_SIZE=1024x1024
```

**说明**：
- `DALL_E_MODEL`: 模型版本（`dall-e-3` 或 `dall-e-2`）
- `DALL_E_QUALITY`: 图片质量（`standard` 或 `hd`）
- `DALL_E_SIZE`: 图片尺寸（`1024x1024`, `1792x1024`, `1024x1792`）

**默认值**：
```env
DALL_E_MODEL=dall-e-3
DALL_E_QUALITY=hd
DALL_E_SIZE=1024x1024
```

#### 6. Replicate 模型配置（可选）

```env
REPLICATE_MODEL=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b
REPLICATE_IMG2IMG_MODEL=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b
```

#### 7. 人脸检测和换脸配置（可选）

```env
# 使用 face-api.js（本地检测）
USE_FACE_API=true
FACE_API_MODELS_PATH=./public/models

# 或使用第三方 API
FACE_DETECTION_API_URL=https://api.facedetection.com/v1
FACE_SWAP_API_URL=https://api.faceswap.com/v1
FACE_SWAP_API_KEY=你的API密钥
```

#### 8. OpenAI 模型配置（可选）

```env
OPENAI_MODEL=gpt-3.5-turbo
```

## 📝 完整环境变量模板

### 最小配置（仅必需变量）

```env
# OpenAI API（必需）
OPENAI_API_KEY=sk-proj-你的密钥

# 图片存储（Vercel/Netlify 必需）
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=你的AWS访问密钥ID
AWS_SECRET_ACCESS_KEY=你的AWS密钥
AWS_REGION=us-east-1
AWS_S3_BUCKET=你的bucket名称
```

### 完整配置（包含所有可选变量）

```env
# ============================================
# OpenAI API（必需）
# ============================================
OPENAI_API_KEY=sk-proj-你的密钥
OPENAI_MODEL=gpt-3.5-turbo

# ============================================
# DALL-E 配置（可选）
# ============================================
DALL_E_MODEL=dall-e-3
DALL_E_QUALITY=hd
DALL_E_SIZE=1024x1024

# ============================================
# 图片存储配置（Vercel/Netlify 必需）
# ============================================
# 选项 A：AWS S3
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=你的AWS访问密钥ID
AWS_SECRET_ACCESS_KEY=你的AWS密钥
AWS_REGION=us-east-1
AWS_S3_BUCKET=你的bucket名称
STORAGE_BASE_URL=https://your-cdn-domain.com

# 选项 B：阿里云 OSS
# STORAGE_TYPE=oss
# OSS_ACCESS_KEY_ID=你的OSS访问密钥ID
# OSS_ACCESS_KEY_SECRET=你的OSS密钥
# OSS_REGION=oss-cn-hangzhou
# OSS_BUCKET=你的bucket名称
# OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com

# ============================================
# 备用生图 API（可选）
# ============================================
REPLICATE_API_TOKEN=r8_你的token
USE_REPLICATE=true

STABILITY_API_KEY=sk-你的密钥
USE_STABILITY=true

# ============================================
# Replicate 模型配置（可选）
# ============================================
REPLICATE_MODEL=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b
REPLICATE_IMG2IMG_MODEL=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b

# ============================================
# 人脸检测和换脸（可选）
# ============================================
USE_FACE_API=true
FACE_API_MODELS_PATH=./public/models

# 或使用第三方 API
# FACE_DETECTION_API_URL=https://api.facedetection.com/v1
# FACE_SWAP_API_URL=https://api.faceswap.com/v1
# FACE_SWAP_API_KEY=你的API密钥
```

## 🚀 在不同平台配置环境变量

### Vercel

1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加每个变量：
   - Key: `OPENAI_API_KEY`
   - Value: `sk-proj-...`
   - Environment: 选择 `Production`, `Preview`, `Development`
4. 点击 "Save"

### Netlify

1. 进入项目设置
2. 点击 "Build & deploy" → "Environment"
3. 点击 "Add variable"
4. 添加每个变量：
   - Key: `OPENAI_API_KEY`
   - Value: `sk-proj-...`
   - Scope: 选择 `All scopes`
5. 点击 "Save"

### 本地开发（.env.local）

1. 在项目根目录创建 `.env.local` 文件
2. 复制上面的环境变量模板
3. 填入你的实际值
4. 保存文件

⚠️ **注意**：`.env.local` 文件已加入 `.gitignore`，不会被提交到 Git。

## 🔐 安全提示

1. **不要提交密钥到 Git**
   - `.env.local` 已加入 `.gitignore`
   - 不要在代码中硬编码密钥

2. **使用环境变量管理服务**
   - 生产环境使用平台的环境变量功能
   - 不要将密钥写在代码中

3. **定期轮换密钥**
   - 定期更新 API 密钥
   - 如果密钥泄露，立即更换

## 📊 环境变量优先级

1. **平台环境变量**（Vercel/Netlify UI 中配置）
2. **.env.local**（本地开发）
3. **.env**（默认值，如果有）
4. **代码中的默认值**

## 🧪 测试环境变量

### 检查环境变量是否加载

在代码中添加临时日志：

```typescript
console.log('OPENAI_API_KEY 存在:', !!process.env.OPENAI_API_KEY)
console.log('OPENAI_API_KEY 长度:', process.env.OPENAI_API_KEY?.length)
```

### 本地测试

```bash
# 设置环境变量并运行
OPENAI_API_KEY=sk-proj-... npm run dev
```

## 📚 相关文档

- 环境变量配置：`ENV_CONFIG.md`
- Vercel 环境变量：`vercel-env.example`
- 部署指南：`DEPLOY.md`

