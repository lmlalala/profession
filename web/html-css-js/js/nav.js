/**
 * 公共导航组件
 * 自动渲染导航栏并高亮当前页面链接，同时提供主题切换功能
 */

const NAV_LINKS = [
  { href: 'html5.html',          label: 'HTML5' },
  { href: 'css-layout.html',     label: 'CSS 布局' },
  { href: 'css-animation.html',  label: 'CSS 动画' },
  { href: 'css-interview.html',  label: 'CSS 面试' },
  { href: 'js-basic.html',       label: 'JS 基础' },
  { href: 'js-es6.html',         label: 'JS ES6+' },
  { href: 'js-async.html',       label: 'JS 异步' },
  { href: 'js-advanced.html',    label: 'JS 高级' },
  { href: 'vue2-principle.html', label: 'Vue2 原理' },
  { href: 'vue3-principle.html', label: 'Vue3 原理' },
  { href: 'react-principle.html',label: 'React 原理' },
]

/** 从 URL 中提取当前文件名 */
function getCurrentPage() {
  return location.pathname.split('/').pop() || 'index.html'
}

/** 判断是否在 pages/ 子目录下 */
function isInPagesDir() {
  return location.pathname.includes('/pages/')
}

/** 渲染导航栏到 <nav class="nav"> 占位元素 */
function renderNav() {
  const nav = document.querySelector('nav.nav')
  if (!nav) return

  const inPages = isInPagesDir()
  const brandHref = inPages ? '../index.html' : 'index.html'
  const currentPage = getCurrentPage()

  const prefix = inPages ? '' : 'pages/'
  const linksHtml = NAV_LINKS.map(({ href, label }) => {
    const isActive = href === currentPage
    return `<li><a href="${prefix}${href}"${isActive ? ' class="active"' : ''}>${label}</a></li>`
  }).join('\n      ')

  nav.innerHTML = `
    <a href="${brandHref}" class="nav-brand">📚 前端学习</a>
    <ul class="nav-links">
      ${linksHtml}
    </ul>
    <button class="theme-toggle" id="themeToggle" title="切换主题" aria-label="切换明暗主题">
      <span class="theme-icon">☀️</span>
    </button>
  `

  initTheme()
}

/** 主题初始化与切换 */
function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark'
  applyTheme(saved)

  const btn = document.getElementById('themeToggle')
  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark'
      applyTheme(current === 'dark' ? 'light' : 'dark')
    })
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
  const icon = document.querySelector('.theme-icon')
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙'
}

document.addEventListener('DOMContentLoaded', renderNav)
