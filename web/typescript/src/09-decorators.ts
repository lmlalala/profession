/**
 * 第九章：装饰器（Decorators）与模块
 *
 * 学习目标：
 *   1. 理解装饰器的概念与执行顺序
 *   2. 掌握类装饰器、方法装饰器、属性装饰器、参数装饰器
 *   3. 了解模块的命名空间（namespace）
 *
 * 注意：装饰器需要在 tsconfig.json 中开启 experimentalDecorators
 *       本章使用 TypeScript 5.0+ 的标准装饰器语法（无需额外配置）
 */

// ─────────────────────────────────────────────
// 9.1 命名空间（Namespace）
// ─────────────────────────────────────────────

// namespace 用于组织代码，避免全局命名冲突
namespace Validation {
  export interface IValidator {
    isValid(value: string): boolean
    message: string
  }

  export class EmailValidator implements IValidator {
    message = '邮箱格式不正确'
    isValid(value: string): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    }
  }

  export class PhoneValidator implements IValidator {
    message = '手机号格式不正确'
    isValid(value: string): boolean {
      return /^1[3-9]\d{9}$/.test(value)
    }
  }

  export function validate(value: string, validators: IValidator[]): string[] {
    return validators
      .filter(v => !v.isValid(value))
      .map(v => v.message)
  }
}

const errors = Validation.validate('invalid-email', [
  new Validation.EmailValidator(),
])
console.log('Namespace 验证错误：', errors)

const valid = Validation.validate('alice@example.com', [
  new Validation.EmailValidator(),
])
console.log('Namespace 验证通过：', valid.length === 0 ? '✓' : valid)

// ─────────────────────────────────────────────
// 9.2 模块增强（Declaration Merging）
// ─────────────────────────────────────────────

// 为已有接口添加新属性（常用于扩展第三方库类型）
interface Window {
  myAppVersion: string
}

// 为已有命名空间添加成员
namespace Validation {
  export class UrlValidator implements IValidator {
    message = 'URL 格式不正确'
    isValid(value: string): boolean {
      try { new URL(value); return true } catch { return false }
    }
  }
}

const urlErrors = Validation.validate('not-a-url', [new Validation.UrlValidator()])
console.log('命名空间增强 URL 验证：', urlErrors)

// ─────────────────────────────────────────────
// 9.3 Symbol 高级用法
// ─────────────────────────────────────────────

// Symbol 作为对象属性键（不会被 for...in / Object.keys 枚举）
const ID_KEY = Symbol('id')
const PRIVATE_KEY = Symbol('private')

interface IWithSymbol {
  [ID_KEY]: number
  name: string
}

const obj: IWithSymbol = { [ID_KEY]: 42, name: 'Alice' }
console.log('Symbol 属性键：', obj[ID_KEY], obj.name)
console.log('Object.keys（不含 Symbol）：', Object.keys(obj))
console.log('Symbol 属性（需显式访问）：', Object.getOwnPropertySymbols(obj))

// Symbol.iterator：自定义迭代器
class Range {
  constructor(private start: number, private end: number) {}

  [Symbol.iterator](): Iterator<number> {
    let current = this.start
    const end = this.end
    return {
      next(): IteratorResult<number> {
        if (current <= end) {
          return { value: current++, done: false }
        }
        return { value: undefined as unknown as number, done: true }
      },
    }
  }
}

const range = new Range(1, 5)
const rangeArr = [...range]
console.log('Symbol.iterator 自定义迭代：', rangeArr)

for (const n of new Range(10, 13)) {
  process.stdout.write(n + ' ')
}
console.log()

// ─────────────────────────────────────────────
// 9.4 类型守卫进阶
// ─────────────────────────────────────────────

// 断言函数（asserts）：TypeScript 3.7+
function assertIsString(val: unknown): asserts val is string {
  if (typeof val !== 'string') {
    throw new TypeError(`期望字符串，得到 ${typeof val}`)
  }
}

function processInput(input: unknown): string {
  assertIsString(input)
  // 此处 input 已被收窄为 string
  return input.toUpperCase()
}
console.log('asserts 断言函数：', processInput('hello'))

// 类型谓词 + 泛型
function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

const maybeValues: (string | null | undefined)[] = ['a', null, 'b', undefined, 'c']
const definiteValues: string[] = maybeValues.filter(isNonNull)
console.log('isNonNull 过滤：', definiteValues)

// ─────────────────────────────────────────────
// 9.5 实用设计模式（TypeScript 风格）
// ─────────────────────────────────────────────

// 单例模式
class Logger {
  private static instance: Logger | null = null
  private logs: string[] = []

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  log(message: string): void {
    const entry = `[${new Date().toISOString()}] ${message}`
    this.logs.push(entry)
    console.log('Logger：', entry)
  }

  getLogs(): string[] { return [...this.logs] }
}

const logger1 = Logger.getInstance()
const logger2 = Logger.getInstance()
logger1.log('第一条日志')
logger2.log('第二条日志')
console.log('单例模式（同一实例）：', logger1 === logger2)

// 建造者模式
class QueryBuilder {
  private table = ''
  private conditions: string[] = []
  private columns: string[] = ['*']
  private limitVal: number | null = null
  private orderByVal: string | null = null

  from(table: string): this { this.table = table; return this }
  select(...cols: string[]): this { this.columns = cols; return this }
  where(condition: string): this { this.conditions.push(condition); return this }
  limit(n: number): this { this.limitVal = n; return this }
  orderBy(col: string): this { this.orderByVal = col; return this }

  build(): string {
    let sql = `SELECT ${this.columns.join(', ')} FROM ${this.table}`
    if (this.conditions.length) sql += ` WHERE ${this.conditions.join(' AND ')}`
    if (this.orderByVal) sql += ` ORDER BY ${this.orderByVal}`
    if (this.limitVal !== null) sql += ` LIMIT ${this.limitVal}`
    return sql
  }
}

const sql = new QueryBuilder()
  .from('users')
  .select('id', 'name', 'email')
  .where('age > 18')
  .where('active = true')
  .orderBy('name')
  .limit(10)
  .build()
console.log('建造者模式 SQL：', sql)

// 观察者模式（类型安全）
type EventPayloads = {
  userCreated: { id: number; name: string }
  userDeleted: { id: number }
  orderPlaced: { orderId: string; amount: number }
}

class TypedEventEmitter<Events extends Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<(payload: unknown) => void>>()

  on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): this {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(listener as (payload: unknown) => void)
    return this
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners.get(event)?.forEach(listener => listener(payload))
  }

  off<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): void {
    this.listeners.get(event)?.delete(listener as (payload: unknown) => void)
  }
}

const emitter = new TypedEventEmitter<EventPayloads>()
emitter.on('userCreated', ({ id, name }) => {
  console.log(`观察者模式：用户创建 id=${id}, name=${name}`)
})
emitter.on('orderPlaced', ({ orderId, amount }) => {
  console.log(`观察者模式：订单 ${orderId} 金额 ¥${amount}`)
})

emitter.emit('userCreated', { id: 1, name: 'Alice' })
emitter.emit('orderPlaced', { orderId: 'ORD-001', amount: 299 })

// ─────────────────────────────────────────────
// 导出
// ─────────────────────────────────────────────
export function runDecoratorsAndPatterns(): void {
  console.log('\n========== 第九章：命名空间与设计模式 ==========')
  console.log('Namespace 验证：', errors)
  console.log('Symbol 属性：', obj[ID_KEY])
  console.log('Symbol.iterator Range：', rangeArr)
  console.log('asserts 断言：', processInput('hello'))
  console.log('isNonNull 过滤：', definiteValues)
  console.log('单例模式：', logger1 === logger2)
  console.log('建造者模式 SQL：', sql)
  emitter.emit('userCreated', { id: 99, name: 'Bob' })
}
