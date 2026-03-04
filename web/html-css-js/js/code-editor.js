/**
 * code-editor.js
 * 基于 Monaco Editor（VS Code 同款）的代码编辑器组件
 *
 * 功能：
 *  1. 自动将页面中所有 .code-block 转换为可编辑的 Monaco 实例
 *  2. 每个 .code-block 后面的 .demo-box 中的运行按钮自动绑定到编辑器内容
 *  3. 支持 console / canvas / dom 三种输出模式（通过 data-mode 指定）
 *  4. 支持 Ctrl+Enter 快捷键运行
 *  5. 跟随页面主题（暗色/亮色）自动切换
 *
 * 用法（HTML 中无需修改，自动初始化）：
 *   <div class="code-block" data-mode="console">...代码...</div>
 *   <div class="demo-box">
 *     <button onclick="...">▶ 运行</button>
 *     <div class="console-output" id="outX">...</div>
 *   </div>
 *
 * Canvas 模式：data-mode="canvas"，需在 .demo-box 内有 <canvas> 元素
 * DOM 模式：  data-mode="dom"，在 .demo-box 内自动插入 iframe
 */

const MONACO_VERSION = '0.52.2'
const MONACO_BASE    = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min`

// ── Monaco 加载 ──────────────────────────────────────────────────────────────

let _monacoReady = null

function loadMonaco() {
  if (_monacoReady) return _monacoReady
  _monacoReady = new Promise(resolve => {
    // require.js 配置
    const script = document.createElement('script')
    script.src = `${MONACO_BASE}/vs/loader.js`
    script.onload = () => {
      window.require.config({ paths: { vs: `${MONACO_BASE}/vs` } })
      window.require(['vs/editor/editor.main'], () => resolve(window.monaco))
    }
    document.head.appendChild(script)
  })
  return _monacoReady
}

// ── 工具函数 ─────────────────────────────────────────────────────────────────

/** 从 .code-block 的 innerHTML 中提取纯文本代码（去掉 span 标签和 HTML 实体） */
function extractCode(el) {
  const tmp = document.createElement('div')
  tmp.innerHTML = el.innerHTML
  return tmp.textContent
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

/** 当前主题 */
function getMonacoTheme() {
  return (document.documentElement.getAttribute('data-theme') || 'dark') === 'light'
    ? 'vs'
    : 'vs-dark'
}

/** 根据代码行数计算合适的编辑器高度（最小 80px，最大 520px） */
function calcHeight(code) {
  const lines = code.split('\n').length
  return Math.min(Math.max(lines * 20 + 24, 80), 520)
}

// ── 控制台输出写入 ────────────────────────────────────────────────────────────

function writeToConsole(outputEl, args, type) {
  const line = document.createElement('div')
  line.className = type
  line.textContent = args.map(a => {
    if (a === null)      return 'null'
    if (a === undefined) return 'undefined'
    if (typeof a === 'object') {
      try { return JSON.stringify(a, null, 2) } catch { return String(a) }
    }
    return String(a)
  }).join(' ')
  outputEl.appendChild(line)
  outputEl.scrollTop = outputEl.scrollHeight
}

// ── 执行逻辑 ─────────────────────────────────────────────────────────────────

function runConsole(code, outputEl) {
  outputEl.innerHTML = ''
  const orig = {
    log:   console.log,
    warn:  console.warn,
    error: console.error,
    info:  console.info,
  }
  console.log   = (...a) => { orig.log(...a);   writeToConsole(outputEl, a, 'log') }
  console.warn  = (...a) => { orig.warn(...a);  writeToConsole(outputEl, a, 'warn') }
  console.error = (...a) => { orig.error(...a); writeToConsole(outputEl, a, 'error') }
  console.info  = (...a) => { orig.info(...a);  writeToConsole(outputEl, a, 'info') }
  try {
    new Function(code)() // eslint-disable-line no-new-func
  } catch (e) {
    writeToConsole(outputEl, [`❌ ${e.message}`], 'error')
  } finally {
    console.log = orig.log; console.warn = orig.warn
    console.error = orig.error; console.info = orig.info
  }
}

function runCanvas(code, canvasEl) {
  const ctx = canvasEl.getContext('2d')
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
  try {
    // 只注入 canvas，ctx 由代码自行获取，避免与代码中的 const ctx 重复声明冲突
    new Function('canvas', code)(canvasEl) // eslint-disable-line no-new-func
  } catch (e) {
    ctx.fillStyle = '#ff6584'
    ctx.font = '13px monospace'
    ctx.fillText(`❌ ${e.message}`, 10, 24)
  }
}

function runDom(code, iframeEl) {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark'
  const bg = theme === 'light' ? '#f5f6fa' : '#1a1d27'
  const fg = theme === 'light' ? '#1a1d2e' : '#e2e8f0'
  iframeEl.srcdoc = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: ${bg}; color: ${fg}; padding: 12px; font-size: 14px; line-height: 1.6; }
</style></head>
<body><script>
try { ${code.replace(/<\/script>/g, '<' + '/script>')} }
catch(e) { document.body.innerHTML = '<pre style="color:#ff6584">❌ ' + e.message + '</pre>' }
</script></body></html>`
  iframeEl.onload = () => {
    try {
      const h = iframeEl.contentDocument.body.scrollHeight
      iframeEl.style.height = `${Math.max(h + 24, 120)}px`
    } catch { /* cross-origin */ }
  }
}

// ── 语言配置 ─────────────────────────────────────────────────────────────────

const LANG_CONFIG = {
  javascript: { label: 'JS',   color: 'rgba(247,223,30,0.15)',  border: 'rgba(247,223,30,0.4)',  text: '#f7df1e' },
  html:       { label: 'HTML', color: 'rgba(228,77,38,0.15)',   border: 'rgba(228,77,38,0.4)',   text: '#e44d26' },
  css:        { label: 'CSS',  color: 'rgba(38,77,228,0.15)',   border: 'rgba(38,77,228,0.4)',   text: '#6496e0' },
  typescript: { label: 'TS',   color: 'rgba(49,120,198,0.15)',  border: 'rgba(49,120,198,0.4)',  text: '#3178c6' },
  json:       { label: 'JSON', color: 'rgba(0,212,170,0.12)',   border: 'rgba(0,212,170,0.3)',   text: '#00d4aa' },
}

// ── 核心：将 .code-block 转为 Monaco 编辑器 ──────────────────────────────────

async function initCodeBlock(codeBlockEl) {
  const monaco = await loadMonaco()

  // 提取原始代码
  const originalCode = extractCode(codeBlockEl)

  // 读取配置属性
  const lang     = codeBlockEl.dataset.lang || 'javascript'
  const mode     = codeBlockEl.dataset.mode || 'console'
  const readonly = codeBlockEl.hasAttribute('data-readonly')
  const langCfg  = LANG_CONFIG[lang] || LANG_CONFIG.javascript

  // 计算编辑器高度
  const height = calcHeight(originalCode)

  // 创建编辑器容器（替换 .code-block）
  const wrapper = document.createElement('div')
  wrapper.className = 'monaco-editor-wrapper'
  wrapper.style.cssText = `
    position: relative;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm, 6px);
    overflow: hidden;
    margin: 0.75rem 0;
  `

  // 工具栏
  const toolbar = document.createElement('div')
  toolbar.className = 'monaco-toolbar'

  const badgeStyle = `background:${langCfg.color};color:${langCfg.text};border:1px solid ${langCfg.border};`
  if (readonly) {
    toolbar.innerHTML = `
      <span class="monaco-lang-badge" style="${badgeStyle}">${langCfg.label}</span>
      <span class="monaco-hint">只读展示</span>
    `
  } else {
    toolbar.innerHTML = `
      <span class="monaco-lang-badge" style="${badgeStyle}">${langCfg.label}</span>
      <span class="monaco-hint">Ctrl+Enter 运行</span>
      <button class="monaco-btn-reset" title="重置代码">↺ 重置</button>
      <button class="monaco-btn-run">▶ 运行</button>
    `
  }

  // Monaco 挂载点
  const editorEl = document.createElement('div')
  editorEl.style.height = `${height}px`

  wrapper.appendChild(toolbar)
  wrapper.appendChild(editorEl)

  // 替换原 .code-block
  codeBlockEl.replaceWith(wrapper)

  // 初始化 Monaco
  const editor = monaco.editor.create(editorEl, {
    value: originalCode,
    language: lang,
    theme: getMonacoTheme(),
    readOnly: readonly,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
    fontLigatures: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'off',
    renderLineHighlight: readonly ? 'none' : 'line',
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto',
      verticalScrollbarSize: 6,
      horizontalScrollbarSize: 6,
    },
    overviewRulerLanes: 0,
    padding: { top: 10, bottom: 10 },
    contextmenu: !readonly,
    quickSuggestions: !readonly,
    suggestOnTriggerCharacters: !readonly,
    cursorStyle: readonly ? 'line-thin' : 'line',
  })

  // 自动调整高度（最多 520px）
  editor.onDidChangeModelContent(() => {
    const lineCount = editor.getModel().getLineCount()
    const newH = Math.min(Math.max(lineCount * 20 + 24, 80), 520)
    editorEl.style.height = `${newH}px`
    editor.layout()
  })

  // 主题跟随切换
  const themeObserver = new MutationObserver(() => {
    monaco.editor.setTheme(getMonacoTheme())
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  // ── 找到对应的 demo-box ──────────────────────────────────────────────────
  // wrapper 替换了 code-block，下一个兄弟元素应该是 demo-box
  const demoBox = wrapper.nextElementSibling

  // 确定输出目标
  let outputEl  = null
  let canvasEl  = null
  let iframeEl  = null

  if (demoBox && demoBox.classList.contains('demo-box')) {
    if (mode === 'console') {
      outputEl = demoBox.querySelector('.console-output')
    } else if (mode === 'canvas') {
      canvasEl = demoBox.querySelector('canvas')
    } else if (mode === 'dom') {
      iframeEl = demoBox.querySelector('iframe')
      if (!iframeEl) {
        iframeEl = document.createElement('iframe')
        iframeEl.style.cssText = 'width:100%;border:none;min-height:120px;display:block;margin-top:0.5rem;border-radius:4px;'
        iframeEl.sandbox = 'allow-scripts'
        demoBox.appendChild(iframeEl)
      }
    }
  }

  // ── 运行函数 ─────────────────────────────────────────────────────────────
  function run() {
    const code = editor.getValue()
    if (mode === 'canvas' && canvasEl) {
      runCanvas(code, canvasEl)
    } else if (mode === 'dom' && iframeEl) {
      runDom(code, iframeEl)
    } else if (outputEl) {
      runConsole(code, outputEl)
    }
  }

  // Ctrl+Enter 运行
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
    run
  )

  // 工具栏按钮（只读模式下没有这些按钮）
  if (!readonly) {
    toolbar.querySelector('.monaco-btn-run').addEventListener('click', run)
    toolbar.querySelector('.monaco-btn-reset').addEventListener('click', () => {
      editor.setValue(originalCode)
      editor.focus()
    })
  }

  // ── 劫持 demo-box 中原有的运行按钮 ──────────────────────────────────────
  if (!readonly && demoBox) {
    // 找到所有"运行"类按钮（含 onclick 的 btn-primary）
    demoBox.querySelectorAll('.btn-primary').forEach(btn => {
      const origOnclick = btn.getAttribute('onclick')
      if (!origOnclick) return
      // 保留原始 onclick 逻辑（它会执行 script 中的函数），
      // 但先把编辑器内容同步到全局 __editorCode 供脚本读取
      btn.addEventListener('click', () => {
        // 将当前编辑器代码注入到全局，供页面脚本中的 runner 使用
        window.__latestEditorCode = editor.getValue()
      }, true) // capture 阶段，在 onclick 之前执行
    })
  }

  return { editor, run }
}

// ── 注入工具栏样式 ────────────────────────────────────────────────────────────

function injectToolbarStyle() {
  if (document.getElementById('monaco-toolbar-style')) return
  const style = document.createElement('style')
  style.id = 'monaco-toolbar-style'
  style.textContent = `
.monaco-editor-wrapper {
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-sm, 6px) !important;
  overflow: hidden !important;
  margin: 0.75rem 0 !important;
}
.monaco-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: var(--color-surface-2, #22263a);
  border-bottom: 1px solid var(--color-border, #2e3350);
  font-size: 0.72rem;
  user-select: none;
}
.monaco-lang-badge {
  background: rgba(108,99,255,0.2);
  color: var(--color-primary-light, #8b85ff);
  border: 1px solid rgba(108,99,255,0.35);
  padding: 0.1rem 0.45rem;
  border-radius: 3px;
  font-weight: 700;
  letter-spacing: 0.05em;
  font-size: 0.68rem;
}
.monaco-hint {
  flex: 1;
  color: var(--color-text-muted, #8892b0);
  font-size: 0.68rem;
}
.monaco-btn-run {
  display: inline-flex; align-items: center; gap: 0.25rem;
  padding: 0.22rem 0.65rem;
  background: var(--color-primary, #6c63ff);
  color: #fff;
  border: none; border-radius: 3px;
  cursor: pointer; font-size: 0.72rem; font-weight: 600;
  transition: background 0.15s;
  font-family: inherit;
}
.monaco-btn-run:hover { background: var(--color-primary-light, #8b85ff); }
.monaco-btn-reset {
  padding: 0.22rem 0.55rem;
  background: transparent;
  color: var(--color-text-muted, #8892b0);
  border: 1px solid var(--color-border, #2e3350);
  border-radius: 3px; cursor: pointer; font-size: 0.72rem;
  transition: color 0.15s, border-color 0.15s;
  font-family: inherit;
}
.monaco-btn-reset:hover {
  color: var(--color-text, #e2e8f0);
  border-color: var(--color-text-muted, #8892b0);
}
/* 修正 Monaco 在暗色/亮色主题下的背景融合 */
[data-theme="dark"] .monaco-editor .margin,
[data-theme="dark"] .monaco-editor-background { background-color: #161b2e !important; }
[data-theme="light"] .monaco-editor .margin,
[data-theme="light"] .monaco-editor-background { background-color: #f0f2f8 !important; }
  `
  document.head.appendChild(style)
}

// ── 入口：自动初始化所有 .code-block ─────────────────────────────────────────

async function initAllCodeBlocks() {
  injectToolbarStyle()
  const blocks = Array.from(document.querySelectorAll('.code-block'))
  // 串行初始化，避免 Monaco 并发加载问题
  for (const block of blocks) {
    await initCodeBlock(block)
  }
}

document.addEventListener('DOMContentLoaded', initAllCodeBlocks)

export { initAllCodeBlocks, initCodeBlock, runConsole, runCanvas, runDom }
