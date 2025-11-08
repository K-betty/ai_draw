# 部署指南

本文档介绍如何将 AI Draw 项目部署到 Vercel 和国内 CDN。

## 目录

- [Vercel 部署](#vercel-部署)
- [静态导出部署（国内 CDN）](#静态导出部署国内-cdn)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)

## Vercel 部署

### 前置要求

1. GitHub 账号
2. Vercel 账号（可用 GitHub 账号登录）
3. 项目已推送到 GitHub

### 部署步骤

#### 方法 1：通过 Vercel 网站部署（推荐）

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置项目**
   - Framework Preset: Next.js（自动检测）
   - Root Directory: `./`（默认）
   - Build Command: `npm run build`（默认）
   - Output Directory: `.next`（默认）
   - Install Command: `npm install`（默认）

4. **配置环境变量**
   - 在 "Environment Variables" 部分添加以下变量：
     ```
     OPENAI_API_KEY=sk-...
     REPLICATE_API_TOKEN=r8_...
     STABILITY_API_KEY=sk-...
     ```
   - 点击 "Add" 添加每个变量
   - 确保选择所有环境（Production, Preview, Development）

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成（约 2-5 分钟）
   - 部署成功后，会获得一个 URL（如：`https://your-project.vercel.app`）

#### 方法 2：通过 Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```
   
   首次部署会提示：
   - Set up and deploy? Yes
   - Which scope? 选择你的账号
   - Link to existing project? No
   - Project name? ai-draw（或自定义）
   - Directory? ./
   - Override settings? No

4. **配置环境变量**
   ```bash
   vercel env add OPENAI_API_KEY
   vercel env add REPLICATE_API_TOKEN
   vercel env add STABILITY_API_KEY
   ```

5. **生产环境部署**
   ```bash
   vercel --prod
   ```

### Vercel 配置说明

- **区域选择**：已配置为 `hkg1`（香港），国内访问速度更快
- **函数超时**：API Routes 最大执行时间为 60 秒
- **自动部署**：每次推送到 GitHub 主分支会自动部署

### 自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 输入你的域名
3. 按照提示配置 DNS 记录
4. 等待 DNS 生效（通常几分钟到几小时）

## 静态导出部署（国内 CDN）

### 前置说明

⚠️ **重要**：静态导出不支持 API Routes。如果使用静态导出，需要：
1. 将 API 调用改为客户端直接调用第三方 API
2. 或使用 Serverless Functions（如腾讯云、阿里云）

### 静态导出配置

1. **修改 next.config.js**
   ```javascript
   const nextConfig = {
     output: 'export',
     // ... 其他配置
   }
   ```

2. **构建静态文件**
   ```bash
   npm run build
   ```

3. **部署到 CDN**
   - 将 `out` 目录的内容上传到 CDN
   - 配置默认首页为 `index.html`

### 国内 CDN 推荐

#### 腾讯云静态网站托管

1. 登录腾讯云控制台
2. 开通静态网站托管服务
3. 上传 `out` 目录内容
4. 配置自定义域名（可选）

#### 阿里云 OSS

1. 登录阿里云控制台
2. 创建 OSS Bucket
3. 开启静态网站托管
4. 上传 `out` 目录内容
5. 配置 CDN 加速（可选）

#### 码云 Gitee Pages

1. 将代码推送到 Gitee
2. 在仓库设置中开启 Gitee Pages
3. 选择构建目录为 `out`
4. 访问生成的 Pages 地址

## 环境变量配置

### Vercel 环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API 密钥 | `sk-proj-...` |
| `REPLICATE_API_TOKEN` | Replicate API Token | `r8_...` |
| `STABILITY_API_KEY` | Stability AI API Key | `sk-...` |
| `DALL_E_MODEL` | DALL-E 模型（可选） | `dall-e-3` |
| `DALL_E_QUALITY` | DALL-E 质量（可选） | `hd` |
| `DALL_E_SIZE` | DALL-E 尺寸（可选） | `1024x1024` |

### 环境变量优先级

1. Vercel 项目设置中的环境变量
2. `.env.local`（本地开发）
3. `.env`（默认值）

## 常见问题

### 1. 构建失败

**问题**：构建时出现错误

**解决方案**：
- 检查 Node.js 版本（Vercel 默认使用 Node.js 18）
- 检查依赖是否正确安装
- 查看构建日志中的详细错误信息

### 2. API Routes 超时

**问题**：API 请求超时

**解决方案**：
- Vercel 免费版函数最大执行时间为 10 秒
- 付费版可以延长到 60 秒
- 考虑使用异步处理或队列

### 3. 图片存储问题

**问题**：生成的图片无法访问

**解决方案**：
- Vercel 的文件系统是只读的
- 使用外部存储（如 AWS S3、阿里云 OSS）
- 或使用 Vercel Blob Storage

### 4. 环境变量未生效

**问题**：环境变量在部署后未生效

**解决方案**：
- 确保在 Vercel 项目设置中正确配置
- 重新部署项目
- 检查环境变量名称是否正确

### 5. 国内访问速度慢

**问题**：Vercel 在国内访问速度慢

**解决方案**：
- 使用自定义域名并配置国内 CDN
- 或使用静态导出 + 国内 CDN
- 或使用国内 Serverless 服务

## 性能优化建议

1. **图片优化**
   - 使用 Next.js Image 组件
   - 启用图片压缩
   - 使用 CDN 加速

2. **代码分割**
   - 使用动态导入
   - 按需加载组件

3. **缓存策略**
   - 配置适当的缓存头
   - 使用 Vercel Edge Functions

4. **监控和日志**
   - 使用 Vercel Analytics
   - 配置错误监控（如 Sentry）

## 相关链接

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Vercel CLI 文档](https://vercel.com/docs/cli)

