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
 * 文件引入模式（data-import）：
 *   <div id="effect-block" class="code-block" data-mode="console">
 *     // 基础代码（可被其他块引入）
 *   </div>
 *   <div class="code-block" data-mode="console" data-import="effect-block">
 *     // 本块代码，运行时自动拼接 effect-block 的代码
 *   </div>
 *
 *   data-import：逗号分隔的 code-block id 列表，运行时将其代码前置注入
 *   被引入的块会在工具栏显示为只读 tab（文件名来自 data-filename 或 id）
 *
 * data-mode：console（默认）| canvas | dom
 * data-lang：javascript（默认）| html | css | typescript | json
 * data-readonly：布尔属性，只读展示
 * data-tabs：逗号分隔的语言列表，如 "html,css" 或 "html,css,js"
 * data-filename：为代码块指定显示文件名（用于 import tab 标签）
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
    .replace(/&amp;/g, '&') // 先替换 &，避免 &lt; 被误判
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ') // 添加对不间断空格的支持
    .trim();
}

/**
 * 从元素中提取 HTML 源码（保留标签结构）
 * 用于 multi-tab 中 data-tab="html" 的内容提取。
 *
 * 两种情况：
 * 1. HTML tab 内容是真实 DOM（未转义）→ innerHTML 直接返回 HTML 字符串
 * 2. HTML tab 内容是转义文本（&lt;div&gt;）→ innerHTML 含实体，需反转义
 *
 * 判断依据：若 innerHTML 包含 &lt; 说明是转义文本，用 textContent 提取；
 * 否则直接用 innerHTML（真实 DOM 结构）。
 */
function extractHtmlCode(el) {
  const raw = el.innerHTML;
  if (raw.includes('&lt;')) {
    // 内容是转义文本，用 textContent 提取并反转义
    return el.textContent
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
  // 内容是真实 DOM，直接序列化为 HTML 字符串
  return raw.trim();
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
    const result = new Function(`return (async () => { ${code} })()`)();
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
    new Function('canvas', code)(canvasEl);
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

/**
 * 根据 tab 标识推断 Monaco 语言和显示标签
 * 支持标准语言名（javascript/typescript/html/css）和文件名（effect.js/reactive.ts 等）
 */
function resolveTabMeta(tabId) {
  const lower = tabId.toLowerCase();
  // 标准语言名直接匹配
  if (LANG_CONFIG[lower])
    return {
      monacoLang: lower === 'js' ? 'javascript' : lower,
      label: LANG_CONFIG[lower].label,
      cfg: LANG_CONFIG[lower],
    };
  // 文件名：根据扩展名推断
  const ext = lower.split('.').pop();
  const extMap = { js: 'javascript', ts: 'typescript', html: 'html', css: 'css', json: 'json' };
  const monacoLang = extMap[ext] || 'javascript';
  const cfg = LANG_CONFIG[monacoLang] || LANG_CONFIG.javascript;
  // 文件名作为标签（保留原始大小写）
  return { monacoLang, label: tabId, cfg };
}

async function initMultiTabCodeBlock(codeBlockEl) {
  const monaco = await loadMonaco();

  const tabsAttr = codeBlockEl.dataset.tabs;
  const tabLangs = tabsAttr.split(',').map((s) => s.trim());
  const mode = codeBlockEl.dataset.mode || 'dom';
  const isConsoleMode = mode === 'console';

  // 解析 data-import（多 tab 模式同样支持）
  const importedBlocks = resolveImports(codeBlockEl.dataset.import);
  const readonlyLangs = new Set(
    (codeBlockEl.dataset.readonlyTabs || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
  // typescript / .ts 标签始终只读（仅供对照，不参与运行）
  tabLangs.filter((l) => l.toLowerCase() === 'typescript' || l.endsWith('.ts')).forEach((l) => readonlyLangs.add(l));

  const originalCodes = {};
  tabLangs.forEach((lang) => {
    const tabEl = codeBlockEl.querySelector(`[data-tab="${lang}"]`);
    if (!tabEl) {
      originalCodes[lang] = '';
      return;
    }
    const { monacoLang } = resolveTabMeta(lang);
    originalCodes[lang] = monacoLang === 'html' ? extractHtmlCode(tabEl) : extractCode(tabEl);
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'monaco-editor-wrapper monaco-multitab-wrapper';

  const toolbar = document.createElement('div');
  toolbar.className = 'monaco-toolbar';

  // import 块显示为灰色只读 tab（在本块 tabs 之前）
  const importTabsHtml = importedBlocks
    .map((b) => {
      const cfg = LANG_CONFIG.javascript;
      return `<button class="monaco-tab monaco-import-tab" data-import-id="${b.id}" style="--tab-color:${cfg.text}">${b.filename} <span style="font-size:0.6rem;opacity:0.55">↑ 引入</span></button>`;
    })
    .join('');

  const tabsHtml = tabLangs
    .map((lang, i) => {
      const { label, cfg } = resolveTabMeta(lang);
      const activeClass = i === 0 ? ' active' : '';
      const roLabel = readonlyLangs.has(lang) ? ' <span style="font-size:0.6rem;opacity:0.6">(只读)</span>' : '';
      return `<button class="monaco-tab${activeClass}" data-tab-lang="${lang}" style="--tab-color:${cfg.text}">${label}${roLabel}</button>`;
    })
    .join('');

  // 可运行 tab：非只读且语言为 js/javascript，或文件名以 .js 结尾
  const runnableLang = tabLangs.find((l) => {
    if (readonlyLangs.has(l)) return false;
    const lower = l.toLowerCase();
    return lower === 'javascript' || lower === 'js' || lower.endsWith('.js');
  });
  // dom 模式下是否有 html tab（决定用 runMultiTab 还是 runDom）
  const hasHtmlTab = tabLangs.some((l) => {
    const lower = l.toLowerCase();
    return lower === 'html' || lower.endsWith('.html');
  });
  const showRunBtn = isConsoleMode ? !!runnableLang : hasHtmlTab || !!runnableLang;

  toolbar.innerHTML = `
    <div class="monaco-tabs">${importTabsHtml}${tabsHtml}</div>
    <span class="monaco-hint">${showRunBtn ? 'Ctrl+Enter 运行' : '只读对照'}</span>
    <button class="monaco-btn-reset" title="重置代码">↺ 重置</button>
    ${showRunBtn ? '<button class="monaco-btn-run">▶ 运行</button>' : ''}
  `;

  const panelsContainer = document.createElement('div');
  panelsContainer.className = 'monaco-panels';

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

  codeBlockEl.replaceWith(wrapper);

  tabLangs.forEach((lang) => {
    const code = originalCodes[lang];
    const { editorEl } = panelEls[lang];
    const isRo = readonlyLangs.has(lang);
    const { monacoLang } = resolveTabMeta(lang);
    const editor = createMonacoEditor(monaco, editorEl, code, monacoLang, isRo);

    if (!isRo) {
      editor.onDidChangeModelContent(() => {
        const lineCount = editor.getModel().getLineCount();
        const newH = Math.min(Math.max(lineCount * 20 + 24, 80), 520);
        editorEl.style.height = `${newH}px`;
        editor.layout();
      });
    }

    editors[lang] = editor;
  });

  const themeObserver = new MutationObserver(() => {
    monaco.editor.setTheme(getMonacoTheme());
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  let activeTab = tabLangs[0];
  toolbar.querySelectorAll('.monaco-tab[data-tab-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.tabLang;
      if (lang === activeTab) return;
      activeTab = lang;

      toolbar.querySelectorAll('.monaco-tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      tabLangs.forEach((l) => {
        panelEls[l].panel.style.display = l === lang ? 'block' : 'none';
      });

      editors[lang]?.layout();
    });
  });

  // import tab 点击：弹出只读预览浮层
  if (importedBlocks.length > 0) {
    toolbar.querySelectorAll('.monaco-import-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const importId = btn.dataset.importId;
        const block = importedBlocks.find((b) => b.id === importId);
        if (!block) return;
        toolbar.querySelectorAll('.monaco-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        showImportPreview(block.filename, block.getCode(), wrapper);
      });
    });
    // 点击本块 tab 时关闭预览
    toolbar.querySelectorAll('.monaco-tab[data-tab-lang]').forEach((btn) => {
      btn.addEventListener('click', () => closeImportPreview(wrapper));
    });
  }

  const demoBox = wrapper.nextElementSibling;
  let iframeEl = null;
  let consoleOutputEl = null;

  if (isConsoleMode && demoBox && demoBox.classList.contains('demo-box')) {
    consoleOutputEl = demoBox.querySelector('.console-output');
  } else if (!isConsoleMode && demoBox && demoBox.classList.contains('demo-box')) {
    iframeEl = demoBox.querySelector('iframe');
    if (!iframeEl) {
      iframeEl = document.createElement('iframe');
      iframeEl.style.cssText = 'width:100%;border:none;min-height:160px;display:block;border-radius:4px;';
      iframeEl.sandbox = 'allow-scripts';
      demoBox.innerHTML = '<div class="demo-label">预览效果</div>';
      demoBox.appendChild(iframeEl);
    }
  } else if (isConsoleMode && runnableLang) {
    // console 模式但没有 demo-box，自动在编辑器后插入输出区
    const autoBox = document.createElement('div');
    autoBox.className = 'demo-box';
    autoBox.style.cssText = 'margin-top:0.5rem;';
    const out = document.createElement('div');
    out.className = 'console-output';
    autoBox.appendChild(out);
    wrapper.insertAdjacentElement('afterend', autoBox);
    consoleOutputEl = out;
  }

  function run() {
    if (isConsoleMode && runnableLang && editors[runnableLang] && consoleOutputEl) {
      // console 模式：将所有 import 块的代码前置拼接后运行
      const importCode = importedBlocks.map((b) => b.getCode()).join('\n\n');
      const currentCode = editors[runnableLang].getValue();
      const fullCode = importCode ? `${importCode}\n\n${currentCode}` : currentCode;
      runConsole(fullCode, consoleOutputEl);
    } else if (iframeEl && hasHtmlTab) {
      // dom 模式 + html/css/js 多 tab：合并渲染
      runMultiTab(editors, iframeEl);
    } else if (iframeEl && runnableLang && editors[runnableLang]) {
      // dom 模式 + 纯 JS tab（如 javascript,typescript）：直接用 runDom 执行 JS
      const importCode = importedBlocks.map((b) => b.getCode()).join('\n\n');
      const currentCode = editors[runnableLang].getValue();
      const fullCode = importCode ? `${importCode}\n\n${currentCode}` : currentCode;
      runDom(fullCode, iframeEl);
    }
  }

  // 延迟一帧确保 Monaco Editor 布局完成后再自动运行
  requestAnimationFrame(run);

  tabLangs.forEach((lang) => {
    if (!readonlyLangs.has(lang)) {
      editors[lang]?.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);
    }
  });

  if (showRunBtn) {
    toolbar.querySelector('.monaco-btn-run')?.addEventListener('click', run);
  }
  toolbar.querySelector('.monaco-btn-reset').addEventListener('click', () => {
    tabLangs.forEach((lang) => {
      editors[lang]?.setValue(originalCodes[lang]);
    });
    run();
  });

  // 注册到全局注册表：以 blockId 为 key，取第一个 JS tab 的代码供 data-import 引用
  const blockId = codeBlockEl.id || '';
  if (blockId) {
    // 优先取第一个非 typescript/ts 的 tab 作为可引用代码
    const jsTab =
      tabLangs.find((l) => {
        const lower = l.toLowerCase();
        return lower !== 'typescript' && !lower.endsWith('.ts');
      }) || tabLangs[0];
    const filename = codeBlockEl.dataset.filename || jsTab;
    registerBlock(blockId, filename, () => editors[jsTab]?.getValue() ?? originalCodes[jsTab] ?? '');
  }

  return { editors, run };
}

// ── 单语言模式：initCodeBlock ─────────────────────────────────────────────────

async function initCodeBlock(codeBlockEl) {
  const monaco = await loadMonaco();

  // 提取原始代码
  const originalCode = extractCode(codeBlockEl);

  // 读取配置属性
  const blockId = codeBlockEl.id || '';
  const filename = codeBlockEl.dataset.filename || blockId;
  const lang = codeBlockEl.dataset.lang || 'javascript';
  const mode = codeBlockEl.dataset.mode || 'console';
  const readonly = codeBlockEl.hasAttribute('data-readonly');
  const autoRun = codeBlockEl.hasAttribute('data-auto-run');
  const langCfg = LANG_CONFIG[lang] || LANG_CONFIG.javascript;

  // ── 解析 data-import：找到被引入的代码块 ──────────────────────────────
  const importedBlocks = resolveImports(codeBlockEl.dataset.import);
  const hasImports = importedBlocks.length > 0;

  // 计算编辑器高度
  const height = calcHeight(originalCode);

  // 创建编辑器容器（替换 .code-block）
  const wrapper = document.createElement('div');
  wrapper.className = 'monaco-editor-wrapper';
  if (hasImports) wrapper.classList.add('monaco-import-wrapper');

  // 工具栏
  const toolbar = document.createElement('div');
  toolbar.className = 'monaco-toolbar';

  if (hasImports && !readonly) {
    // 有 import 时：工具栏显示 import 文件 tab（只读）+ 当前文件 tab（可编辑）
    const importTabsHtml = importedBlocks
      .map((b) => {
        const cfg = LANG_CONFIG.javascript;
        return `<button class="monaco-tab monaco-import-tab" data-import-id="${b.id}" style="--tab-color:${cfg.text}">${b.filename} <span style="font-size:0.6rem;opacity:0.55">↑ 引入</span></button>`;
      })
      .join('');
    const currentFilename = filename || 'index.js';
    const cfg = LANG_CONFIG[lang] || LANG_CONFIG.javascript;
    toolbar.innerHTML = `
      <div class="monaco-tabs">
        ${importTabsHtml}
        <button class="monaco-tab active" data-tab-current style="--tab-color:${cfg.text}">${currentFilename}</button>
      </div>
      <span class="monaco-hint">Ctrl+Enter 运行</span>
      <button class="monaco-btn-reset" title="重置代码">↺ 重置</button>
      <button class="monaco-btn-run">▶ 运行</button>
    `;
  } else {
    const badgeStyle = `background:${langCfg.color};color:${langCfg.text};border:1px solid ${langCfg.border};`;
    if (readonly) {
      toolbar.innerHTML = `
        <span class="monaco-lang-badge" style="${badgeStyle}">${filename || langCfg.label}</span>
        <span class="monaco-hint">只读展示</span>
      `;
    } else {
      const displayName = filename || langCfg.label;
      toolbar.innerHTML = `
        <span class="monaco-lang-badge" style="${badgeStyle}">${displayName}</span>
        <span class="monaco-hint">Ctrl+Enter 运行</span>
        <button class="monaco-btn-reset" title="重置代码">↺ 重置</button>
        <button class="monaco-btn-run">▶ 运行</button>
      `;
    }
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

  // 注册到全局注册表，供后续块引用
  registerBlock(blockId, filename || `${blockId}.js`, () => editor.getValue());

  // 自动调整高度（最多 520px）
  if (!readonly) {
    editor.onDidChangeModelContent(() => {
      const lineCount = editor.getModel().getLineCount();
      const newH = Math.min(Math.max(lineCount * 20 + 24, 80), 520);
      editorEl.style.height = `${newH}px`;
      editor.layout();
    });
  }

  // 主题跟随切换
  const themeObserver = new MutationObserver(() => {
    monaco.editor.setTheme(getMonacoTheme());
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  // ── import tab 点击：弹出只读预览浮层 ────────────────────────────────
  if (hasImports) {
    toolbar.querySelectorAll('.monaco-import-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const importId = btn.dataset.importId;
        const block = importedBlocks.find((b) => b.id === importId);
        if (!block) return;
        showImportPreview(block.filename, block.getCode(), wrapper);
      });
    });
    // 点击当前文件 tab 时关闭预览
    toolbar.querySelector('[data-tab-current]')?.addEventListener('click', () => {
      closeImportPreview(wrapper);
    });
  }

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
  } else if (mode === 'console' && !readonly) {
    // console 模式但没有 demo-box，自动在编辑器后插入输出区
    const autoBox = document.createElement('div');
    autoBox.className = 'demo-box';
    autoBox.style.cssText = 'margin-top:0.5rem;';
    const out = document.createElement('div');
    out.className = 'console-output';
    autoBox.appendChild(out);
    wrapper.insertAdjacentElement('afterend', autoBox);
    outputEl = out;
  }

  // ── 运行函数（import 代码前置拼接）──────────────────────────────────────
  function run() {
    // 将所有 import 块的代码前置拼接
    const importCode = importedBlocks.map((b) => b.getCode()).join('\n\n');
    const currentCode = editor.getValue();
    const fullCode = importCode ? `${importCode}\n\n${currentCode}` : currentCode;

    if (mode === 'canvas' && canvasEl) {
      runCanvas(fullCode, canvasEl);
    } else if (mode === 'dom' && iframeEl) {
      runDom(fullCode, iframeEl);
    } else if (outputEl) {
      runConsole(fullCode, outputEl);
    }
  }

  // Ctrl+Enter 运行
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);

  // 工具栏按钮（只读模式下没有这些按钮）
  if (!readonly) {
    toolbar.querySelector('.monaco-btn-run')?.addEventListener('click', run);
    toolbar.querySelector('.monaco-btn-reset')?.addEventListener('click', () => {
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

  // 初始化完成后自动运行一次（console 模式默认自动运行，延迟一帧确保编辑器布局完成）
  if (autoRun || (mode === 'console' && !readonly && outputEl)) requestAnimationFrame(run);

  return { editor, run };
}

// ── import 预览浮层（点击引入 tab 时展示被引入文件的只读代码）────────────────

let _previewEditor = null;
let _previewWrapper = null;

function showImportPreview(filename, code, anchorEl) {
  closeImportPreview(anchorEl);

  const overlay = document.createElement('div');
  overlay.className = 'monaco-import-preview';
  overlay.dataset.previewFor = anchorEl.dataset ? '' : '';

  const header = document.createElement('div');
  header.className = 'monaco-import-preview-header';
  header.innerHTML = `<span>📄 ${filename}</span><button class="monaco-import-preview-close">✕</button>`;
  overlay.appendChild(header);

  const editorEl = document.createElement('div');
  const lines = code.split('\n').length;
  editorEl.style.height = `${Math.min(Math.max(lines * 20 + 24, 80), 400)}px`;
  overlay.appendChild(editorEl);

  // 插入到 anchorEl 之后
  anchorEl.insertAdjacentElement('afterend', overlay);
  anchorEl._importPreview = overlay;

  loadMonaco().then((monaco) => {
    _previewEditor = createMonacoEditor(monaco, editorEl, code, 'javascript', true);
    _previewWrapper = overlay;
  });

  header.querySelector('.monaco-import-preview-close').addEventListener('click', () => {
    closeImportPreview(anchorEl);
    // 激活当前文件 tab
    anchorEl.querySelector('[data-tab-current]')?.classList.add('active');
    anchorEl.querySelectorAll('.monaco-import-tab').forEach((b) => b.classList.remove('active'));
  });
}

function closeImportPreview(anchorEl) {
  if (anchorEl._importPreview) {
    anchorEl._importPreview.remove();
    anchorEl._importPreview = null;
  }
  if (_previewEditor) {
    _previewEditor.dispose();
    _previewEditor = null;
    _previewWrapper = null;
  }
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

/* ── import tab 样式 ─────────────────────────────────────────── */
.monaco-import-tab {
  opacity: 0.65;
  font-style: italic;
}
.monaco-import-tab:hover { opacity: 0.9; }

/* ── import 预览浮层 ─────────────────────────────────────────── */
.monaco-import-preview {
  border: 1px solid var(--color-primary, #6c63ff);
  border-radius: var(--radius-sm, 6px);
  overflow: hidden;
  margin: 0.25rem 0 0.75rem;
  box-shadow: 0 4px 20px rgba(108,99,255,0.2);
}
.monaco-import-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem 0.75rem;
  background: rgba(108,99,255,0.12);
  border-bottom: 1px solid rgba(108,99,255,0.25);
  font-size: 0.72rem;
  font-family: var(--font-mono, monospace);
  color: var(--color-primary-light, #8b85ff);
  user-select: none;
}
.monaco-import-preview-close {
  background: transparent;
  border: none;
  color: var(--color-text-muted, #8892b0);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  transition: color 0.15s;
}
.monaco-import-preview-close:hover { color: var(--color-text, #e2e8f0); }
  `;
  document.head.appendChild(style);
}

// ── 全局已初始化编辑器注册表（用于 data-import 跨块引用） ─────────────────────

/** Map<blockId, { getCode: () => string, filename: string }> */
const _blockRegistry = new Map();

/**
 * 注册一个代码块到全局注册表，供其他块通过 data-import 引用
 * @param {string} id - 代码块的 id 属性
 * @param {string} filename - 显示用文件名（来自 data-filename 或 id）
 * @param {() => string} getCode - 获取当前代码的函数（返回 editor.getValue()）
 */
function registerBlock(id, filename, getCode) {
  if (id) _blockRegistry.set(id, { filename, getCode });
}

/**
 * 解析 data-import 属性，返回引入块的信息数组
 * @param {string} importAttr - 逗号分隔的 id 列表
 * @returns {{ id: string, filename: string, getCode: () => string }[]}
 */
function resolveImports(importAttr) {
  if (!importAttr) return [];
  return importAttr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((id) => {
      const entry = _blockRegistry.get(id);
      if (entry) return { id, ...entry };
      // 如果注册表中没有（可能还未初始化），尝试直接从 DOM 提取
      const el = document.getElementById(id);
      if (!el) return null;
      const filename = el.dataset.filename || id;
      const code = extractCode(el);
      return { id, filename, getCode: () => code };
    })
    .filter(Boolean);
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
