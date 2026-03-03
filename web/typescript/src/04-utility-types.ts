/**
 * 第四章：内置工具类型（Utility Types）
 *
 * 学习目标：
 *   1. 掌握 Partial / Required / Readonly
 *   2. 掌握 Pick / Omit / Record
 *   3. 掌握 Exclude / Extract / NonNullable / ReturnType / Parameters
 */

// ─────────────────────────────────────────────
// 基础类型定义（供本章使用）
// ─────────────────────────────────────────────

interface IUser {
  id: number
  name: string
  email: string
  age: number
  role: 'admin' | 'editor' | 'viewer'
  avatar?: string
}

// ─────────────────────────────────────────────
// 4.1 Partial<T> — 所有属性变为可选
// ─────────────────────────────────────────────

type PartialUser = Partial<IUser>
// 等价于：{ id?: number; name?: string; email?: string; ... }

function updateUser(id: number, patch: Partial<IUser>): IUser {
  const base: IUser = { id, name: 'Alice', email: 'alice@example.com', age: 25, role: 'viewer' }
  return { ...base, ...patch }
}
const updated = updateUser(1, { name: 'Bob', role: 'editor' })
console.log('Partial 更新用户：', updated)

// ─────────────────────────────────────────────
// 4.2 Required<T> — 所有属性变为必填
// ─────────────────────────────────────────────

type RequiredUser = Required<IUser>
// avatar 从可选变为必填

const fullUser: RequiredUser = {
  id: 1, name: 'Alice', email: 'alice@example.com',
  age: 25, role: 'admin', avatar: 'https://example.com/avatar.png',
}
console.log('Required 完整用户：', fullUser.avatar)

// ─────────────────────────────────────────────
// 4.3 Readonly<T> — 所有属性变为只读
// ─────────────────────────────────────────────

type ReadonlyUser = Readonly<IUser>
const frozenUser: ReadonlyUser = { id: 1, name: 'Alice', email: 'a@b.com', age: 25, role: 'viewer' }
// frozenUser.name = 'Bob'  // ❌ 只读，不可修改
console.log('Readonly 只读用户：', frozenUser.name)

// ─────────────────────────────────────────────
// 4.4 Pick<T, K> — 选取指定属性
// ─────────────────────────────────────────────

type UserPreview = Pick<IUser, 'id' | 'name' | 'avatar'>
// 等价于：{ id: number; name: string; avatar?: string }

const preview: UserPreview = { id: 1, name: 'Alice' }
console.log('Pick 用户预览：', preview)

// ─────────────────────────────────────────────
// 4.5 Omit<T, K> — 排除指定属性
// ─────────────────────────────────────────────

type UserWithoutSensitive = Omit<IUser, 'email' | 'age'>
// 等价于：{ id: number; name: string; role: ...; avatar?: string }

const safeUser: UserWithoutSensitive = { id: 1, name: 'Alice', role: 'viewer' }
console.log('Omit 脱敏用户：', safeUser)

// 组合使用：Omit + Required
interface IConfig {
  host: string
  port?: number
  timeout?: number
  debug?: boolean
}
type FullConfig = Omit<IConfig, 'debug'> & Required<Pick<IConfig, 'port' | 'timeout'>>
const config: FullConfig = { host: 'localhost', port: 3000, timeout: 5000 }
console.log('Omit + Required 组合：', config)

// ─────────────────────────────────────────────
// 4.6 Record<K, V> — 构造对象类型
// ─────────────────────────────────────────────

// 基础用法
type RolePermissions = Record<'admin' | 'editor' | 'viewer', string[]>
const permissions: RolePermissions = {
  admin: ['read', 'write', 'delete'],
  editor: ['read', 'write'],
  viewer: ['read'],
}
console.log('Record 权限：', permissions.admin)

// 动态 key
type PageMap = Record<string, { title: string; path: string }>
const pages: PageMap = {
  home: { title: '首页', path: '/' },
  about: { title: '关于', path: '/about' },
  contact: { title: '联系', path: '/contact' },
}
console.log('Record 页面映射：', pages.home)

// ─────────────────────────────────────────────
// 4.7 Exclude<T, U> — 从联合类型中排除
// ─────────────────────────────────────────────

type AllRoles = 'admin' | 'editor' | 'viewer' | 'guest'
type NonGuestRole = Exclude<AllRoles, 'guest'>
// 等价于：'admin' | 'editor' | 'viewer'

const role: NonGuestRole = 'editor'
console.log('Exclude 排除 guest：', role)

// ─────────────────────────────────────────────
// 4.8 Extract<T, U> — 从联合类型中提取
// ─────────────────────────────────────────────

type StringOrNumber = string | number | boolean | null
type OnlyStringOrNumber = Extract<StringOrNumber, string | number>
// 等价于：string | number

const val: OnlyStringOrNumber = 'hello'
console.log('Extract 提取：', val)

// ─────────────────────────────────────────────
// 4.9 NonNullable<T> — 排除 null 和 undefined
// ─────────────────────────────────────────────

type MaybeString = string | null | undefined
type DefiniteString = NonNullable<MaybeString>
// 等价于：string

const definite: DefiniteString = 'hello'
console.log('NonNullable：', definite)

// ─────────────────────────────────────────────
// 4.10 ReturnType<T> — 获取函数返回值类型
// ─────────────────────────────────────────────

function fetchUser(id: number) {
  return { id, name: 'Alice', email: 'alice@example.com' }
}
type FetchUserResult = ReturnType<typeof fetchUser>
// 等价于：{ id: number; name: string; email: string }

const result: FetchUserResult = fetchUser(1)
console.log('ReturnType：', result)

// ─────────────────────────────────────────────
// 4.11 Parameters<T> — 获取函数参数类型元组
// ─────────────────────────────────────────────

function createPost(title: string, content: string, tags: string[]): void {
  console.log('创建文章：', title)
}
type CreatePostParams = Parameters<typeof createPost>
// 等价于：[title: string, content: string, tags: string[]]

const params: CreatePostParams = ['TypeScript 入门', '内容...', ['ts', 'tutorial']]
createPost(...params)
console.log('Parameters：', params)

// ─────────────────────────────────────────────
// 4.12 InstanceType<T> — 获取构造函数实例类型
// ─────────────────────────────────────────────

class ApiClient {
  baseURL: string
  constructor(baseURL: string) { this.baseURL = baseURL }
  get(path: string) { return `GET ${this.baseURL}${path}` }
}
type ApiClientInstance = InstanceType<typeof ApiClient>
const client: ApiClientInstance = new ApiClient('https://api.example.com')
console.log('InstanceType：', client.get('/users'))

// ─────────────────────────────────────────────
// 导出
// ─────────────────────────────────────────────
export function runUtilityTypes(): void {
  console.log('\n========== 第四章：内置工具类型 ==========')
  console.log('Partial updateUser:', updated)
  console.log('Pick UserPreview:', preview)
  console.log('Omit safeUser:', safeUser)
  console.log('Record permissions.editor:', permissions.editor)
  console.log('Exclude NonGuestRole:', role)
  console.log('ReturnType fetchUser:', result)
  console.log('Parameters createPost:', params[0])
  console.log('InstanceType ApiClient:', client.get('/users'))
}
