# format-n

数字格式化工具库，支持小数位控制、千分位、百分比、金额等格式化，内部使用 [BigNumber.js](https://mikemcl.github.io/bignumber.js/) 保证精度。

支持 **JavaScript** 和 **TypeScript**，提供完整类型定义。

## 安装

```bash
npm install format-n
# 或
pnpm add format-n
# 或
yarn add format-n
```

## 使用

```ts
import { formatDecimal, formatMoney, num2Percent, formatterPercentNum } from 'format-n'

// 基础格式化
formatDecimal(1234567.891, { thousands: true, placesMax: 2 })
// => '1,234,567.89'

// 强制补零
formatDecimal(1.5, { event: 'format', placesMax: 3, forceZero: true })
// => '1.500'

// 金额格式化（千分位 + 2位小数 + 补零）
formatMoney(1234567.891)
// => '1,234,567.89'

formatMoney(100)
// => '100.00'

// 百分比（默认带正号）
formatterPercentNum(0.125)
// => '+12.50%'

formatterPercentNum(-0.05, { plusSign: false })
// => '-5.00%'

// 百分比轻量版（不带正号）
num2Percent(0.125)
// => '12.50%'

// 实时输入格式化（用于 input 事件）
inputFormatDecimal('1234.567', { placesMax: 2 })
// => '1234.56'
```

## API

### `formatDecimal(value, options?)`

核心格式化函数，支持完整配置。

| 参数 | 类型 | 说明 |
|------|------|------|
| `value` | `number \| string` | 要格式化的数字 |
| `options.event` | `'blur' \| 'input' \| 'format' \| null` | 格式化事件，影响部分行为 |
| `options.placesMin` | `number \| null` | 最小小数位（不足补零，input 事件无效） |
| `options.placesMax` | `number \| null` | 最大小数位（为 0 时禁止输入小数） |
| `options.valueMin` | `number \| null` | 数值下限（input 事件无效） |
| `options.valueMax` | `number \| null` | 数值上限 |
| `options.intMax` | `number \| null` | 最大整数位数 |
| `options.abs` | `boolean \| null` | 取绝对值（不允许负数） |
| `options.nonZero` | `boolean \| null` | 不允许为 0（为 0 返回空，input 事件无效） |
| `options.forceZero` | `boolean \| null` | 按 placesMax 强制补零（input 事件无效） |
| `options.thousands` | `boolean \| null` | 千分位格式化（input 事件无效） |
| `options.plusSign` | `boolean \| null` | 正数添加 + 号（input 事件无效） |

### `inputFormatDecimal(value, options?)`

等同于 `formatDecimal(value, { event: 'input', ...options })`，专用于实时输入场景。

### `formatDecimalPlaces(value, decimal, options?)`

指定小数位格式化。

| 参数 | 类型 | 说明 |
|------|------|------|
| `value` | `number \| string` | 数字 |
| `decimal` | `number` | 保留小数位数 |
| `options.forceZero` | `boolean` | 强制补零，默认 `false` |
| `options.thousands` | `boolean` | 千分位，默认 `false` |

### `formatterPercentNum(num, options?)`

数字转百分比（乘以 100），兼容 BigNumber 精度。

| 参数 | 类型 | 说明 |
|------|------|------|
| `num` | `number \| string` | 数值（如 0.5 → 50%） |
| `options.decimal` | `number` | 小数位，默认 `2` |
| `options.forceZero` | `boolean` | 补零，默认 `true` |
| `options.plusSign` | `boolean` | 正数带 + 号，默认 `true` |
| `options.errValue` | `string \| number` | 非法值缺省，默认 `'--'` |

### `num2Percent(num, decimal?, errValue?)`

百分比轻量版：不带正号，默认 2 位小数，补零。

### `formatMoney(amount)`

金额格式化：千分位 + 2 位小数 + 强制补零。

## License

MIT
