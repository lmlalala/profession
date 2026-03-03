/**
 * 第三章：接口（Interface）与类型别名（Type）
 *
 * 学习目标：
 *   1. 掌握 interface 和 type 的定义方式
 *   2. 理解两者的核心区别：合并、扩展、重定义
 *   3. 掌握接口继承、类型交叉、索引签名
 */

// ─────────────────────────────────────────────
// 3.1 Interface 基础
// ─────────────────────────────────────────────

interface IPerson {
  name: string
  age: number
  readonly id: number      // 只读属性，赋值后不可修改
  email?: string           // 可选属性
}

const alice: IPerson = { id: 1, name: 'Alice', age: 25 }
// alice.id = 2  // ❌ 只读属性不可修改
console.log('IPerson:', alice)

// 接口定义函数签名
interface IFormatter {
  (value: string, width: number): string
}
const padStart: IFormatter = (value, width) => value.padStart(width, '0')
console.log('接口函数签名：', padStart('42', 6)) // "000042"

// 接口定义索引签名
interface IStringMap {
  [key: string]: string
}
const headers: IStringMap = {
  'Content-Type': 'application/json',
  Authorization: 'Bearer token123',
}
console.log('索引签名：', headers['Content-Type'])

// ─────────────────────────────────────────────
// 3.2 Type 别名基础
// ─────────────────────────────────────────────

// type 可以定义任意类型，不只是对象
type ID = string | number
type Nullable<T> = T | null
type Callback = (err: Error | null, result?: string) => void

const userId: ID = 'user_001'
const maybeNull: Nullable<string> = null
console.log('type 别名：', userId, maybeNull)

// type 定义对象（与 interface 类似）
type TPoint = {
  x: number
  y: number
}
const point: TPoint = { x: 10, y: 20 }
console.log('type 对象：', point)

// ─────────────────────────────────────────────
// 3.3 Interface vs Type 核心区别
// ─────────────────────────────────────────────

// ① 接口可以声明合并（Declaration Merging）
interface IWindow {
  title: string
}
interface IWindow {
  width: number   // 自动合并到同名接口
}
const win: IWindow = { title: 'My App', width: 1920 }
console.log('接口声明合并：', win)

// ② type 不能重复定义
// type TWindow = { title: string }
// type TWindow = { width: number }  // ❌ 编译报错

// ③ 接口继承（extends）
interface IAnimal {
  name: string
  age: number
}
interface IDog extends IAnimal {
  breed: string
  bark(): string
}
const dog: IDog = { name: 'Rex', age: 3, breed: 'Labrador', bark: () => 'Woof!' }
console.log('接口继承：', dog)

// ④ type 交叉类型（&）
type TAnimal = { name: string; age: number }
type TCat = TAnimal & { indoor: boolean; meow(): string }
const cat: TCat = { name: 'Kitty', age: 2, indoor: true, meow: () => 'Meow!' }
console.log('type 交叉：', cat)

// ⑤ 接口可以继承 type，type 也可以继承接口
type TBase = { id: number }
interface IExtended extends TBase {
  label: string
}
const extended: IExtended = { id: 1, label: 'hello' }
console.log('接口继承 type：', extended)

// ─────────────────────────────────────────────
// 3.4 多接口继承
// ─────────────────────────────────────────────

interface ISerializable {
  serialize(): string
}
interface ILoggable {
  log(): void
}
interface IEntity extends ISerializable, ILoggable {
  id: number
  createdAt: Date
}

class UserEntity implements IEntity {
  id: number
  createdAt: Date
  name: string

  constructor(id: number, name: string) {
    this.id = id
    this.name = name
    this.createdAt = new Date()
  }
  serialize(): string {
    return JSON.stringify({ id: this.id, name: this.name })
  }
  log(): void {
    console.log(`[UserEntity] id=${this.id}, name=${this.name}`)
  }
}

const user = new UserEntity(1, 'Alice')
user.log()
console.log('多接口继承 serialize:', user.serialize())

// ─────────────────────────────────────────────
// 3.5 复杂嵌套类型
// ─────────────────────────────────────────────

// 参考 doc.ts 中的 LangDetailItem
type LangDetailItem = {
  [locale: string]: {
    language: {
      [key: string]: string
    }
  }
}

const i18n: LangDetailItem = {
  zh_CN: { language: { greeting: '你好', farewell: '再见' } },
  en_US: { language: { greeting: 'Hello', farewell: 'Goodbye' } },
  ja_JP: { language: { greeting: 'こんにちは', farewell: 'さようなら' } },
}
console.log('嵌套类型 i18n:', i18n.zh_CN.language.greeting)

// ─────────────────────────────────────────────
// 导出
// ─────────────────────────────────────────────
export function runInterfaceType(): void {
  console.log('\n========== 第三章：Interface 与 Type ==========')
  console.log('IPerson:', alice)
  console.log('接口函数签名 padStart:', padStart('42', 6))
  console.log('接口声明合并:', win)
  console.log('接口继承 IDog:', dog.bark())
  console.log('type 交叉 TCat:', cat.meow())
  console.log('i18n zh_CN:', i18n.zh_CN.language.greeting)
  user.log()
}
