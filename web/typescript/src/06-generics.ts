/**
 * 第六章：泛型（Generics）
 *
 * 学习目标：
 *   1. 掌握泛型函数、泛型接口、泛型类
 *   2. 理解泛型约束（extends）
 *   3. 掌握多泛型参数、默认泛型参数
 *   4. 理解泛型工具函数的实际应用
 */

// ─────────────────────────────────────────────
// 6.1 泛型函数
// ─────────────────────────────────────────────

// 不用泛型：需要为每种类型写一个函数
function getFirstString(arr: string[]): string { return arr[0] }
function getFirstNumber(arr: number[]): number { return arr[0] }

// 用泛型：一个函数覆盖所有类型
function getFirst<T>(arr: T[]): T {
  return arr[0]
}
console.log('泛型函数：', getFirst<string>(['a', 'b', 'c']))
console.log('泛型函数（类型推断）：', getFirst([1, 2, 3])) // TS 自动推断 T = number

// 多个泛型参数
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second]
}
console.log('多泛型参数：', pair('hello', 42), pair(true, { name: 'ts' }))

// 泛型箭头函数
const identity = <T>(value: T): T => value
console.log('泛型箭头函数：', identity('TypeScript'), identity(100))

// ─────────────────────────────────────────────
// 6.2 泛型约束（extends）
// ─────────────────────────────────────────────

// 约束 T 必须有 length 属性
interface IHasLength {
  length: number
}
function logLength<T extends IHasLength>(value: T): T {
  console.log('length:', value.length)
  return value
}
logLength('hello')        // string 有 length
logLength([1, 2, 3])      // array 有 length
logLength({ length: 5, name: 'obj' }) // 对象有 length
// logLength(42)           // ❌ number 没有 length

// 约束 K 必须是 T 的键（keyof）
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
const user = { id: 1, name: 'Alice', email: 'alice@example.com' }
console.log('keyof 约束：', getProperty(user, 'name'))
console.log('keyof 约束：', getProperty(user, 'id'))
// getProperty(user, 'phone')  // ❌ 'phone' 不是 user 的键

// ─────────────────────────────────────────────
// 6.3 泛型接口
// ─────────────────────────────────────────────

interface IRepository<T, ID = number> {
  findById(id: ID): T | undefined
  findAll(): T[]
  save(entity: T): T
  delete(id: ID): boolean
}

interface IProduct {
  id: number
  name: string
  price: number
}

class ProductRepository implements IRepository<IProduct> {
  private store: Map<number, IProduct> = new Map()

  findById(id: number): IProduct | undefined {
    return this.store.get(id)
  }
  findAll(): IProduct[] {
    return Array.from(this.store.values())
  }
  save(product: IProduct): IProduct {
    this.store.set(product.id, product)
    return product
  }
  delete(id: number): boolean {
    return this.store.delete(id)
  }
}

const repo = new ProductRepository()
repo.save({ id: 1, name: 'TypeScript 入门', price: 59 })
repo.save({ id: 2, name: 'React 实战', price: 79 })
console.log('泛型接口 findAll：', repo.findAll())
console.log('泛型接口 findById：', repo.findById(1))

// ─────────────────────────────────────────────
// 6.4 泛型类
// ─────────────────────────────────────────────

class Stack<T> {
  private items: T[] = []

  push(item: T): void { this.items.push(item) }
  pop(): T | undefined { return this.items.pop() }
  peek(): T | undefined { return this.items[this.items.length - 1] }
  isEmpty(): boolean { return this.items.length === 0 }
  size(): number { return this.items.length }
  toString(): string { return `Stack[${this.items.join(', ')}]` }
}

const numStack = new Stack<number>()
numStack.push(1); numStack.push(2); numStack.push(3)
console.log('泛型类 Stack：', numStack.toString())
console.log('peek：', numStack.peek())
console.log('pop：', numStack.pop(), numStack.toString())

const strStack = new Stack<string>()
strStack.push('a'); strStack.push('b')
console.log('字符串 Stack：', strStack.toString())

// ─────────────────────────────────────────────
// 6.5 默认泛型参数
// ─────────────────────────────────────────────

interface IApiResponse<T = unknown, E = string> {
  data: T | null
  error: E | null
  status: number
  timestamp: Date
}

function createSuccessResponse<T>(data: T, status = 200): IApiResponse<T> {
  return { data, error: null, status, timestamp: new Date() }
}
function createErrorResponse<E = string>(error: E, status = 500): IApiResponse<never, E> {
  return { data: null, error, status, timestamp: new Date() }
}

const successResp = createSuccessResponse({ id: 1, name: 'Alice' })
const errorResp = createErrorResponse('用户不存在', 404)
console.log('默认泛型 success：', successResp.data, successResp.status)
console.log('默认泛型 error：', errorResp.error, errorResp.status)

// ─────────────────────────────────────────────
// 6.6 泛型工具函数实战
// ─────────────────────────────────────────────

// 深度只读
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}

// 安全的 Object.keys（保留类型）
function typedKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}
const config = { host: 'localhost', port: 3000, debug: true }
const keys = typedKeys(config)
console.log('typedKeys：', keys)

// 分组函数
function groupBy<T, K extends string | number>(
  items: T[],
  getKey: (item: T) => K,
): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const key = getKey(item)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<K, T[]>)
}

const products = [
  { id: 1, category: 'book', name: 'TS 入门' },
  { id: 2, category: 'book', name: 'React 实战' },
  { id: 3, category: 'video', name: 'Vue3 教程' },
]
const grouped = groupBy(products, p => p.category)
console.log('groupBy book：', grouped.book.map(p => p.name))
console.log('groupBy video：', grouped.video.map(p => p.name))

// 管道函数（函数组合）
function pipe<T>(value: T, ...fns: Array<(val: T) => T>): T {
  return fns.reduce((acc, fn) => fn(acc), value)
}
const result = pipe(
  '  hello world  ',
  (s) => s.trim(),
  (s) => s.toUpperCase(),
  (s) => s.replace(' ', '_'),
)
console.log('pipe 管道：', result) // "HELLO_WORLD"

// ─────────────────────────────────────────────
// 导出
// ─────────────────────────────────────────────
export function runGenerics(): void {
  console.log('\n========== 第六章：泛型 ==========')
  console.log('getFirst<string>:', getFirst(['a', 'b', 'c']))
  console.log('pair:', pair('hello', 42))
  console.log('logLength("hello"):', 'hello'.length)
  console.log('ProductRepository findAll:', repo.findAll().map(p => p.name))
  console.log('Stack<number>:', numStack.toString())
  console.log('ApiResponse success:', successResp.status)
  console.log('groupBy book:', grouped.book.map(p => p.name))
  console.log('pipe result:', result)
}
