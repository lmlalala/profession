# Profession Study

前端技术栈学习项目，涵盖 HTML/CSS/JS 基础、TypeScript、Vue 2/3、React、SSR 框架及工具库开发，用于基础知识学习、面试刷题与原理解析。

## 项目结构

```
profession/
├── web/
│   ├── html-css-js/       # HTML5 + CSS3 + JavaScript 交互式教学站点
│   ├── typescript/         # TypeScript 渐进式学习（基础类型到高级特性）
│   ├── vue2/               # Vue 2 学习项目（Options API + Vue CLI）
│   ├── vue3/               # Vue 3 学习项目（Composition API + Vite + Element Plus）
│   ├── vue3-nuxtjs/        # Nuxt 3 SSR 学习项目（Vue 3 + Nuxt + Element Plus）
│   ├── react/              # React 19 学习项目（Vite + Ant Design + Redux Toolkit）
│   ├── react-nextjs/       # Next.js SSR 学习项目（React 19 + Tailwind CSS + Ant Design）
│   └── format-n/           # 数字格式化工具库（BigNumber.js 精度保障，含完整单元测试）
├── prettier.config.js      # 统一代码格式化配置
├── .husky/                 # Git Hooks（提交前自动格式化 + 单元测试）
└── .vscode/                # VSCode 编辑器配置（保存时自动格式化）
```

## 技术栈总览

| 子项目       | 核心技术              | 构建工具  | UI 框架                 | 状态管理      |
| ------------ | --------------------- | --------- | ----------------------- | ------------- |
| html-css-js  | HTML5 / CSS3 / ES6+   | Vite      | —                       | —             |
| typescript   | TypeScript 5          | tsc       | —                       | —             |
| vue2         | Vue 2.6               | Vue CLI 5 | —                       | —             |
| vue3         | Vue 3.5 + TypeScript  | Vite      | Element Plus            | Pinia         |
| vue3-nuxtjs  | Nuxt 3 + Vue 3        | Nuxt      | Element Plus            | Pinia         |
| react        | React 19 + TypeScript | Vite      | Ant Design 6            | Redux Toolkit |
| react-nextjs | Next.js 16 + React 19 | Next.js   | Ant Design 6 + Tailwind | Redux Toolkit |
| format-n     | TypeScript            | tsup      | —                       | —             |

## 快速开始

### 环境要求

- **Node.js** >= 18
- **pnpm** >= 9（推荐使用 pnpm 作为包管理器）

### 安装依赖

```bash
# 根目录安装（husky、lint-staged、prettier）
pnpm install

# 进入子项目安装依赖
cd web/html-css-js && pnpm install
cd web/vue3 && pnpm install
# ... 其他子项目同理
```

### 启动开发

```bash
# HTML/CSS/JS 交互式教学站点
cd web/html-css-js && pnpm dev        # http://localhost:3000

# TypeScript 学习
cd web/typescript && pnpm dev

# Vue 2
cd web/vue2 && pnpm serve              # http://localhost:8080

# Vue 3
cd web/vue3 && pnpm dev                # http://localhost:5173

# Nuxt 3
cd web/vue3-nuxtjs && pnpm dev         # http://localhost:3000

# React
cd web/react && pnpm dev               # http://localhost:5173

# Next.js
cd web/react-nextjs && pnpm dev        # http://localhost:3000

# format-n 工具库
cd web/format-n && pnpm dev            # tsup watch 模式
cd web/format-n && pnpm test           # 运行单元测试
```

## 代码规范

### 格式化

项目使用 **Prettier** 统一代码风格，配置文件为根目录 `prettier.config.js`：

- 单引号、行尾分号、尾随逗号（es5）、120 字符换行
- VSCode 保存时自动格式化（需安装 Prettier 插件）

### Git Hooks

通过 **Husky** + **lint-staged** 在每次提交时自动执行：

1. **Prettier 格式化** — 对暂存的 JS/TS/Vue/CSS/JSON 文件自动格式化
2. **单元测试** — 运行 format-n 的 Vitest 测试套件，全部通过才允许提交

### Lint

各子项目独立配置 ESLint，支持 `pnpm lint` 检查和自动修复。

## 子项目说明

各子项目的详细说明请查看对应目录下的 README.md：

- [`web/html-css-js`](web/html-css-js/) — 交互式前端基础教学
- [`web/typescript`](web/typescript/) — TypeScript 渐进式学习
- [`web/vue2`](web/vue2/) — Vue 2 基础学习
- [`web/vue3`](web/vue3/) — Vue 3 + Composition API 学习
- [`web/vue3-nuxtjs`](web/vue3-nuxtjs/) — Nuxt 3 SSR 学习
- [`web/react`](web/react/) — React 19 学习
- [`web/react-nextjs`](web/react-nextjs/) — Next.js SSR 学习
- [`web/format-n`](web/format-n/) — 数字格式化工具库

## License

MIT
