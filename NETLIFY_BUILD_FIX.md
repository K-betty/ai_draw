# Netlify 构建问题修复指南

## ✅ 已完成的修复

### 1. 构建命令检查

**package.json** 中的构建命令：
```json
"build": "next build"
```

**netlify.toml** 中的构建命令：
```toml
command = "npm run build"
```

✅ **一致**：两个配置都使用 `npm run build`，会执行 `next build`

### 2. Node 版本配置

已创建以下文件确保 Node 版本一致：

- **.nvmrc**：指定 Node.js 18
- **netlify.toml**：`NODE_VERSION = "18"`
- **package.json**：`"engines": { "node": ">=18.0.0" }`

### 3. Lockfile 检查

确保 `package-lock.json` 已提交到仓库：

```bash
# 检查 lockfile 是否存在
ls package-lock.json

# 如果存在，确保已提交
git add package-lock.json
git commit -m "添加 package-lock.json"
git push
```

### 4. 环境变量检查

在 Netlify UI 中配置以下环境变量：

**必需的环境变量：**
```
OPENAI_API_KEY=sk-proj-...
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
AWS_REGION=us-east-1
```

**可选的环境变量：**
```
REPLICATE_API_TOKEN=r8_...
STABILITY_API_KEY=sk-...
DALL_E_MODEL=dall-e-3
DALL_E_QUALITY=hd
DALL_E_SIZE=1024x1024
```

## 🔧 修复步骤

### 步骤 1：确保文件已提交

```bash
# 检查哪些文件需要提交
git status

# 确保以下文件已提交：
git add package.json
git add package-lock.json
git add netlify.toml
git add .nvmrc
git add .gitignore

# 提交
git commit -m "修复 Netlify 构建配置"
git push origin master
```

### 步骤 2：在 Netlify UI 中配置

1. **清除 Base directory**
   - Site settings → Build & deploy → Build settings
   - Base directory: **留空**

2. **配置环境变量**
   - Site settings → Build & deploy → Environment
   - 添加所有必需的环境变量

3. **检查 Node 版本**
   - Site settings → Build & deploy → Environment
   - 确保 NODE_VERSION = 18（或使用 .nvmrc）

### 步骤 3：重新部署

1. 在 Netlify 中点击 "Trigger deploy" → "Deploy site"
2. 或推送代码到 GitHub（如果启用了自动部署）

## 🐛 常见构建错误及解决方案

### 错误 1：找不到模块

**错误信息**：`Cannot find module 'xxx'`

**解决方案**：
1. 确保 `package-lock.json` 已提交
2. 检查 `package.json` 中是否包含该依赖
3. 在 Netlify 环境变量中添加：`NPM_FLAGS = "--legacy-peer-deps"`

### 错误 2：Node 版本不匹配

**错误信息**：`ERR_OSSSL` 或语法错误

**解决方案**：
1. 确保 `.nvmrc` 文件存在并包含 `18`
2. 在 `netlify.toml` 中设置 `NODE_VERSION = "18"`
3. 重新部署

### 错误 3：构建超时

**错误信息**：`Build exceeded maximum time`

**解决方案**：
1. 检查构建日志，找出耗时的步骤
2. 优化依赖安装（使用缓存）
3. 考虑升级到 Netlify Pro（更长的构建时间）

### 错误 4：环境变量缺失

**错误信息**：`Environment variable not found`

**解决方案**：
1. 在 Netlify UI 中检查所有环境变量
2. 确保变量名称正确（区分大小写）
3. 重新部署

## 📋 构建检查清单

在部署前，请确认：

- [ ] `package.json` 已提交
- [ ] `package-lock.json` 已提交
- [ ] `netlify.toml` 已提交
- [ ] `.nvmrc` 已提交
- [ ] `.gitignore` 不排除 lockfile
- [ ] Base directory 在 Netlify UI 中留空
- [ ] 所有必需的环境变量已配置
- [ ] Node 版本设置为 18

## 🔍 本地测试构建

在提交前，可以在本地测试构建：

```bash
# 安装依赖
npm install

# 运行构建（模拟 Netlify 环境）
CI=true npm run build

# 如果成功，说明配置正确
```

## 📚 相关文档

- [Netlify 构建文档](https://docs.netlify.com/configure-builds/overview/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Netlify 环境变量](https://docs.netlify.com/environment-variables/overview/)

