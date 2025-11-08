# Netlify 部署指南

## 前置要求

1. GitHub 账号
2. Netlify 账号（可用 GitHub 账号登录）
3. 项目已推送到 GitHub

## 部署步骤

### 方法 1：通过 Netlify 网站部署（推荐）

1. **访问 Netlify**
   - 打开 https://www.netlify.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add new site" → "Import an existing project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置构建设置**
   - **Base directory**: 留空（项目在根目录）
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - 点击 "Show advanced" 可以配置环境变量

4. **配置环境变量**
   在 "Environment variables" 部分添加：
   ```
   OPENAI_API_KEY=sk-proj-...
   STORAGE_TYPE=s3
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_S3_BUCKET=...
   AWS_REGION=us-east-1
   ```

5. **部署**
   - 点击 "Deploy site"
   - 等待构建完成（约 3-5 分钟）
   - 部署成功后，会获得一个 URL（如：`https://your-project.netlify.app`）

### 方法 2：通过 Netlify CLI 部署

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录
netlify login

# 3. 初始化项目
netlify init

# 4. 配置环境变量
netlify env:set OPENAI_API_KEY sk-proj-...
netlify env:set STORAGE_TYPE s3
netlify env:set AWS_ACCESS_KEY_ID ...
netlify env:set AWS_SECRET_ACCESS_KEY ...
netlify env:set AWS_S3_BUCKET ...
netlify env:set AWS_REGION us-east-1

# 5. 部署
netlify deploy --prod
```

## 重要配置说明

### netlify.toml 配置

项目已包含 `netlify.toml` 配置文件，包含：
- 构建命令：`npm run build`
- 发布目录：`.next`
- Next.js 插件：`@netlify/plugin-nextjs`

### 必需的环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API 密钥 | `sk-proj-...` |
| `STORAGE_TYPE` | 存储类型（必须） | `s3` 或 `oss` |
| `AWS_ACCESS_KEY_ID` | AWS 访问密钥（如果使用 S3） | `...` |
| `AWS_SECRET_ACCESS_KEY` | AWS 密钥（如果使用 S3） | `...` |
| `AWS_S3_BUCKET` | S3 Bucket 名称 | `your-bucket` |
| `AWS_REGION` | AWS 区域 | `us-east-1` |

### 可选的环境变量

```
REPLICATE_API_TOKEN=r8_...
STABILITY_API_KEY=sk-...
DALL_E_MODEL=dall-e-3
DALL_E_QUALITY=hd
DALL_E_SIZE=1024x1024
```

## 常见问题

### 1. Base directory 错误

**错误**：`Base directory does not exist: /opt/build`

**解决**：
- 在 Netlify UI 中，将 Base directory 留空（项目在根目录）
- 或确保 `netlify.toml` 中没有错误的 base 配置

### 2. 构建失败

**问题**：构建时出现错误

**解决**：
- 检查 Node.js 版本（Netlify 默认使用 Node.js 18）
- 检查依赖是否正确安装
- 查看构建日志中的详细错误

### 3. API Routes 不工作

**问题**：API 路由返回 404

**解决**：
- 确保安装了 `@netlify/plugin-nextjs` 插件
- 检查 `netlify.toml` 配置是否正确
- 重新部署项目

### 4. 图片存储问题

**问题**：生成的图片无法保存

**解决**：
- Netlify 的文件系统是只读的
- 必须配置外部存储（S3 或 OSS）
- 确保环境变量正确配置

## Netlify vs Vercel

### Netlify 优势
- 免费额度较大（100GB 带宽/月）
- 支持更多插件
- 更好的静态网站支持

### Vercel 优势
- 对 Next.js 支持更好
- 自动优化和缓存
- 更快的构建速度

## 相关链接

- [Netlify 文档](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Netlify CLI](https://cli.netlify.com/)

