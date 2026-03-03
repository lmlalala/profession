/**
 * TypeScript 渐进式学习项目
 * ─────────────────────────────────────────────
 * 运行方式：
 *   pnpm dev          使用 ts-node 直接运行
 *   pnpm watch        监听文件变化自动重运行
 *   pnpm build        编译为 JS（输出到 dist/）
 *   pnpm typecheck    仅做类型检查，不输出文件
 *
 * 章节目录：
 *   01-basic-types.ts     基础类型（原始类型 / any / unknown / 数组 / 元组 / 枚举）
 *   02-functions.ts       函数（重载 / 类型守卫 / 断言）
 *   03-interface-type.ts  接口与类型别名（interface vs type）
 *   04-utility-types.ts   内置工具类型（Partial / Pick / Omit / Record ...）
 *   05-class.ts           类（修饰符 / 继承 / 抽象类 / 接口实现）
 *   06-generics.ts        泛型（函数 / 接口 / 类 / 约束 / 工具函数）
 *   07-builtin-objects.ts 内置对象（Date / RegExp / Promise / Map / Set ...）
 *   08-advanced-types.ts  高级类型（条件 / 映射 / 模板字面量 / infer / 递归）
 *   09-decorators.ts      命名空间 / Symbol / 类型守卫进阶 / 设计模式
 */

import { runBasicTypes } from './01-basic-types'
import { runFunctions } from './02-functions'
import { runInterfaceType } from './03-interface-type'
import { runUtilityTypes } from './04-utility-types'
import { runClass } from './05-class'
import { runGenerics } from './06-generics'
import { runBuiltinObjects } from './07-builtin-objects'
import { runAdvancedTypes } from './08-advanced-types'
import { runDecoratorsAndPatterns } from './09-decorators'

// 通过命令行参数选择运行指定章节，默认运行全部
// 用法：ts-node src/index.ts 1 3 5  （只运行第 1、3、5 章）
const args = process.argv.slice(2).map(Number).filter(Boolean)

const chapters: Array<{ title: string; run: () => void | Promise<void> }> = [
  { title: '第一章：基础类型',       run: runBasicTypes },
  { title: '第二章：函数与断言',     run: runFunctions },
  { title: '第三章：接口与类型别名', run: runInterfaceType },
  { title: '第四章：内置工具类型',   run: runUtilityTypes },
  { title: '第五章：类与接口实现',   run: runClass },
  { title: '第六章：泛型',           run: runGenerics },
  { title: '第七章：内置对象类型',   run: runBuiltinObjects },
  { title: '第八章：高级类型',       run: runAdvancedTypes },
  { title: '第九章：命名空间与设计模式', run: runDecoratorsAndPatterns },
]

async function main(): Promise<void> {
  const selected = args.length > 0
    ? chapters.filter((_, i) => args.includes(i + 1))
    : chapters

  if (args.length > 0) {
    console.log(`\n▶ 运行指定章节：${args.join(', ')}`)
  } else {
    console.log('\n▶ 运行全部章节')
  }

  for (const chapter of selected) {
    try {
      await chapter.run()
    } catch (err) {
      console.error(`\n[ERROR] ${chapter.title}：`, err)
    }
  }

  console.log('\n✅ 全部示例运行完毕')
}

main().catch(console.error)
