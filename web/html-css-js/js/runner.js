/**
 * 公共工具：代码运行器
 * 将 console.log 输出重定向到页面上的 .console-output 元素
 */
function createRunner(outputId) {
  const el = document.getElementById(outputId)
  if (!el) return { run: () => {}, clear: () => {} }

  function write(args, type = 'log') {
    const line = document.createElement('div')
    line.className = type
    line.textContent = args.map(a => {
      if (typeof a === 'object' && a !== null) {
        try { return JSON.stringify(a, null, 0) } catch { return String(a) }
      }
      return String(a)
    }).join(' ')
    el.appendChild(line)
    el.scrollTop = el.scrollHeight
  }

  return {
    run(fn) {
      const orig = { log: console.log, warn: console.warn, error: console.error, info: console.info }
      console.log   = (...a) => { orig.log(...a);   write(a, 'log') }
      console.warn  = (...a) => { orig.warn(...a);  write(a, 'warn') }
      console.error = (...a) => { orig.error(...a); write(a, 'error') }
      console.info  = (...a) => { orig.info(...a);  write(a, 'info') }
      try { fn() }
      catch (e) { write([`❌ ${e.message}`], 'error') }
      finally {
        console.log = orig.log; console.warn = orig.warn
        console.error = orig.error; console.info = orig.info
      }
    },
    result(label, val) {
      const line = document.createElement('div')
      line.className = 'result'
      line.textContent = `${label}: ${typeof val === 'object' ? JSON.stringify(val) : val}`
      el.appendChild(line)
      el.scrollTop = el.scrollHeight
    },
    clear() { el.innerHTML = '<span class="info">点击运行按钮执行代码</span>' }
  }
}
