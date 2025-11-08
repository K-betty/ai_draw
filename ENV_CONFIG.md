# 环境变量配置指南

`.env.local` 文件已创建，请根据你的需求填写以下配置。

## 🔑 必填配置（至少选择一个AI生图服务）

### 方案1：使用 Replicate API（推荐）

1. **注册账号**：访问 https://replicate.com
2. **获取 API Token**：
   - 登录后访问：https://replicate.com/account/api-tokens
   - 点击 "Create token" 创建新token
   - 复制 token（格式：`r8_xxxxxxxxxxxxx`）
3. **配置环境变量**：
   ```env
   REPLICATE_API_TOKEN=r8_你的token
   USE_REPLICATE=true
   ```

### 方案2：使用 Stability AI API

1. **注册账号**：访问 https://platform.stability.ai
2. **获取 API Key**：
   - 登录后访问：https://platform.stability.ai/account/keys
   - 创建新的 API Key
   - 复制 key（格式：`sk-xxxxxxxxxxxxx`）
3. **配置环境变量**：
   ```env
   STABILITY_API_KEY=sk-你的key
   USE_STABILITY=true
   ```

**提示**：可以同时配置两个服务，系统会优先使用 Replicate，失败时自动切换到 Stability AI。

## 🎭 可选配置：人脸检测和换脸

### 使用 face-api.js（本地检测）

1. **创建模型目录**：
   ```bash
   mkdir public\models
   ```

2. **下载模型文件**：
   - 访问：https://github.com/justadudewhohacks/face-api.js-models
   - 下载以下文件到 `public/models/` 目录：
     - `ssd_mobilenetv1_model-weights_manifest.json`
     - `ssd_mobilenetv1_model-shard1`
     - `face_landmark_68_model-weights_manifest.json`
     - `face_landmark_68_model-shard1`
     - `face_recognition_model-weights_manifest.json`
     - `face_recognition_model-shard1`

3. **配置环境变量**：
   ```env
   USE_FACE_API=true
   FACE_API_MODELS_PATH=./public/models
   ```

### 使用第三方换脸API（推荐）

如果你有第三方换脸服务，可以配置：

```env
FACE_SWAP_API_URL=https://api.faceswap.com/v1
FACE_SWAP_API_KEY=你的api_key
```

## 💾 可选配置：图片存储

### 本地存储（默认，无需配置）

图片会保存在 `public/generated/` 目录。

### AWS S3（生产环境推荐）

1. **安装依赖**（已安装）：
   ```bash
   npm install @aws-sdk/client-s3
   ```

2. **配置环境变量**：
   ```env
   STORAGE_TYPE=s3
   AWS_ACCESS_KEY_ID=你的access_key
   AWS_SECRET_ACCESS_KEY=你的secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=你的bucket名称
   ```

### 阿里云OSS

1. **安装依赖**：
   ```bash
   npm install ali-oss
   ```

2. **配置环境变量**：
   ```env
   STORAGE_TYPE=oss
   OSS_ACCESS_KEY_ID=你的access_key
   OSS_ACCESS_KEY_SECRET=你的secret_key
   OSS_REGION=oss-cn-hangzhou
   OSS_BUCKET=你的bucket名称
   OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
   ```

## 📝 配置示例

### 最小配置（仅文生图功能）

```env
# 使用 Replicate API
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
USE_REPLICATE=true

# 其他保持默认即可
```

### 完整配置（所有功能）

```env
# AI生图
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
USE_REPLICATE=true
STABILITY_API_KEY=sk-xxxxxxxxxxxxx
USE_STABILITY=true

# 人脸检测
USE_FACE_API=true
FACE_API_MODELS_PATH=./public/models

# 换脸API
FACE_SWAP_API_URL=https://api.faceswap.com/v1
FACE_SWAP_API_KEY=your_api_key

# 存储
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket
```

## ⚠️ 重要提示

1. **安全**：
   - `.env.local` 文件已自动加入 `.gitignore`，不会被提交到Git
   - 不要将API密钥分享给他人
   - 生产环境使用环境变量或密钥管理服务

2. **测试**：
   - 配置完成后，运行 `npm run dev` 启动开发服务器
   - 访问 http://localhost:3000 测试功能

3. **故障排除**：
   - 如果API调用失败，检查token/key是否正确
   - 检查网络连接
   - 查看控制台错误信息

## 🚀 下一步

配置完成后，运行：

```bash
npm run dev
```

然后访问 http://localhost:3000 开始使用！

