# GitHub Pages Deployment Design

## Overview

本设计文档描述了如何将 chess-game 项目部署到 GitHub Pages。部署方案采用 GitHub Actions 自动化工作流，在代码推送到主分支时自动构建并部署应用。该方案利用 Vite 的构建能力和 GitHub Pages 的静态托管服务，实现零成本的应用部署。

## Architecture

### Deployment Flow

```
代码推送 → GitHub Actions 触发 → 安装依赖 → 构建项目 → 部署到 gh-pages 分支 → GitHub Pages 服务
```

### Components

1. **Vite Configuration**: 配置 base path 以匹配 GitHub Pages URL 结构
2. **GitHub Actions Workflow**: 自动化构建和部署流程
3. **Build Artifacts**: 生成的静态文件（dist 目录）
4. **gh-pages Branch**: 存储部署文件的专用分支

## Components and Interfaces

### 1. Vite Build Configuration

**文件**: `vite.config.ts`

**配置项**:
- `base`: 设置为仓库名称（例如：`/chess-game/`）以确保资源路径正确
- `build.outDir`: 输出目录（默认为 `dist`）
- `build.assetsDir`: 静态资源目录

**示例配置**:
```typescript
export default defineConfig({
  base: '/chess-game/', // 替换为实际的仓库名
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
```

### 2. GitHub Actions Workflow

**文件**: `.github/workflows/deploy.yml`

**工作流步骤**:
1. **Checkout**: 检出代码
2. **Setup Node.js**: 配置 Node.js 环境（使用项目兼容的版本）
3. **Install Dependencies**: 安装 npm 依赖
4. **Build**: 执行构建命令
5. **Deploy**: 部署到 GitHub Pages

**使用的 Actions**:
- `actions/checkout@v4`: 检出代码
- `actions/setup-node@v4`: 设置 Node.js 环境
- `actions/configure-pages@v4`: 配置 GitHub Pages
- `actions/upload-pages-artifact@v3`: 上传构建产物
- `actions/deploy-pages@v4`: 部署到 GitHub Pages

**触发条件**:
- 推送到 `main` 分支
- 可选：手动触发（workflow_dispatch）

### 3. Package.json Scripts

**新增脚本**:
```json
{
  "scripts": {
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

现有的 `build` 和 `preview` 脚本已经满足需求，无需修改。

### 4. GitHub Repository Settings

**需要配置的设置**:
- **Pages Source**: 设置为 GitHub Actions
- **Permissions**: 确保 GITHUB_TOKEN 有写入权限

## Data Models

不涉及数据模型变更，部署过程仅处理静态文件。

## Error Handling

### Build Failures

**场景**: 构建过程中出现 TypeScript 错误或依赖问题

**处理方式**:
- GitHub Actions 工作流会自动失败并显示错误日志
- 开发者可以在 Actions 标签页查看详细错误信息
- 修复错误后重新推送代码会触发新的部署

### Deployment Failures

**场景**: 部署到 GitHub Pages 失败

**处理方式**:
- 检查 GitHub Pages 设置是否正确
- 确认 GITHUB_TOKEN 权限
- 查看 Actions 日志中的详细错误信息

### Asset Loading Failures

**场景**: 部署后资源加载失败（404 错误）

**处理方式**:
- 验证 `vite.config.ts` 中的 `base` 配置是否与仓库名匹配
- 检查资源路径是否使用了绝对路径
- 使用浏览器开发者工具检查实际请求的 URL

## Testing Strategy

### Local Testing

**测试生产构建**:
```bash
npm run build
npm run preview
```

这将在本地启动一个预览服务器，模拟生产环境。

**验证项**:
- 应用是否正常加载
- 所有功能是否正常工作
- 静态资源是否正确加载
- 路由是否正常工作

### Deployment Testing

**首次部署后验证**:
1. 访问 GitHub Pages URL
2. 测试所有游戏功能（人机对战、玩家对战）
3. 检查浏览器控制台是否有错误
4. 测试不同浏览器的兼容性
5. 验证所有棋子图片是否正确显示

### Continuous Verification

**每次部署后**:
- 自动化工作流会报告部署状态
- 访问应用 URL 进行快速功能检查
- 监控 GitHub Actions 日志

## Implementation Notes

### Base Path Considerations

GitHub Pages 的 URL 结构为：`https://<username>.github.io/<repository>/`

因此需要在 Vite 配置中设置正确的 base path。如果仓库名为 `chess-game`，则 base 应设置为 `/chess-game/`。

### Asset References

确保所有资源引用使用：
- 相对路径（推荐）
- 或通过 Vite 的 `import` 语法导入

避免使用硬编码的绝对路径。

### Caching Strategy

GitHub Pages 会自动处理静态资源的缓存。Vite 构建时会为资源文件生成哈希文件名，确保缓存失效策略正确。

### Security

- 使用 GitHub 提供的 `GITHUB_TOKEN`，无需额外配置密钥
- 工作流使用官方 actions，确保安全性
- 部署的是静态文件，不涉及服务器端代码或敏感信息

## Deployment Workflow Details

### Permissions

工作流需要以下权限：
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Concurrency

防止多个部署同时进行：
```yaml
concurrency:
  group: "pages"
  cancel-in-progress: false
```

### Environment

使用 GitHub Pages 环境：
```yaml
environment:
  name: github-pages
  url: ${{ steps.deployment.outputs.page_url }}
```

## Documentation Updates

### README.md

需要添加的内容：
1. **部署状态徽章**（可选）
2. **在线演示链接**
3. **部署说明**
4. **本地预览生产构建的说明**

### 示例内容

```markdown
## Live Demo

🎮 [Play Chess Game](https://username.github.io/chess-game/)

## Deployment

This project is automatically deployed to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment

The deployment workflow can also be triggered manually from the Actions tab.

### Local Production Preview

To test the production build locally:

\`\`\`bash
npm run build
npm run preview
\`\`\`
```

## Rollback Strategy

如果部署出现问题：
1. 回滚代码到上一个工作版本
2. 推送到主分支触发重新部署
3. 或者在 GitHub Pages 设置中临时禁用站点

## Future Enhancements

可能的改进方向：
- 添加部署预览（PR 预览）
- 集成性能监控
- 添加自动化测试到部署流程
- 配置自定义域名
