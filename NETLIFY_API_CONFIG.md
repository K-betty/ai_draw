# 🔑 Netlify 环境变量配置指南

## 📋 图生图功能需要的 API 配置

图生图功能需要配置以下 API 之一：

### 选项 1：Stability AI（推荐）

**优势**：
- 图片质量高
- 支持图生图功能
- 响应速度快

**配置步骤**：

1. **获取 API Key**：
   - 访问：https://platform.stability.ai/account/keys
   - 注册账号并创建 API Key
   - 格式：`sk-...`

2. **在 Netlify 中配置**：
   - 登录 Netlify：https://app.netlify.com
   - 选择你的项目
   - 进入 **Site settings** → **Environment variables**
   - 点击 **Add variable**
   - 添加以下变量：
     ```
     Key: STABILITY_API_KEY
     Value: sk-你的实际密钥
     Scope: All scopes (Production, Deploy previews, Branch deploys)
     ```
   - 点击 **Save**

3. **可选配置**（启用 Stability AI）：
   ```
   Key: USE_STABILITY
   Value: true
   Scope: All scopes
   ```

### 选项 2：Replicate API

**优势**：
- 支持多种模型
- 灵活的配置选项

**配置步骤**：

1. **获取 API Token**：
   - 访问：https://replicate.com/account/api-tokens
   - 注册账号并创建 API Token
   - 格式：`r8_...`

2. **在 Netlify 中配置**：
   - 登录 Netlify：https://app.netlify.com
   - 选择你的项目
   - 进入 **Site settings** → **Environment variables**
   - 点击 **Add variable**
   - 添加以下变量：
     ```
     Key: REPLICATE_API_TOKEN
     Value: r8_你的实际token
     Scope: All scopes (Production, Deploy previews, Branch deploys)
     ```
   - 点击 **Save**

3. **可选配置**（启用 Replicate）：
   ```
   Key: USE_REPLICATE
   Value: true
   Scope: All scopes
   ```

## 🎯 完整的环境变量列表

### 必需的环境变量

```env
# OpenAI API（用于文生图和提示词优化）
OPENAI_API_KEY=sk-proj-你的密钥

# 图片存储（Netlify 必需）
STORAGE_TYPE=s3  # 或 oss
AWS_ACCESS_KEY_ID=你的AWS密钥ID
AWS_SECRET_ACCESS_KEY=你的AWS密钥
AWS_REGION=us-east-1
AWS_S3_BUCKET=你的bucket名称
```

### 图生图功能需要的环境变量（至少配置一个）

```env
# 选项 1：Stability AI（推荐）
STABILITY_API_KEY=sk-你的密钥
USE_STABILITY=true

# 选项 2：Replicate API
REPLICATE_API_TOKEN=r8_你的token
USE_REPLICATE=true
```

## 📝 配置步骤总结

### 在 Netlify UI 中配置：

1. **访问 Netlify 控制台**
   - 打开：https://app.netlify.com
   - 登录你的账号

2. **选择项目**
   - 在项目列表中找到你的项目
   - 点击项目名称进入

3. **进入环境变量设置**
   - 点击左侧菜单 **Site settings**
   - 点击 **Environment variables**

4. **添加环境变量**
   - 点击 **Add variable** 按钮
   - 输入 Key 和 Value
   - 选择 Scope（建议选择 All scopes）
   - 点击 **Save**

5. **重新部署**
   - 配置完成后，点击 **Deploys** 标签
   - 点击 **Trigger deploy** → **Deploy site**
   - 等待部署完成

## 🔍 验证配置

配置完成后，你可以：

1. **检查环境变量**
   - 在 Netlify UI 中查看 Environment variables 列表
   - 确保所有必需的变量都已添加

2. **测试功能**
   - 访问你的网站
   - 尝试使用图生图功能
   - 如果配置正确，应该可以正常生成图片

## ⚠️ 常见问题

### Q: 为什么需要配置这些 API？

A: 图生图功能需要调用第三方 AI 服务来生成图片。DALL-E 3 不支持图生图，所以需要配置 Replicate 或 Stability AI。

### Q: 可以同时配置多个 API 吗？

A: 可以！代码会按优先级使用：
- 优先使用 Stability AI
- 如果失败，自动回退到 Replicate
- 如果都失败，返回错误

### Q: 本地开发环境如何配置？

A: 在项目根目录创建 `.env.local` 文件（已加入 `.gitignore`）：

```env
# OpenAI API
OPENAI_API_KEY=sk-proj-你的密钥

# Stability AI（图生图）
STABILITY_API_KEY=sk-你的密钥
USE_STABILITY=true

# 或 Replicate API
REPLICATE_API_TOKEN=r8_你的token
USE_REPLICATE=true
```

### Q: 配置后仍然报错？

A: 检查以下几点：
1. ✅ 环境变量名称是否正确（区分大小写）
2. ✅ API Key/Token 是否有效
3. ✅ 是否已重新部署
4. ✅ Scope 是否选择了正确的环境

## 📚 相关文档

- [环境变量完整指南](./ENV_VARIABLES.md)
- [Netlify 部署指南](./NETLIFY_DEPLOY.md)
- [README](./README.md)

## 🔗 获取 API Key 的链接

- **Stability AI**: https://platform.stability.ai/account/keys
- **Replicate**: https://replicate.com/account/api-tokens
- **OpenAI**: https://platform.openai.com/api-keys

