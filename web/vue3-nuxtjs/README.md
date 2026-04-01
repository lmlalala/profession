# Nuxt 3 SSR 学习项目

基于 Nuxt 3 的服务端渲染学习项目，在 Vue 3 基础上掌握 SSR/SSG 开发模式。

## 技术栈

- **Nuxt** 3.x — SSR/SSG 框架
- **Vue** 3.5 + **Vue Router** 4
- **TypeScript** 5.x
- **Element Plus** — UI 组件库（通过 @element-plus/nuxt 集成）
- **Pinia** — 状态管理（通过 @pinia/nuxt 集成）
- **ESLint** + **Prettier** — 代码规范
- **Sass** — CSS 预处理器

## 开发

```bash
pnpm install

# 启动开发服务器
pnpm dev           # http://localhost:3000

# 生产构建
pnpm build

# 静态生成（SSG）
pnpm generate

# 预览构建产物
pnpm preview

# 类型检查
pnpm typecheck

# 代码检查与格式化
pnpm lint
pnpm format
```

## 学习内容

- Nuxt 3 目录结构约定（pages/、components/、composables/、server/）
- 文件系统路由（自动路由生成）
- 服务端渲染（SSR）与静态生成（SSG）
- 数据获取（useFetch、useAsyncData、$fetch）
- 服务端 API 路由（server/api/）
- 中间件（middleware）
- 插件系统（plugins）
- SEO 优化（useHead、useSeoMeta）
- Nuxt Modules 生态
