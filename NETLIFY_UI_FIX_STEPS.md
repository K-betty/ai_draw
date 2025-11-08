# 🔴 Netlify Base Directory 修复 - 详细步骤

## ⚠️ 当前错误

错误信息显示 Netlify 仍在尝试使用 Windows 路径：
```
基本目录不存在：/opt/build/repo/D:\DevelopTools\node_modules
```

这说明 **Netlify UI 中的 Base directory 设置仍然存在**，必须手动清除。

## 🎯 解决方案：在 Netlify UI 中清除 Base Directory

### 方法 1：通过网站设置（推荐）

#### 步骤 1：访问 Netlify 控制台

1. 打开浏览器，访问：https://app.netlify.com
2. 使用你的账号登录

#### 步骤 2：进入项目设置

1. 在项目列表中，找到并点击你的项目（**ai_draw**）
2. 点击左侧菜单中的 **"Site configuration"** 或 **"Site settings"**

#### 步骤 3：进入构建设置

1. 在设置页面，点击 **"Build & deploy"** 标签
2. 在 "Build & deploy" 页面，找到 **"Continuous Deployment"** 部分
3. 点击 **"Build settings"** 下的 **"Edit settings"** 按钮

#### 步骤 4：清除 Base Directory（关键步骤）

1. 在打开的编辑对话框中，找到 **"Base directory"** 字段
2. **完全删除该字段中的所有内容**：
   - 选中字段中的所有文本（包括 `D:\DevelopTools\node_modules`）
   - 按 `Delete` 或 `Backspace` 键删除
   - 确保字段**完全为空**（没有任何字符，包括空格）
3. 检查其他设置：
   - **Build command**: 应该是 `npm run build`
   - **Publish directory**: 应该留空
4. 点击 **"Save"** 按钮保存更改

#### 步骤 5：清除缓存并重新部署

1. 返回项目主页面
2. 点击 **"Deploys"** 标签
3. 点击 **"Trigger deploy"** 下拉菜单
4. 选择 **"Clear cache and deploy site"**
5. 等待构建完成

### 方法 2：删除并重新创建站点（如果方法 1 失败）

如果清除 Base directory 后仍然失败，可以删除并重新创建站点：

#### 步骤 1：删除现有站点

1. 进入 **Site settings**
2. 滚动到页面最底部
3. 找到 **"Danger zone"** 部分
4. 点击 **"Delete this site"**
5. 确认删除（输入站点名称确认）

#### 步骤 2：重新导入项目

1. 在 Netlify 控制台，点击 **"Add new site"**
2. 选择 **"Import an existing project"**
3. 选择 **"Deploy with GitHub"**
4. 授权 GitHub 访问（如果尚未授权）
5. 选择你的仓库：**K-betty/ai_draw**

#### 步骤 3：配置构建设置（重要）

在配置页面：

1. **Base directory**: **留空**（不要填写任何内容）
2. **Build command**: `npm run build`
3. **Publish directory**: **留空**（由 Next.js 插件处理）

#### 步骤 4：配置环境变量

1. 点击 **"Show advanced"** 展开高级选项
2. 在 "Environment variables" 部分，添加：
   ```
   OPENAI_API_KEY=sk-proj-...
   STORAGE_TYPE=s3
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_S3_BUCKET=...
   AWS_REGION=us-east-1
   ```

#### 步骤 5：部署

1. 点击 **"Deploy site"**
2. 等待构建完成

## 🔍 如何确认 Base Directory 已清除

在 Netlify UI 的 Build settings 页面：

**✅ 正确状态：**
```
Base directory: [空字段，没有任何内容显示]
```

**❌ 错误状态：**
```
Base directory: D:\DevelopTools\node_modules
Base directory: /opt/build
Base directory: node_modules
Base directory: [任何其他路径]
```

## 📸 可视化指南

### 正确的设置页面应该看起来像：

```
┌─────────────────────────────────────┐
│ Build settings                      │
├─────────────────────────────────────┤
│ Base directory:                    │
│ [空字段]                            │
│                                     │
│ Build command:                     │
│ npm run build                       │
│                                     │
│ Publish directory:                 │
│ [空字段]                            │
└─────────────────────────────────────┘
```

## 🚨 常见问题

### Q: 我找不到 "Base directory" 字段

**A**: 确保你点击了 "Edit settings" 按钮。Base directory 字段在编辑对话框中。

### Q: 清除后仍然失败

**A**: 
1. 尝试清除构建缓存（Trigger deploy → Clear cache and deploy site）
2. 或者删除并重新创建站点

### Q: 我可以使用 Netlify CLI 吗？

**A**: 可以，但 Base directory 设置仍然需要在 UI 中清除，因为 CLI 无法直接修改 UI 设置。

## 📋 检查清单

在重新部署前，请确认：

- [ ] 已在 Netlify UI 中**完全清除** Base directory 字段
- [ ] Base directory 字段**完全为空**（没有任何内容）
- [ ] 已点击 "Save" 保存更改
- [ ] 已清除构建缓存
- [ ] 所有环境变量已配置
- [ ] `netlify.toml` 文件已提交到 Git

## 🎯 关键提示

**最重要**：Base directory 错误**必须在 Netlify UI 中手动清除**。仅仅更新代码文件是不够的，因为 Netlify UI 的设置会覆盖文件配置。

如果 UI 中的设置没有被清除，构建会一直失败。

