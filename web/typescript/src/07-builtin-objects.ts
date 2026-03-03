/**
 * 第七章：内置对象类型
 *
 * 学习目标：
 *   1. 掌握 Date / RegExp / Promise 的类型声明
 *   2. 掌握 Map / Set / WeakMap / WeakSet
 *   3. 掌握 ArrayBuffer / DataView / TypedArray
 *   4. 了解 Intl 国际化对象类型
 */

// ─────────────────────────────────────────────
// 7.1 Date
// ─────────────────────────────────────────────

const now: Date = new Date()
const birthday: Date = new Date('1990-06-15')
const timestamp: Date = new Date(0) // Unix 纪元

console.log('Date now：', now.toLocaleDateString('zh-CN'))
console.log('Date birthday：', birthday.getFullYear())
console.log('Date timestamp：', timestamp.toISOString())

// 日期计算
function daysBetween(a: Date, b: Date): number {
  const ms = Math.abs(b.getTime() - a.getTime())
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}
console.log('两日期相差天数：', daysBetween(birthday, now))

// ─────────────────────────────────────────────
// 7.2 RegExp
// ─────────────────────────────────────────────

const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex: RegExp = new RegExp('^1[3-9]\\d{9}$')

function validateEmail(email: string): boolean {
  return emailRegex.test(email)
}
console.log('RegExp email 验证：', validateEmail('alice@example.com'), validateEmail('invalid'))

// 捕获组
const datePattern: RegExp = /(\d{4})-(\d{2})-(\d{2})/
const match: RegExpMatchArray | null = '2024-03-15'.match(datePattern)
if (match) {
  const [, year, month, day] = match
  console.log('RegExp 捕获组：', { year, month, day })
}

// 全局替换
const text = 'Hello World, Hello TypeScript'
const replaced: string = text.replace(/Hello/g, 'Hi')
console.log('RegExp 替换：', replaced)

// ─────────────────────────────────────────────
// 7.3 Promise
// ─────────────────────────────────────────────

// 基础 Promise
const p1: Promise<string> = new Promise((resolve, reject) => {
  const success = true
  if (success) resolve('操作成功')
  else reject(new Error('操作失败'))
})

// async/await 是 Promise 的语法糖
async function fetchData(id: number): Promise<{ id: number; name: string }> {
  // 模拟异步请求
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, name: `User-${id}` }), 10)
  })
}

// Promise 链式调用
async function runPromiseExamples(): Promise<void> {
  // then/catch
  const result1 = await p1
  console.log('Promise resolve：', result1)

  // async/await
  const user = await fetchData(42)
  console.log('async/await：', user)

  // Promise.all：并发执行，全部成功才 resolve
  const [u1, u2, u3] = await Promise.all([fetchData(1), fetchData(2), fetchData(3)])
  console.log('Promise.all：', u1.name, u2.name, u3.name)

  // Promise.allSettled：并发执行，不论成功失败都收集结果
  const results = await Promise.allSettled([
    Promise.resolve('success'),
    Promise.reject(new Error('fail')),
    Promise.resolve('also success'),
  ])
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') console.log(`allSettled[${i}] fulfilled:`, r.value)
    else console.log(`allSettled[${i}] rejected:`, r.reason.message)
  })

  // Promise.race：返回最先 settle 的结果
  const fastest = await Promise.race([
    new Promise<string>(r => setTimeout(() => r('slow'), 100)),
    new Promise<string>(r => setTimeout(() => r('fast'), 10)),
  ])
  console.log('Promise.race 最快：', fastest)
}

// ─────────────────────────────────────────────
// 7.4 Map
// ─────────────────────────────────────────────

// Map<K, V>：有序键值对，键可以是任意类型
const userMap: Map<number, string> = new Map([
  [1, 'Alice'],
  [2, 'Bob'],
  [3, 'Charlie'],
])
userMap.set(4, 'Dave')
console.log('Map size：', userMap.size)
console.log('Map get(2)：', userMap.get(2))
console.log('Map has(5)：', userMap.has(5))

// 遍历 Map
userMap.forEach((name, id) => {
  if (id <= 2) console.log(`Map forEach: ${id} -> ${name}`)
})

// Map 转数组
const entries: [number, string][] = Array.from(userMap.entries())
console.log('Map to Array：', entries.slice(0, 2))

// 对象作为 key（这是 Map 相比普通对象的优势）
const objKeyMap: Map<object, string> = new Map()
const keyA = { type: 'A' }
const keyB = { type: 'B' }
objKeyMap.set(keyA, 'value A')
objKeyMap.set(keyB, 'value B')
console.log('Map 对象 key：', objKeyMap.get(keyA))

// ─────────────────────────────────────────────
// 7.5 Set
// ─────────────────────────────────────────────

// Set<T>：无重复值的集合
const numSet: Set<number> = new Set([1, 2, 3, 2, 1, 4])
console.log('Set 自动去重：', Array.from(numSet)) // [1, 2, 3, 4]
console.log('Set size：', numSet.size)

numSet.add(5)
numSet.delete(1)
console.log('Set add/delete：', Array.from(numSet))

// 数组去重
function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}
console.log('Set 数组去重：', unique([1, 2, 2, 3, 3, 3, 4]))

// 集合运算
function union<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a, ...b])
}
function intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter(x => b.has(x)))
}
function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter(x => !b.has(x)))
}

const setA = new Set([1, 2, 3, 4])
const setB = new Set([3, 4, 5, 6])
console.log('Set 并集：', Array.from(union(setA, setB)))
console.log('Set 交集：', Array.from(intersection(setA, setB)))
console.log('Set 差集 A-B：', Array.from(difference(setA, setB)))

// ─────────────────────────────────────────────
// 7.6 WeakMap / WeakSet
// ─────────────────────────────────────────────

// WeakMap：键必须是对象，不阻止垃圾回收（弱引用）
// 常用于：私有数据存储、DOM 节点关联数据
const privateData: WeakMap<object, { secret: string }> = new WeakMap()

class SecretHolder {
  constructor(secret: string) {
    privateData.set(this, { secret })
  }
  getSecret(): string {
    return privateData.get(this)?.secret ?? ''
  }
}

const holder = new SecretHolder('my-secret-123')
console.log('WeakMap 私有数据：', holder.getSecret())

// WeakSet：存储对象的弱引用集合
// 常用于：标记已处理的对象
const processed: WeakSet<object> = new WeakSet()
function processOnce(obj: object, fn: () => void): void {
  if (processed.has(obj)) {
    console.log('WeakSet：已处理，跳过')
    return
  }
  fn()
  processed.add(obj)
}

const task = { id: 1 }
processOnce(task, () => console.log('WeakSet：首次处理 task'))
processOnce(task, () => console.log('WeakSet：不会执行'))

// ─────────────────────────────────────────────
// 7.7 ArrayBuffer / TypedArray / DataView
// ─────────────────────────────────────────────

// ArrayBuffer：固定长度的原始二进制数据缓冲区
const buffer: ArrayBuffer = new ArrayBuffer(16) // 16 字节
console.log('ArrayBuffer byteLength：', buffer.byteLength)

// TypedArray：以特定数值类型读写 ArrayBuffer
const int32: Int32Array = new Int32Array(buffer)
int32[0] = 42
int32[1] = 100
console.log('Int32Array：', int32[0], int32[1])

const float64: Float64Array = new Float64Array(2)
float64[0] = 3.14159
float64[1] = 2.71828
console.log('Float64Array：', float64[0].toFixed(5))

// DataView：以任意字节偏移读写 ArrayBuffer（处理二进制协议时常用）
const dv: DataView = new DataView(new ArrayBuffer(8))
dv.setInt32(0, 0x12345678, true)  // 小端序写入
dv.setFloat32(4, 1.5, true)
console.log('DataView getInt32：', dv.getInt32(0, true).toString(16))
console.log('DataView getFloat32：', dv.getFloat32(4, true))

// ─────────────────────────────────────────────
// 7.8 Intl 国际化
// ─────────────────────────────────────────────

// 数字格式化
const numberFormatter: Intl.NumberFormat = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
})
console.log('Intl 货币：', numberFormatter.format(12345.678))

// 日期格式化
const dateFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
})
console.log('Intl 日期：', dateFormatter.format(new Date()))

// 字符串排序（支持中文）
const collator: Intl.Collator = new Intl.Collator('zh-CN')
const names = ['张三', '李四', '王五', '赵六', 'Alice', 'Bob']
console.log('Intl 中文排序：', names.sort((a, b) => collator.compare(a, b)))

// 相对时间
const relativeTime: Intl.RelativeTimeFormat = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })
console.log('Intl 相对时间：', relativeTime.format(-1, 'day'))   // 昨天
console.log('Intl 相对时间：', relativeTime.format(3, 'week'))   // 3周后

// ─────────────────────────────────────────────
// 导出
// ─────────────────────────────────────────────
export async function runBuiltinObjects(): Promise<void> {
  console.log('\n========== 第七章：内置对象类型 ==========')
  console.log('Date now：', now.toLocaleDateString('zh-CN'))
  console.log('RegExp email：', validateEmail('alice@example.com'))
  await runPromiseExamples()
  console.log('Map get(2)：', userMap.get(2))
  console.log('Set 去重：', unique([1, 2, 2, 3, 3]))
  console.log('WeakMap 私有：', holder.getSecret())
  console.log('Int32Array：', int32[0])
  console.log('Intl 货币：', numberFormatter.format(9999))
}
