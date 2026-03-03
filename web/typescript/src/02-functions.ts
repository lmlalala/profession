/**
 * 第二章：函数与类型断言
 *
 * 学习目标：
 *   1. 掌握函数参数和返回值的类型声明
 *   2. 理解可选参数、默认参数、剩余参数
 *   3. 掌握函数重载
 *   4. 理解类型断言（as / !）的使用场景
 */

// ─────────────────────────────────────────────
// 2.1 基础函数类型
// ─────────────────────────────────────────────

// 普通函数
function add(a: number, b: number): number {
  return a + b
}

// 箭头函数
const multiply = (a: number, b: number): number => a * b

// 函数类型别名
type MathOperation = (a: number, b: number) => number
const subtract: MathOperation = (a, b) => a - b

console.log('add(3, 4):', add(3, 4))
console.log('multiply(3, 4):', multiply(3, 4))
console.log('subtract(10, 3):', subtract(10, 3))

// ─────────────────────────────────────────────
// 2.2 可选参数 / 默认参数 / 剩余参数
// ─────────────────────────────────────────────

// 可选参数：用 ? 标记，必须放在必填参数之后
function greet(name: string, greeting?: string): string {
  return `${greeting ?? 'Hello'}, ${name}!`
}
console.log('可选参数：', greet('Alice'), greet('Bob', 'Hi'))

// 默认参数
function createUser(name: string, role: string = 'user', active: boolean = true) {
  return { name, role, active }
}
console.log('默认参数：', createUser('Alice'), createUser('Admin', 'admin'))

// 剩余参数（rest parameters）
function sum(...nums: number[]): number {
  return nums.reduce((acc, n) => acc + n, 0)
}
console.log('剩余参数 sum(1,2,3,4,5):', sum(1, 2, 3, 4, 5))

// ─────────────────────────────────────────────
// 2.3 函数重载（Overload）
// ─────────────────────────────────────────────
// 重载签名（只声明，不实现）
function format(value: string): string
function format(value: number): string
function format(value: Date): string
// 实现签名（必须兼容所有重载签名）
function format(value: string | number | Date): string {
  if (typeof value === 'string') return `字符串: ${value}`
  if (typeof value === 'number') return `数字: ${value.toFixed(2)}`
  return `日期: ${value.toLocaleDateString('zh-CN')}`
}
console.log('函数重载：', format('hello'), format(3.14159), format(new Date()))

// ─────────────────────────────────────────────
// 2.4 this 参数
// ─────────────────────────────────────────────

interface Counter {
  count: number
  increment(this: Counter): void
  reset(this: Counter): void
}
const counter: Counter = {
  count: 0,
  increment() { this.count++ },
  reset() { this.count = 0 },
}
counter.increment()
counter.increment()
console.log('this 参数 counter.count:', counter.count)

// ─────────────────────────────────────────────
// 2.5 类型断言（Type Assertion）
// ─────────────────────────────────────────────

// as 断言：告诉编译器"我比你更清楚这个值的类型"
const unknownVal: unknown = 'TypeScript is awesome'
const strLength: number = (unknownVal as string).length
console.log('as 断言 strLength:', strLength)

// 双重断言（先断言为 unknown，再断言为目标类型）
// 仅在确实必要时使用，否则绕过了类型安全
const numVal = (42 as unknown) as string
console.log('双重断言（慎用）:', numVal)

// 非空断言 !：告诉编译器"这个值一定不是 null/undefined"
function getElement(id: string): HTMLElement | null {
  // 模拟 DOM 查询（Node.js 环境中为 null）
  return null
}
const el = getElement('app')
// el!.innerHTML = 'hello'  // 若 el 为 null 则运行时报错，谨慎使用
console.log('非空断言（谨慎）: el =', el)

// 更安全的替代方案：可选链 + 空值合并
const safeText = el?.innerHTML ?? '元素不存在'
console.log('可选链替代非空断言：', safeText)

// ─────────────────────────────────────────────
// 2.6 类型守卫（Type Guard）
// ─────────────────────────────────────────────

// typeof 守卫
function processValue(val: string | number): string {
  if (typeof val === 'string') {
    return val.toUpperCase()
  }
  return val.toFixed(2)
}
console.log('typeof 守卫：', processValue('hello'), processValue(3.14))

// instanceof 守卫
class Dog { bark() { return 'Woof!' } }
class Cat { meow() { return 'Meow!' } }
function makeSound(animal: Dog | Cat): string {
  if (animal instanceof Dog) return animal.bark()
  return animal.meow()
}
console.log('instanceof 守卫：', makeSound(new Dog()), makeSound(new Cat()))

// in 操作符守卫
interface Fish { swim(): void }
interface Bird { fly(): void }
function move(animal: Fish | Bird): void {
  if ('swim' in animal) {
    animal.swim()
    console.log('in 守卫：鱼在游泳')
  } else {
    animal.fly()
    console.log('in 守卫：鸟在飞翔')
  }
}
move({ swim: () => {} })
move({ fly: () => {} })

// 自定义类型守卫（is 关键字）
function isString(val: unknown): val is string {
  return typeof val === 'string'
}
const maybeStr: unknown = 'hello'
if (isString(maybeStr)) {
  console.log('自定义守卫 is：', maybeStr.toUpperCase())
}

// ─────────────────────────────────────────────
// 导出
// ─────────────────────────────────────────────
export function runFunctions(): void {
  console.log('\n========== 第二章：函数与类型断言 ==========')
  console.log('add(3, 4):', add(3, 4))
  console.log('greet:', greet('Alice'), greet('Bob', 'Hi'))
  console.log('sum(1~5):', sum(1, 2, 3, 4, 5))
  console.log('format 重载：', format('hello'), format(3.14), format(new Date()))
  console.log('as 断言 length:', strLength)
  console.log('typeof 守卫：', processValue('hello'), processValue(3.14))
  console.log('instanceof 守卫：', makeSound(new Dog()), makeSound(new Cat()))
}
