# Vue 3 学习项目

基于 Vite 的 Vue 3 + TypeScript 学习项目，重点掌握 Composition API 和现代 Vue 生态。

## 技术栈

- **Vue** 3.5 — Composition API + `<script setup>`
- **TypeScript** 5.x
- **Vite** — 构建工具
- **Element Plus** — UI 组件库
- **Pinia** — 状态管理
- **ESLint** + **Prettier** — 代码规范
- **Sass** — CSS 预处理器

## 开发

```bash
pnpm install

# 启动开发服务器
pnpm dev           # http://localhost:5173

# 生产构建
pnpm build

# 类型检查
pnpm typecheck

# 代码检查与格式化
pnpm lint
pnpm format
```

## 学习内容

- Composition API（ref、reactive、computed、watch、watchEffect）
- `<script setup>` 语法糖
- 组件通信（defineProps、defineEmits、provide/inject）
- 生命周期钩子（onMounted、onUnmounted 等）
- 自定义 Hooks（composables）
- Vue Router 4 路由
- Pinia 状态管理
- Element Plus 组件使用与主题定制
- TypeScript 与 Vue 的深度集成
