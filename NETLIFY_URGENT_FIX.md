# ⚠️ Netlify Base Directory 紧急修复

## 🔴 当前错误

```
基本目录不存在：/opt/build/repo/D:\DevelopTools\node_modules
```

## 🎯 问题根源

Netlify UI 中的 **Base directory** 设置仍然包含错误的 Windows 路径。**必须在 Netlify UI 中手动清除**。

## ✅ 立即修复步骤（必须按顺序执行）

### 步骤 1：登录 Netlify 并进入设置

1. 访问 https://app.netlify.com
2. 登录你的账号
3. 找到并点击你的项目（ai_draw）

### 步骤 2：清除 Base Directory（关键步骤）

1. 点击左侧菜单的 **"Site configuration"** 或 **"Site settings"**
2. 点击 **"Build & deploy"**
3. 点击 **"Continuous Deployment"**
4. 在 "Build settings" 部分，点击 **"Edit settings"** 按钮
5. 找到 **"Base directory"** 字段
6. **完全删除该字段中的所有内容**（包括空格、换行符等）
7. 确保该字段**完全为空**
8. 点击 **"Save"** 按钮

### 步骤 3：验证其他设置

确保以下设置正确：

- **Base directory**: （完全为空）
- **Build command**: `npm run build`
- **Publish directory**: （留空，由 Next.js 插件处理）

### 步骤 4：清除构建缓存（可选但推荐）

1. 在项目页面，点击 **"Deploys"**
2. 点击 **"Trigger deploy"** → **"Clear cache and deploy site"**

### 步骤 5：重新部署

1. 点击 **"Trigger deploy"** → **"Deploy site"**
2. 等待构建完成

## 🔍 如何确认 Base Directory 已清除

在 Netlify UI 中，Base directory 字段应该：
- ✅ 完全为空（没有任何内容）
- ✅ 不显示任何路径
- ✅ 不显示 `D:\DevelopTools\node_modules`
- ✅ 不显示 `/opt/build`
- ✅ 不显示任何其他路径

## 🚨 如果仍然失败

### 方案 A：删除并重新创建站点

1. **删除现有站点**
   - 进入 Site settings
   - 滚动到底部
   - 点击 "Delete site"
   - 确认删除

2. **重新导入项目**
   - 点击 "Add new site" → "Import an existing project"
   - 选择你的 GitHub 仓库
   - **在配置页面，确保 Base directory 留空**
   - 配置环境变量
   - 点击 "Deploy site"

### 方案 B：使用 Netlify CLI

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录
netlify login

# 3. 链接到现有站点
netlify link

# 4. 检查配置
netlify status

# 5. 部署
netlify deploy --prod
```

## 📋 检查清单

在重新部署前，请确认：

- [ ] 已在 Netlify UI 中**完全清除** Base directory
- [ ] Base directory 字段**完全为空**（没有任何内容）
- [ ] `netlify.toml` 文件已提交到 Git
- [ ] `package.json` 已提交到 Git
- [ ] `package-lock.json` 已提交到 Git
- [ ] `.nvmrc` 文件已提交到 Git
- [ ] 所有环境变量已配置

## 🎯 关键提示

**最重要的一点**：Base directory 错误**必须在 Netlify UI 中手动清除**。仅仅更新 `netlify.toml` 文件是不够的，因为 Netlify UI 的设置会覆盖文件配置。

## 📸 截图参考

在 Netlify UI 的 Build settings 页面，Base directory 应该看起来像这样：

```
Base directory: [空字段，没有任何内容]
```

而不是：

```
Base directory: D:\DevelopTools\node_modules  ❌
Base directory: /opt/build  ❌
Base directory: node_modules  ❌
```

## 🔗 相关文档

- [Netlify Base Directory 文档](https://docs.netlify.com/configure-builds/get-started/#base-directory)
- [Netlify 构建设置](https://docs.netlify.com/configure-builds/build-settings/)

