# TypeScript 渐进式学习

TypeScript 学习项目，涵盖基础类型到高级特性，适合从零开始系统学习 TypeScript。

## 技术栈

- **TypeScript** 5.x
- **ts-node** — 直接运行 .ts 文件
- **ts-node-dev** — 开发模式热重载
- **ESLint** + **Prettier** — 代码规范

## 开发

```bash
pnpm install

# 运行入口文件
pnpm dev

# 热重载模式（文件修改后自动重新运行）
pnpm watch

# 编译为 JavaScript
pnpm build

# 类型检查
pnpm typecheck

# 代码检查与格式化
pnpm lint
pnpm format
```

## 学习内容

- 基础类型（string、number、boolean、array、tuple、enum）
- 接口与类型别名（interface vs type）
- 函数类型与重载
- 泛型（Generic）
- 类与继承
- 高级类型（联合、交叉、条件类型、映射类型）
- 类型体操（infer、模板字面量类型）
- 装饰器
- 模块系统
- 声明文件（.d.ts）
