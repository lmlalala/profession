/**
 * 第一章：基础类型
 *
 * 学习目标：
 *   1. 掌握 TypeScript 原始类型的声明方式
 *   2. 理解 any / unknown / void / never 的区别
 *   3. 掌握数组、元组、枚举的使用
 */

// ─────────────────────────────────────────────
// 1.1 原始类型（Primitive Types）
// ─────────────────────────────────────────────

const str: string = 'hello TypeScript'
const num: number = 42
const bool: boolean = true
const empty: undefined = undefined
const nothing: null = null

// Symbol：每次调用 Symbol() 都会创建唯一值
const sym1: symbol = Symbol('id')
const sym2: symbol = Symbol('id')
console.log('Symbol 唯一性：', sym1 === sym2) // false

// BigInt：用于超过 Number.MAX_SAFE_INTEGER 的整数
const bigIntVal: bigint = 9007199254740993n
console.log('BigInt 示例：', bigIntVal)

// ─────────────────────────────────────────────
// 1.2 任意类型（any / unknown / void / never）
// ─────────────────────────────────────────────

// any：关闭类型检查，慎用
let anyVal: any = 'hello'
anyVal = 42
anyVal = { name: 'ts' }
console.log('any 可以任意赋值：', anyVal)

// unknown：比 any 更安全，使用前必须做类型收窄
let unknownVal: unknown = 'hello'
// unknownVal.toUpperCase()  // ❌ 编译报错
if (typeof unknownVal === 'string') {
  console.log('unknown 收窄后使用：', unknownVal.toUpperCase()) // ✅
}

// void：函数无返回值时使用
function logMessage(msg: string): void {
  console.log('void 函数：', msg)
}
logMessage('无返回值')

// never：永远不会有值（抛出异常 / 无限循环）
function throwError(msg: string): never {
  throw new Error(msg)
}
function exhaustiveCheck(value: never): never {
  throw new Error(`未处理的类型: ${value}`)
}

// ─────────────────────────────────────────────
// 1.3 数组（Array）
// ─────────────────────────────────────────────

const arr1: string[] = ['a', 'b', 'c']
const arr2: Array<number> = [1, 2, 3]           // 泛型写法，等价于 number[]
const arr3: Array<number | string> = [1, 'two', 3]
console.log('数组示例：', arr1, arr2, arr3)

// ─────────────────────────────────────────────
// 1.4 元组（Tuple）
// ─────────────────────────────────────────────
// 元组：固定长度、固定顺序、固定类型的数组

const tuple: [string, number, boolean] = ['Alice', 18, true]
console.log('元组访问：', tuple[0], tuple[1], tuple[2])

// 可选元素元组
const optionalTuple: [string, number?] = ['Bob']
console.log('可选元组：', optionalTuple)

// 具名元组（TypeScript 4.0+）
const namedTuple: [name: string, age: number] = ['Charlie', 25]
console.log('具名元组：', namedTuple)

// ─────────────────────────────────────────────
// 1.5 枚举（Enum）
// ─────────────────────────────────────────────

// 数字枚举（默认从 0 开始自增）
enum Direction {
  Up,     // 0
  Down,   // 1
  Left,   // 2
  Right,  // 3
}
console.log('数字枚举：', Direction.Up, Direction.Right) // 0, 3
console.log('反向映射：', Direction[0]) // "Up"

// 指定起始值
enum StatusCode {
  OK = 200,
  NotFound = 404,
  InternalError = 500,
}
console.log('状态码枚举：', StatusCode.OK, StatusCode.NotFound)

// 字符串枚举（无反向映射）
enum Theme {
  Light = 'light',
  Dark = 'dark',
}
console.log('字符串枚举：', Theme.Light, Theme.Dark)

// const 枚举：编译后会被内联，不生成对象，性能更好
const enum Season {
  Spring = '春',
  Summer = '夏',
  Autumn = '秋',
  Winter = '冬',
}
const currentSeason: Season = Season.Summer
console.log('const 枚举：', currentSeason)

// ─────────────────────────────────────────────
// 1.6 字面量类型（Literal Types）
// ─────────────────────────────────────────────

// 字符串字面量联合类型
type Alignment = 'left' | 'center' | 'right'
const align: Alignment = 'center'
console.log('字面量类型：', align)

// 数字字面量联合类型
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6
const dice: DiceValue = 6
console.log('骰子点数：', dice)

// 布尔字面量
type AlwaysTrue = true
const flag: AlwaysTrue = true
console.log('布尔字面量：', flag)

// ─────────────────────────────────────────────
// 导出供 index.ts 调用
// ─────────────────────────────────────────────
export function runBasicTypes(): void {
  console.log('\n========== 第一章：基础类型 ==========')
  console.log('原始类型：', { str, num, bool, empty, nothing })
  console.log('Symbol 唯一性：', sym1 === sym2)
  console.log('BigInt：', bigIntVal)
  console.log('any 示例：', anyVal)
  console.log('unknown 收窄：', typeof unknownVal === 'string' ? unknownVal.toUpperCase() : '非字符串')
  console.log('数组：', arr1, arr2, arr3)
  console.log('元组：', tuple)
  console.log('枚举 Direction.Right：', Direction.Right)
  console.log('枚举反向映射 Direction[0]：', Direction[0])
  console.log('字符串枚举 Theme.Dark：', Theme.Dark)
  console.log('字面量类型 align：', align)
}
