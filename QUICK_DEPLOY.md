# 快速部署指南

## 🚀 Vercel 一键部署

### 方法 1：通过 Vercel 网站（推荐，5分钟完成）

1. **准备代码**
   ```bash
   # 确保代码已推送到 GitHub
   git add .
   git commit -m "准备部署"
   git push origin main
   ```

2. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

3. **导入项目**
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

4. **配置环境变量**
   在 "Environment Variables" 中添加：
   ```
   OPENAI_API_KEY=sk-proj-你的密钥
   STORAGE_TYPE=s3
   AWS_ACCESS_KEY_ID=你的密钥
   AWS_SECRET_ACCESS_KEY=你的密钥
   AWS_S3_BUCKET=你的bucket名称
   AWS_REGION=us-east-1
   ```

5. **部署**
   - 点击 "Deploy"
   - 等待 2-5 分钟
   - 完成！🎉

### 方法 2：通过 Vercel CLI（命令行）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 配置环境变量
vercel env add OPENAI_API_KEY
vercel env add STORAGE_TYPE
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
vercel env add AWS_S3_BUCKET

# 5. 生产环境部署
vercel --prod
```

## 📦 静态导出部署（国内 CDN）

### 前置说明

⚠️ **静态导出不支持 API Routes**。如果使用静态导出，需要：
1. 将 API 调用改为客户端直接调用第三方 API
2. 或使用 Serverless Functions

### 静态导出步骤

1. **修改 next.config.js**
   ```javascript
   const nextConfig = {
     output: 'export',
     // ... 其他配置
   }
   ```

2. **构建**
   ```bash
   npm run build
   ```

3. **上传到 CDN**
   - 将 `out` 目录内容上传到：
     - 腾讯云静态网站托管
     - 阿里云 OSS
     - 码云 Gitee Pages

## 🔧 环境变量配置

### 必需的环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API 密钥 | `sk-proj-...` |

### 图片存储配置（Vercel 必需）

**选项 1：AWS S3**
```
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=your-bucket
AWS_REGION=us-east-1
```

**选项 2：阿里云 OSS**
```
STORAGE_TYPE=oss
OSS_ACCESS_KEY_ID=...
OSS_ACCESS_KEY_SECRET=...
OSS_BUCKET=your-bucket
OSS_REGION=oss-cn-hangzhou
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
```

### 可选的环境变量

```
REPLICATE_API_TOKEN=r8_...  # Replicate API（备用）
STABILITY_API_KEY=sk-...     # Stability AI API（备用）
DALL_E_MODEL=dall-e-3        # DALL-E 模型
DALL_E_QUALITY=hd            # DALL-E 质量
DALL_E_SIZE=1024x1024        # DALL-E 尺寸
```

## ⚠️ 重要提示

### Vercel 部署注意事项

1. **文件系统只读**
   - Vercel 的文件系统是只读的
   - 不能使用本地文件存储
   - 必须配置外部存储（S3 或 OSS）

2. **函数超时**
   - 免费版：10 秒
   - 付费版：60 秒
   - 长时间任务建议使用异步处理

3. **环境变量**
   - 在 Vercel 项目设置中配置
   - 不要提交 `.env.local` 到 Git

### 图片存储建议

- **开发环境**：使用本地存储（`STORAGE_TYPE=local`）
- **生产环境（Vercel）**：使用 S3 或 OSS（`STORAGE_TYPE=s3` 或 `STORAGE_TYPE=oss`）

## 🐛 常见问题

### 1. 部署失败：找不到模块

**解决**：确保所有依赖都在 `package.json` 中

### 2. 图片无法保存

**解决**：在 Vercel 中配置外部存储（S3 或 OSS）

### 3. API 超时

**解决**：升级到 Vercel Pro 或优化 API 响应时间

### 4. 环境变量未生效

**解决**：重新部署项目

## 📚 更多信息

- 详细部署文档：查看 [DEPLOY.md](./DEPLOY.md)
- 环境变量配置：查看 [ENV_CONFIG.md](./ENV_CONFIG.md)
- Vercel 文档：https://vercel.com/docs

