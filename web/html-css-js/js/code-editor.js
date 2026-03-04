/**
 * code-editor.js
 * 基于 Monaco Editor（VS Code 同款）的代码编辑器组件
 *
 * 单语言模式（默认）：
 *   <div class="code-block" data-mode="console|canvas|dom" [data-lang="javascript"] [data-readonly]>
 *     代码内容
 *   </div>
 *
 * 多 Tab 模式（HTML+CSS+JS 联合预览，类 CodePen）：
 *   <div class="code-block" data-tabs="html,css" data-mode="dom">
 *     <div data-tab="html">HTML 代码</div>
 *     <div data-tab="css">CSS 代码</div>
 *   </div>
 *
 * data-mode：console（默认）| canvas | dom
 * data-lang：javascript（默认）| html | css | typescript | json
 * data-readonly：布尔属性，只读展示
 * data-tabs：逗号分隔的语言列表，如 "html,css" 或 "html,css,js"
 */

const MONACO_VERSION = '0.52.2';
const MONACO_BASE = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min`;

// ── Monaco 加载 ──────────────────────────────────────────────────────────────

let _monacoReady = null;

function loadMonaco() {
  if (_monacoReady) return _monacoReady;
  _monacoReady = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = `${MONACO_BASE}/vs/loader.js`;
    script.onload = () => {
      window.require.config({ paths: { vs: `${MONACO_BASE}/vs` } });
      window.require(['vs/editor/editor.main'], () => resolve(window.monaco));
    };
    document.head.appendChild(script);
  });
  return _monacoReady;
}

// ── 工具函数 ─────────────────────────────────────────────────────────────────

/** 从元素的 innerHTML 中提取纯文本代码（去掉 span 标签和 HTML 实体） */
function extractCode(el) {
  const tmp = document.createElement('div');
  tmp.innerHTML = el.innerHTML;
  return tmp.textContent
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/** 当前主题对应的 Monaco 主题名 */
function getMonacoTheme() {
  return (document.documentElement.getAttribute('data-theme') || 'dark') === 'light' ? 'vs' : 'vs-dark';
}

/** 根据代码行数计算合适的编辑器高度（最小 80px，最大 520px） */
function calcHeight(code) {
  const lines = code.split('\n').length;
  return Math.min(Math.max(lines * 20 + 24, 80), 520);
}

// ── 语言配置 ─────────────────────────────────────────────────────────────────

const LANG_CONFIG = {
  javascript: {
    label: 'JS',
    color: 'rgba(247,223,30,0.15)',
    border: 'rgba(247,223,30,0.4)',
    text: '#f7df1e',
  },
  html: {
    label: 'HTML',
    color: 'rgba(228,77,38,0.15)',
    border: 'rgba(228,77,38,0.4)',
    text: '#e44d26',
  },
  css: {
    label: 'CSS',
    color: 'rgba(38,77,228,0.15)',
    border: 'rgba(38,77,228,0.4)',
    text: '#6496e0',
  },
  typescript: {
    label: 'TS',
    color: 'rgba(49,120,198,0.15)',
    border: 'rgba(49,120,198,0.4)',
    text: '#3178c6',
  },
  json: {
    label: 'JSON',
    color: 'rgba(0,212,170,0.12)',
    border: 'rgba(0,212,170,0.3)',
    text: '#00d4aa',
  },
  js: {
    label: 'JS',
    color: 'rgba(247,223,30,0.15)',
    border: 'rgba(247,223,30,0.4)',
    text: '#f7df1e',
  },
};

// ── 控制台输出写入 ────────────────────────────────────────────────────────────

function writeToConsole(outputEl, args, type) {
  const line = document.createElement('div');
  line.className = type;
  line.textContent = args
    .map((a) => {
      if (a === null) return 'null';
      if (a === undefined) return 'undefined';
      if (typeof a === 'object') {
        try {
          return JSON.stringify(a, null, 2);
        } catch {
          return String(a);
        }
      }
      return String(a);
    })
    .join(' ');
  outputEl.appendChild(line);
  outputEl.scrollTop = outputEl.scrollHeight;
}

// ── 执行逻辑 ─────────────────────────────────────────────────────────────────

function runConsole(code, outputEl) {
  outputEl.innerHTML = '';
  const orig = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
  };
  const hijack = () => {
    console.log = (...a) => {
      orig.log(...a);
      writeToConsole(outputEl, a, 'log');
    };
    console.warn = (...a) => {
      orig.warn(...a);
      writeToConsole(outputEl, a, 'warn');
    };
    console.error = (...a) => {
      orig.error(...a);
      writeToConsole(outputEl, a, 'error');
    };
    console.info = (...a) => {
      orig.info(...a);
      writeToConsole(outputEl, a, 'info');
    };
  };
  const restore = () => {
    console.log = orig.log;
    console.warn = orig.warn;
    console.error = orig.error;
    console.info = orig.info;
  };
  hijack();
  try {
    // 用 async Function 支持顶层 await
    const result = new Function(`return (async () => { ${code} })()`)(); // eslint-disable-line no-new-func
    if (result && typeof result.then === 'function') {
      result.catch((e) => writeToConsole(outputEl, [`❌ ${e.message}`], 'error')).finally(restore);
    } else {
      restore();
    }
  } catch (e) {
    writeToConsole(outputEl, [`❌ ${e.message}`], 'error');
    restore();
  }
}

function runCanvas(code, canvasEl) {
  const ctx = canvasEl.getContext('2d');
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  try {
    // 只注入 canvas，ctx 由代码自行获取，避免与代码中的 const ctx 重复声明冲突
    new Function('canvas', code)(canvasEl); // eslint-disable-line no-new-func
  } catch (e) {
    ctx.fillStyle = '#ff6584';
    ctx.font = '13px monospace';
    ctx.fillText(`❌ ${e.message}`, 10, 24);
  }
}

function runDom(code, iframeEl) {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const bg = theme === 'light' ? '#f5f6fa' : '#1a1d27';
  const fg = theme === 'light' ? '#1a1d2e' : '#e2e8f0';
  iframeEl.srcdoc = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: ${bg}; color: ${fg}; padding: 12px; font-size: 14px; line-height: 1.6; }
</style></head>
<body><script>
try { ${code.replace(/<\/script>/g, '<' + '/script>')} }
catch(e) { document.body.innerHTML = '<pre style="color:#ff6584">❌ ' + e.message + '</pre>' }
</script></body></html>`;
  iframeEl.onload = () => {
    try {
      const h = iframeEl.contentDocument.body.scrollHeight;
      iframeEl.style.height = `${Math.max(h + 24, 120)}px`;
    } catch {
      /* cross-origin */
    }
  };
}

/**
 * 多 Tab 模式的运行函数：将 HTML + CSS + JS 合并渲染到 iframe
 * @param {{ html?: object, css?: object, js?: object }} editors - Monaco editor 实例 map
 * @param {HTMLIFrameElement} iframeEl
 */
function runMultiTab(editors, iframeEl) {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const bg = theme === 'light' ? '#ffffff' : '#1a1d27';
  const fg = theme === 'light' ? '#1a1d2e' : '#e2e8f0';

  const html = editors.html ? editors.html.getValue() : '';
  const css = editors.css ? editors.css.getValue() : '';
  const js = editors.js ? editors.js.getValue() : '';

  const escapedJs = js.replace(/<\/script>/g, '<' + '/script>');

  iframeEl.srcdoc = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; background: ${bg}; color: ${fg}; margin: 0; padding: 12px; font-size: 14px; line-height: 1.6; }
${css}
</style></head>
<body>
${html}
${
  escapedJs
    ? `<script>
try { ${escapedJs} }
catch(e) { document.body.insertAdjacentHTML('beforeend','<pre style="color:#ff6584;margin-top:8px">❌ '+e.message+'</pre>') }
</script>`
    : ''
}
</body></html>`;

  iframeEl.onload = () => {
    try {
      const h = iframeEl.contentDocument.body.scrollHeight;
      iframeEl.style.height = `${Math.max(h + 24, 160)}px`;
    } catch {
      /* cross-origin */
    }
  };
}

// ── 创建 Monaco 编辑器实例（公共逻辑） ────────────────────────────────────────

function createMonacoEditor(monaco, el, code, lang, readonly) {
  return monaco.editor.create(el, {
    value: code,
    language: lang === 'js' ? 'javascript' : lang,
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
      alwaysConsumeMouseWheel: false,
    },
    overviewRulerLanes: 0,
    padding: { top: 10, bottom: 10 },
    contextmenu: !readonly,
    quickSuggestions: !readonly,
    suggestOnTriggerCharacters: !readonly,
    cursorStyle: readonly ? 'line-thin' : 'line',
    mouseWheelScrollSensitivity: 1,
  });
}

// ── 多 Tab 模式：initMultiTabCodeBlock ────────────────────────────────────────

async function initMultiTabCodeBlock(codeBlockEl) {
  const monaco = await loadMonaco();

  // 解析 tab 列表，如 "html,css" 或 "html,css,js"
  const tabsAttr = codeBlockEl.dataset.tabs;
  const tabLangs = tabsAttr.split(',').map((s) => s.trim().toLowerCase());

  // 从子元素 [data-tab="xxx"] 中提取各 tab 的原始代码
  const originalCodes = {};
  tabLangs.forEach((lang) => {
    const tabEl = codeBlockEl.querySelector(`[data-tab="${lang}"]`);
    originalCodes[lang] = tabEl ? extractCode(tabEl) : '';
  });

  // ── 构建 wrapper ──────────────────────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.className = 'monaco-editor-wrapper monaco-multitab-wrapper';

  // ── 工具栏（含 Tab 切换按钮） ─────────────────────────────────────────────
  const toolbar = document.createElement('div');
  toolbar.className = 'monaco-toolbar';

  const tabsHtml = tabLangs
    .map((lang, i) => {
      const cfg = LANG_CONFIG[lang] || LANG_CONFIG.javascript;
      const activeClass = i === 0 ? ' active' : '';
      return `<button class="monaco-tab${activeClass}" data-tab-lang="${lang}" style="--tab-color:${cfg.text}">${cfg.label}</button>`;
    })
    .join('');

  toolbar.innerHTML = `
    <div class="monaco-tabs">${tabsHtml}</div>
    <span class="monaco-hint">Ctrl+Enter 运行</span>
    <button class="monaco-btn-reset" title="重置代码">↺ 重置</button>
    <button class="monaco-btn-run">▶ 运行</button>
  `;

  // ── 编辑器面板容器 ────────────────────────────────────────────────────────
  const panelsContainer = document.createElement('div');
  panelsContainer.className = 'monaco-panels';

  // 为每个 tab 创建独立的编辑器面板
  const editors = {};
  const panelEls = {};

  tabLangs.forEach((lang, i) => {
    const code = originalCodes[lang];
    const height = calcHeight(code);

    const panel = document.createElement('div');
    panel.className = 'monaco-panel';
    panel.dataset.panelLang = lang;
    panel.style.display = i === 0 ? 'block' : 'none';

    const editorEl = document.createElement('div');
    editorEl.style.height = `${height}px`;
    panel.appendChild(editorEl);
    panelsContainer.appendChild(panel);

    panelEls[lang] = { panel, editorEl };
  });

  wrapper.appendChild(toolbar);
  wrapper.appendChild(panelsContainer);

  // 替换原 .code-block
  codeBlockEl.replaceWith(wrapper);

  // 初始化各 tab 的 Monaco 实例
  tabLangs.forEach((lang) => {
    const code = originalCodes[lang];
    const { editorEl } = panelEls[lang];
    const editor = createMonacoEditor(monaco, editorEl, code, lang, false);

    // 自动调整高度
    editor.onDidChangeModelContent(() => {
      const lineCount = editor.getModel().getLineCount();
      const newH = Math.min(Math.max(lineCount * 20 + 24, 80), 520);
      editorEl.style.height = `${newH}px`;
      editor.layout();
    });

    editors[lang] = editor;
  });

  // 主题跟随切换
  const themeObserver = new MutationObserver(() => {
    monaco.editor.setTheme(getMonacoTheme());
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  // ── Tab 切换逻辑 ──────────────────────────────────────────────────────────
  let activeTab = tabLangs[0];
  toolbar.querySelectorAll('.monaco-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.tabLang;
      if (lang === activeTab) return;
      activeTab = lang;

      // 切换 tab 激活状态
      toolbar.querySelectorAll('.monaco-tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // 切换面板显示
      tabLangs.forEach((l) => {
        panelEls[l].panel.style.display = l === lang ? 'block' : 'none';
      });

      // 触发 layout 确保编辑器尺寸正确
      editors[lang]?.layout();
    });
  });

  // ── 找到对应的 demo-box，创建 iframe ─────────────────────────────────────
  const demoBox = wrapper.nextElementSibling;
  let iframeEl = null;

  if (demoBox && demoBox.classList.contains('demo-box')) {
    iframeEl = demoBox.querySelector('iframe');
    if (!iframeEl) {
      iframeEl = document.createElement('iframe');
      iframeEl.style.cssText = 'width:100%;border:none;min-height:160px;display:block;border-radius:4px;';
      iframeEl.sandbox = 'allow-scripts';
      // 清空 demo-box 原有静态内容，换成 iframe
      demoBox.innerHTML = '<div class="demo-label">预览效果</div>';
      demoBox.appendChild(iframeEl);
    }
  }

  // ── 运行函数 ──────────────────────────────────────────────────────────────
  function run() {
    if (iframeEl) {
      runMultiTab(editors, iframeEl);
    }
  }

  // 页面加载后自动运行一次，展示默认效果
  run();

  // Ctrl+Enter 快捷键（对所有 tab 的编辑器都生效）
  tabLangs.forEach((lang) => {
    editors[lang]?.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);
  });

  toolbar.querySelector('.monaco-btn-run').addEventListener('click', run);
  toolbar.querySelector('.monaco-btn-reset').addEventListener('click', () => {
    tabLangs.forEach((lang) => {
      editors[lang]?.setValue(originalCodes[lang]);
    });
    run();
  });

  return { editors, run };
}

// ── 单语言模式：initCodeBlock ─────────────────────────────────────────────────

async function initCodeBlock(codeBlockEl) {
  const monaco = await loadMonaco();

  // 提取原始代码
  const originalCode = extractCode(codeBlockEl);

  // 读取配置属性
  const lang = codeBlockEl.dataset.lang || 'javascript';
  const mode = codeBlockEl.dataset.mode || 'console';
  const readonly = codeBlockEl.hasAttribute('data-readonly');
  const langCfg = LANG_CONFIG[lang] || LANG_CONFIG.javascript;

  // 计算编辑器高度
  const height = calcHeight(originalCode);

  // 创建编辑器容器（替换 .code-block）
  const wrapper = document.createElement('div');
  wrapper.className = 'monaco-editor-wrapper';

  // 工具栏
  const toolbar = document.createElement('div');
  toolbar.className = 'monaco-toolbar';

  const badgeStyle = `background:${langCfg.color};color:${langCfg.text};border:1px solid ${langCfg.border};`;
  if (readonly) {
    toolbar.innerHTML = `
      <span class="monaco-lang-badge" style="${badgeStyle}">${langCfg.label}</span>
      <span class="monaco-hint">只读展示</span>
    `;
  } else {
    toolbar.innerHTML = `
      <span class="monaco-lang-badge" style="${badgeStyle}">${langCfg.label}</span>
      <span class="monaco-hint">Ctrl+Enter 运行</span>
      <button class="monaco-btn-reset" title="重置代码">↺ 重置</button>
      <button class="monaco-btn-run">▶ 运行</button>
    `;
  }

  // Monaco 挂载点
  const editorEl = document.createElement('div');
  editorEl.style.height = `${height}px`;

  wrapper.appendChild(toolbar);
  wrapper.appendChild(editorEl);

  // 替换原 .code-block
  codeBlockEl.replaceWith(wrapper);

  // 初始化 Monaco
  const editor = createMonacoEditor(monaco, editorEl, originalCode, lang, readonly);

  // 自动调整高度（最多 520px）
  editor.onDidChangeModelContent(() => {
    const lineCount = editor.getModel().getLineCount();
    const newH = Math.min(Math.max(lineCount * 20 + 24, 80), 520);
    editorEl.style.height = `${newH}px`;
    editor.layout();
  });

  // 主题跟随切换
  const themeObserver = new MutationObserver(() => {
    monaco.editor.setTheme(getMonacoTheme());
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  // ── 找到对应的 demo-box ──────────────────────────────────────────────────
  const demoBox = wrapper.nextElementSibling;

  let outputEl = null;
  let canvasEl = null;
  let iframeEl = null;

  if (demoBox && demoBox.classList.contains('demo-box')) {
    if (mode === 'console') {
      outputEl = demoBox.querySelector('.console-output');
    } else if (mode === 'canvas') {
      canvasEl = demoBox.querySelector('canvas');
    } else if (mode === 'dom') {
      iframeEl = demoBox.querySelector('iframe');
      if (!iframeEl) {
        iframeEl = document.createElement('iframe');
        iframeEl.style.cssText =
          'width:100%;border:none;min-height:120px;display:block;margin-top:0.5rem;border-radius:4px;';
        iframeEl.sandbox = 'allow-scripts';
        demoBox.appendChild(iframeEl);
      }
    }
  }

  // ── 运行函数 ─────────────────────────────────────────────────────────────
  function run() {
    const code = editor.getValue();
    if (mode === 'canvas' && canvasEl) {
      runCanvas(code, canvasEl);
    } else if (mode === 'dom' && iframeEl) {
      runDom(code, iframeEl);
    } else if (outputEl) {
      runConsole(code, outputEl);
    }
  }

  // Ctrl+Enter 运行
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);

  // 工具栏按钮（只读模式下没有这些按钮）
  if (!readonly) {
    toolbar.querySelector('.monaco-btn-run').addEventListener('click', run);
    toolbar.querySelector('.monaco-btn-reset').addEventListener('click', () => {
      editor.setValue(originalCode);
      editor.focus();
    });
  }

  // ── 劫持 demo-box 中原有的运行按钮 ──────────────────────────────────────
  if (!readonly && demoBox) {
    demoBox.querySelectorAll('.btn-primary').forEach((btn) => {
      const origOnclick = btn.getAttribute('onclick');
      if (!origOnclick) return;
      btn.addEventListener(
        'click',
        () => {
          window.__latestEditorCode = editor.getValue();
        },
        true
      ); // capture 阶段，在 onclick 之前执行
    });
  }

  // 非只读模式：初始化完成后自动运行一次，展示默认效果
  if (!readonly) run();

  return { editor, run };
}

// ── 注入工具栏样式 ────────────────────────────────────────────────────────────

function injectToolbarStyle() {
  if (document.getElementById('monaco-toolbar-style')) return;
  const style = document.createElement('style');
  style.id = 'monaco-toolbar-style';
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
  padding: 0.3rem 0.75rem;
  background: var(--color-surface-2, #22263a);
  border-bottom: 1px solid var(--color-border, #2e3350);
  font-size: 0.72rem;
  user-select: none;
  flex-wrap: wrap;
  min-height: 2rem;
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

/* ── 多 Tab 样式 ─────────────────────────────────────────────────── */
.monaco-multitab-wrapper {}
.monaco-tabs {
  display: flex;
  gap: 0;
  margin-right: 0.5rem;
}
.monaco-tab {
  padding: 0.18rem 0.7rem;
  background: transparent;
  color: var(--color-text-muted, #8892b0);
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 3px 3px 0 0;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 600;
  font-family: inherit;
  transition: color 0.15s, background 0.15s;
  letter-spacing: 0.04em;
}
.monaco-tab:hover {
  color: var(--tab-color, #e2e8f0);
  background: rgba(255,255,255,0.04);
}
.monaco-tab.active {
  color: var(--tab-color, #e2e8f0);
  background: var(--color-surface-2, #22263a);
  border-color: var(--color-border, #2e3350);
  border-bottom-color: var(--color-surface-2, #22263a);
  position: relative;
  z-index: 1;
}
.monaco-panels {}
.monaco-panel { display: none; }
.monaco-panel[style*="display: block"] { display: block !important; }
  `;
  document.head.appendChild(style);
}

// ── 入口：自动初始化所有 .code-block ─────────────────────────────────────────

async function initAllCodeBlocks() {
  injectToolbarStyle();
  const blocks = Array.from(document.querySelectorAll('.code-block'));
  for (const block of blocks) {
    if (block.dataset.tabs) {
      await initMultiTabCodeBlock(block);
    } else {
      await initCodeBlock(block);
    }
  }
}

document.addEventListener('DOMContentLoaded', initAllCodeBlocks);

export { initAllCodeBlocks, initCodeBlock, initMultiTabCodeBlock, runConsole, runCanvas, runDom, runMultiTab };
