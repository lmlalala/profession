# Next.js SSR 学习项目

基于 Next.js 16 的服务端渲染学习项目，在 React 基础上掌握 SSR/SSG 开发模式。

## 技术栈

- **Next.js** 16 — SSR/SSG 框架（App Router）
- **React** 19
- **TypeScript** 5.x
- **Ant Design** 6 — UI 组件库
- **Tailwind CSS** 4 — 原子化 CSS
- **Redux Toolkit** — 状态管理
- **ESLint** + **Prettier** — 代码规范
- **Sass** — CSS 预处理器

## 开发

```bash
pnpm install

# 启动开发服务器
pnpm dev           # http://localhost:3000

# 生产构建
pnpm build

# 启动生产服务器
pnpm start

# 代码检查与格式化
pnpm lint
pnpm format
```

## 学习内容

- App Router 目录结构（app/、layout、page、loading、error）
- 服务端组件（Server Components）与客户端组件（Client Components）
- 数据获取（fetch、Server Actions）
- 路由（动态路由、路由组、平行路由、拦截路由）
- 中间件（middleware.ts）
- API 路由（Route Handlers）
- 静态生成（SSG）与增量静态再生成（ISR）
- 图片优化（next/image）与字体优化（next/font）
- Tailwind CSS 原子化样式
- SEO 优化（Metadata API）
