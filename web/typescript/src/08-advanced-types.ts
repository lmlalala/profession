/**
 * 第八章：高级类型
 *
 * 学习目标：
 *   1. 掌握联合类型（|）与交叉类型（&）
 *   2. 掌握条件类型（T extends U ? X : Y）
 *   3. 掌握映射类型（Mapped Types）
 *   4. 掌握模板字面量类型（Template Literal Types）
 *   5. 理解 infer 关键字
 */

// ─────────────────────────────────────────────
// 8.1 联合类型（Union Types）
// ─────────────────────────────────────────────

type StringOrNumber = string | number
type Status = 'pending' | 'running' | 'success' | 'failed'

function formatId(id: StringOrNumber): string {
  if (typeof id === 'string') return id.toUpperCase()
  return id.toString().padStart(6, '0')
}
console.log('联合类型：', formatId('abc'), formatId(42))

// 可辨识联合（Discriminated Union）：每个成员有共同的字面量字段
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number }

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2
    case 'rectangle': return shape.width * shape.height
    case 'triangle': return 0.5 * shape.base * shape.height
    // TypeScript 会检查是否所有 case 都已处理（穷举检查）
  }
}
console.log('可辨识联合 circle：', getArea({ kind: 'circle', radius: 5 }).toFixed(2))
console.log('可辨识联合 rect：', getArea({ kind: 'rectangle', width: 4, height: 6 }))

// ─────────────────────────────────────────────
// 8.2 交叉类型（Intersection Types）
// ─────────────────────────────────────────────

type Timestamped = { createdAt: Date; updatedAt: Date }
type SoftDeletable = { deletedAt: Date | null; isDeleted: boolean }
type Auditable = Timestamped & SoftDeletable

type UserRecord = {
  id: number
  name: string
  email: string
} & Auditable

const userRecord: UserRecord = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  isDeleted: false,
}
console.log('交叉类型 UserRecord：', userRecord.name, userRecord.isDeleted)

// ─────────────────────────────────────────────
// 8.3 条件类型（Conditional Types）
// ─────────────────────────────────────────────

// 基础：T extends U ? TrueType : FalseType
type IsString<T> = T extends string ? true : false
type A = IsString<string>   // true
type B = IsString<number>   // false

// 分布式条件类型（Distributive）：T 为联合类型时自动分发
type ToArray<T> = T extends unknown ? T[] : never
type StrOrNumArray = ToArray<string | number>
// 等价于：string[] | number[]

const mixed: StrOrNumArray = [1, 2, 3]
console.log('条件类型 ToArray：', mixed)

// 非分布式（用 [] 包裹）
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never
type UnionArray = ToArrayNonDist<string | number>
// 等价于：(string | number)[]

// 实用条件类型
type Flatten<T> = T extends Array<infer Item> ? Item : T
type FlatStr = Flatten<string[]>   // string
type FlatNum = Flatten<number>     // number（不是数组，原样返回）

// ─────────────────────────────────────────────
// 8.4 infer 关键字
// ─────────────────────────────────────────────

// infer：在条件类型中推断类型变量

// 提取函数返回值类型（手动实现 ReturnType）
type MyReturnType<T> = T extends (...args: unknown[]) => infer R ? R : never
type FnReturn = MyReturnType<(x: number) => string>  // string

// 提取 Promise 的解析类型
type Awaited_<T> = T extends Promise<infer R> ? Awaited_<R> : T
type ResolvedType = Awaited_<Promise<Promise<string>>>  // string

// 提取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : never
type StrElement = ElementType<string[]>   // string
type NumElement = ElementType<number[]>   // number

// 提取构造函数参数
type ConstructorParams<T> = T extends new (...args: infer P) => unknown ? P : never

class HttpClient {
  constructor(public baseURL: string, public timeout: number) {}
}
type HttpClientParams = ConstructorParams<typeof HttpClient>
// [baseURL: string, timeout: number]

const params: HttpClientParams = ['https://api.example.com', 5000]
const client = new HttpClient(...params)
console.log('infer ConstructorParams：', client.baseURL, client.timeout)

// ─────────────────────────────────────────────
// 8.5 映射类型（Mapped Types）
// ─────────────────────────────────────────────

// 基础映射：遍历 T 的所有键
type Mutable<T> = {
  -readonly [K in keyof T]: T[K]  // 移除 readonly
}
type Optional<T> = {
  [K in keyof T]?: T[K]           // 添加 ?
}
type Required_<T> = {
  [K in keyof T]-?: T[K]          // 移除 ?
}

// 值类型转换
type Stringify<T> = {
  [K in keyof T]: string
}
type NumberRecord = { x: number; y: number; z: number }
type StringRecord = Stringify<NumberRecord>
// { x: string; y: string; z: string }

// 键名重映射（as 子句，TypeScript 4.1+）
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}
type PersonGetters = Getters<{ name: string; age: number }>
// { getName: () => string; getAge: () => number }

// 过滤属性（结合条件类型）
type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K]
}
type OnlyStrings = PickByValue<{ a: string; b: number; c: string; d: boolean }, string>
// { a: string; c: string }

const onlyStrings: OnlyStrings = { a: 'hello', c: 'world' }
console.log('映射类型 PickByValue：', onlyStrings)

// ─────────────────────────────────────────────
// 8.6 模板字面量类型（Template Literal Types）
// ─────────────────────────────────────────────

// 基础拼接
type EventName = `on${Capitalize<string>}`
type Greeting = `Hello, ${string}!`

// 联合类型展开
type Axis = 'x' | 'y' | 'z'
type AxisGetter = `get${Capitalize<Axis>}`
// 'getX' | 'getY' | 'getZ'

type CSSProperty = 'margin' | 'padding'
type CSSDirection = 'Top' | 'Right' | 'Bottom' | 'Left'
type CSSShorthand = `${CSSProperty}${CSSDirection}`
// 'marginTop' | 'marginRight' | ... | 'paddingLeft'

const cssVal: CSSShorthand = 'marginTop'
console.log('模板字面量类型：', cssVal)

// 实战：类型安全的事件系统
type EventMap = {
  click: { x: number; y: number }
  keydown: { key: string; code: string }
  resize: { width: number; height: number }
}
type EventHandler<T extends keyof EventMap> = (event: EventMap[T]) => void
type OnEventName = `on${Capitalize<keyof EventMap>}`
// 'onClick' | 'onKeydown' | 'onResize'

function createEventName<T extends keyof EventMap>(event: T): `on${Capitalize<T>}` {
  return `on${event.charAt(0).toUpperCase()}${event.slice(1)}` as `on${Capitalize<T>}`
}
console.log('模板字面量 createEventName：', createEventName('click'))  // 'onClick'
console.log('模板字面量 createEventName：', createEventName('resize')) // 'onResize'

// ─────────────────────────────────────────────
// 8.7 递归类型
// ─────────────────────────────────────────────

// JSON 类型（自引用）
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

const jsonData: JSONValue = {
  name: 'Alice',
  age: 25,
  hobbies: ['reading', 'coding'],
  address: { city: 'Beijing', zip: '100000' },
  active: true,
  deletedAt: null,
}
console.log('递归 JSON 类型：', (jsonData as Record<string, JSONValue>).name)

// 树形结构
type TreeNode<T> = {
  value: T
  children?: TreeNode<T>[]
}

const tree: TreeNode<string> = {
  value: 'root',
  children: [
    { value: 'child1', children: [{ value: 'grandchild1' }] },
    { value: 'child2' },
  ],
}

function traverseTree<T>(node: TreeNode<T>, depth = 0): void {
  console.log('  '.repeat(depth) + node.value)
  node.children?.forEach(child => traverseTree(child, depth + 1))
}
console.log('递归树形结构：')
traverseTree(tree)

// ─────────────────────────────────────────────
// 导出
// ─────────────────────────────────────────────
export function runAdvancedTypes(): void {
  console.log('\n========== 第八章：高级类型 ==========')
  console.log('联合类型 formatId：', formatId('abc'), formatId(42))
  console.log('可辨识联合 circle area：', getArea({ kind: 'circle', radius: 5 }).toFixed(2))
  console.log('交叉类型 UserRecord：', userRecord.name)
  console.log('映射类型 PickByValue：', onlyStrings)
  console.log('模板字面量：', createEventName('click'))
  console.log('递归树形结构：')
  traverseTree(tree)
}
