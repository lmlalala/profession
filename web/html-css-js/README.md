# HTML5 + CSS3 + JavaScript 交互式教学

基于 Vite 的纯前端交互式教学站点，集成 Monaco Editor（VS Code 同款编辑器），所有代码示例均可在线编辑并实时运行查看效果。

## 特性

- **交互式代码编辑** — 基于 Monaco Editor，支持语法高亮、智能提示、Ctrl+Enter 运行
- **多模式执行** — Console 模式（控制台输出）、DOM 模式（iframe 实时预览）、Canvas 模式（画布绘制）
- **多 Tab 编辑** — HTML/CSS/JS 分 Tab 编辑，合并渲染到 iframe，类似 CodePen 体验
- **深色/浅色主题** — 支持一键切换，编辑器和页面同步切换
- **面试高频标注** — 重要知识点标注面试频率，方便针对性复习

## 页面目录

| 页面                   | 内容                                                       | 交互方式                   |
| ---------------------- | ---------------------------------------------------------- | -------------------------- |
| `html5.html`           | HTML5 语义化、Canvas、Web Storage、拖拽 API、data 属性     | DOM + Canvas + Console     |
| `css-layout.html`      | 选择器优先级、盒模型、Flexbox、Grid、定位                  | 多 Tab（HTML+CSS）实时预览 |
| `css-animation.html`   | transition、transform、animation、filter、渐变             | 多 Tab（HTML+CSS）实时预览 |
| `css-interview.html`   | BFC、层叠上下文、居中方案、响应式、伪元素、性能优化        | 多 Tab（HTML+CSS）实时预览 |
| `js-dom.html`          | DOM 查询、元素操作、属性样式、事件系统、事件委托、表单     | DOM 多 Tab + Console       |
| `js-basic.html`        | 数据类型、作用域、闭包、this、原型链、数组/对象/字符串方法 | Console 模式               |
| `js-es6.html`          | 解构、模板字符串、Symbol、迭代器、Proxy、ES2020+           | Console 模式               |
| `js-async.html`        | 事件循环、Promise、async/await、并发控制                   | Console 模式               |
| `js-advanced.html`     | 手写 call/bind/new、深拷贝、防抖节流、设计模式             | Console 模式 + 交互演示    |
| `vue2-principle.html`  | 响应式原理、Dep/Watcher、虚拟 DOM、diff 算法               | Console + 交互演示         |
| `vue3-principle.html`  | Proxy 响应式、effect/track/trigger、Composition API        | Console + Mini Vue3        |
| `react-principle.html` | JSX 编译、Fiber 架构、diff 算法、Hooks 原理                | Console + Mini React       |

## 开发

```bash
pnpm install
pnpm dev          # 启动 Vite 开发服务器，默认 http://localhost:3000
```

## 项目结构

```
html-css-js/
├── index.html          # 首页
├── pages/              # 各教学页面
│   ├── html5.html
│   ├── css-layout.html
│   ├── css-animation.html
│   ├── css-interview.html
│   ├── js-dom.html
│   ├── js-basic.html
│   ├── js-es6.html
│   ├── js-async.html
│   ├── js-advanced.html
│   ├── vue2-principle.html
│   ├── vue3-principle.html
│   └── react-principle.html
├── js/
│   ├── code-editor.js  # Monaco Editor 集成（代码编辑、执行、多 Tab 支持）
│   └── nav.js          # 导航组件（自动生成侧边栏）
├── css/
│   └── common.css      # 全局样式（深色/浅色主题、布局、组件）
├── vite.config.js
└── eslint.config.js
```

## 代码块使用方式

### 单语言模式

```html
<!-- Console 模式：运行 JS，输出到控制台 -->
<div class="code-block" data-mode="console">console.log('Hello World')</div>

<!-- Canvas 模式：绘制到画布 -->
<div class="code-block" data-mode="canvas">const ctx = canvas.getContext('2d') ctx.fillRect(10, 10, 100, 80)</div>

<!-- 只读展示 -->
<div class="code-block" data-lang="css" data-readonly>.container { display: flex; }</div>
```

### 多 Tab 模式（HTML + CSS + JS 联合预览）

```html
<div class="code-block" data-tabs="html,css" data-mode="dom">
  <div data-tab="html"><div class="box">内容</div></div>
  <div data-tab="css">.box { color: red; }</div>
</div>
<div class="demo-box"></div>
```
