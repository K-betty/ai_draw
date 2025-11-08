# Netlify Base Directory 错误修复

## 错误信息

```
基本目录不存在：/opt/build/repo/D:\DevelopTools\node_modules
```

## 问题原因

Netlify UI 中的 **Base directory** 设置被错误地配置为 Windows 路径 `D:\DevelopTools\node_modules`。

Netlify 在 Linux 环境中运行，无法识别 Windows 路径。

## 立即修复步骤

### 方法 1：在 Netlify UI 中清除 Base Directory（必须执行）

1. **登录 Netlify**
   - 访问 https://www.netlify.com
   - 登录你的账号

2. **进入项目设置**
   - 选择你的项目（ai_draw）
   - 点击 **"Site settings"**

3. **清除 Base directory**
   - 点击 **"Build & deploy"**
   - 点击 **"Continuous Deployment"**
   - 点击 **"Build settings"** → **"Edit settings"**
   - 找到 **"Base directory"** 字段
   - **完全清空该字段**（不要留任何内容，包括空格）
   - 点击 **"Save"**

4. **验证配置**
   - 确保以下设置：
     - **Base directory**: （空）
     - **Build command**: `npm run build`
     - **Publish directory**: （留空，由 Next.js 插件处理）

5. **重新部署**
   - 点击 **"Trigger deploy"** → **"Deploy site"**

### 方法 2：使用 netlify.toml（已配置）

`netlify.toml` 文件已经正确配置，**不包含 base 设置**。

确保文件已提交到 Git：

```bash
git add netlify.toml
git commit -m "修复 netlify.toml 配置"
git push origin master
```

## 正确的配置

### netlify.toml（已正确配置）

```toml
[build]
  command = "npm run build"
  # 注意：没有 base 设置，因为项目在根目录

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Netlify UI 设置

- **Base directory**: （空/留空）
- **Build command**: `npm run build`
- **Publish directory**: （空/留空，由插件处理）

## 验证步骤

1. ✅ 检查 `netlify.toml` 中没有 `base` 配置
2. ✅ 在 Netlify UI 中清除 Base directory
3. ✅ 确保所有文件已提交到 Git
4. ✅ 重新部署项目

## 常见错误

### ❌ 错误配置

```toml
[build]
  base = "D:\\DevelopTools\\node_modules"  # ❌ 错误：Windows 路径
  base = "/opt/build"                       # ❌ 错误：绝对路径
  base = "node_modules"                     # ❌ 错误：不应该指向 node_modules
```

### ✅ 正确配置

```toml
[build]
  # 项目在根目录，不设置 base
  command = "npm run build"
```

## 如果问题仍然存在

1. **完全删除并重新创建 Netlify 站点**
   - 删除现有站点
   - 重新导入项目
   - 确保 Base directory 留空

2. **检查是否有其他配置文件**
   - 检查是否有 `.netlify` 目录
   - 检查是否有其他 Netlify 配置文件

3. **联系 Netlify 支持**
   - 如果问题持续，联系 Netlify 支持团队

## 相关文档

- [Netlify Base Directory 文档](https://docs.netlify.com/configure-builds/get-started/#base-directory)
- [Netlify 配置文件文档](https://docs.netlify.com/configure-builds/file-based-configuration/)

