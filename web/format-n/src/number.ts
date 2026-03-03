import BigNumber from 'bignumber.js'

/**
 * 小数位强制补零（内部方法）
 * @param _numStr 数字字符串
 * @param decimalPlaces 目标小数位数
 */
const forceZeroPadding = (_numStr: string, decimalPlaces: number): string => {
  const dotIndex = _numStr.indexOf('.')
  let currentDecimalPlaces
  if (dotIndex === -1) {
    _numStr += '.'
    currentDecimalPlaces = 0
  } else {
    currentDecimalPlaces = _numStr.length - dotIndex - 1
  }
  const neededZeroes = Math.max(0, decimalPlaces - currentDecimalPlaces)
  return _numStr.padEnd(_numStr.length + neededZeroes, '0')
}

/** formatDecimal 配置项 */
export interface FormatDecimalOptions {
  /**
   * 格式化事件
   * - `null` | `'blur'` 默认值，用于 @blur，不做特殊处理
   * - `'input'` 实时输入事件：取消部分补充/文本化；placesMin 失效，避免用户无法输入
   * - `'format'` 文本化展示：支持对 0 的格式化处理
   */
  event?: 'blur' | 'input' | 'format' | null
  /** 格式化数字最小值（input 事件无效，建议 @blur 处理） */
  valueMin?: number | null
  /** 格式化数字最大值 */
  valueMax?: number | null
  /** 最大整数位数 */
  intMax?: number | null
  /** 最小小数位数，不足时强制补零（input 事件无效） */
  placesMin?: number | null
  /** 最大小数位数，为 0 时不允许输入小数 */
  placesMax?: number | null
  /** 绝对值，仅允许 >= 0 的数字 */
  abs?: boolean | null
  /** 不允许为 0，为 0 则输出空（input 事件无效） */
  nonZero?: boolean | null
  /** 按最大小数位强制补零（input 事件无效；format 事件会对 0 补零） */
  forceZero?: boolean | null
  /** 千分位格式化（input 事件无效） */
  thousands?: boolean | null
  /** 正数添加 + 号（input 事件无效） */
  plusSign?: boolean | null
}

/**
 * 格式化数字为字符串，支持小数位控制、千分位、正负号等，内部使用 BigNumber 保证精度
 * @param value 要格式化的数字或数字字符串
 * @param options 配置参数
 * @returns 格式化后的字符串
 *
 * @example
 * formatDecimal(1234567.891, { thousands: true, placesMax: 2 }) // '1,234,567.89'
 * formatDecimal(0.5, { event: 'format', placesMax: 2, forceZero: true }) // '0.50'
 * formatDecimal(-0.001, { abs: true }) // '0.001'
 */
export const formatDecimal = (
  value: number | string,
  options: FormatDecimalOptions = {},
): string => {
  // 处理 null/undefined/空字符串
  if (value === null || value === undefined || value === '') return ''
  // 处理 number 类型的 NaN/Infinity
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) return ''
  // 处理字符串 'NaN'/'Infinity'/'-Infinity'
  if (
    typeof value === 'string' &&
    (value === 'NaN' || value === 'Infinity' || value === '-Infinity')
  )
    return ''

  // 科学计数法转普通字符串
  const notationRegex = /^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/
  let numberString = notationRegex.test(String(value))
    ? new BigNumber(value).toFormat({ decimalSeparator: '.', groupSeparator: '' })
    : String(value)

  // 过滤非数字字符（保留 - 和 .）
  numberString = numberString.replace(/[^-0-9.]+/g, '')

  // 0 格式化
  if (Number(numberString) === 0) {
    if (options.event !== 'input') {
      // blur/format：统一归一化为 '0'（处理 -0、0. 等）
      numberString = '0'
    } else if (numberString === '00') {
      // input：仅处理连续双零
      numberString = '0'
    }
  }

  // 处理多余的 -
  const minusIndex = numberString.indexOf('-')
  if (minusIndex !== -1) {
    const minusText = minusIndex === 0 ? '-' : ''
    numberString = minusText + numberString.replace(/-/g, '')
    // 处理 -. 为-
    numberString = numberString.replace(/-\./g, '-')
    if (numberString === '-' && options.event !== 'input') {
      numberString = ''
    }
  }

  // 首字符为 0 时，后面只能接小数点（兼容负数：-05 → -5，-0.5 保留）
  let dotIndex = numberString.indexOf('.')
  const isNegative = numberString.startsWith('-')
  const absStr = isNegative ? numberString.slice(1) : numberString
  if (absStr.startsWith('0') && absStr !== '0') {
    if (dotIndex !== -1) {
      // 保留 0.xxx 形式
      numberString = (isNegative ? '-' : '') + '0' + numberString.substring(dotIndex)
    } else {
      // 去掉前导零：005 → 5，-05 → -5
      const stripped = absStr.replace(/^0+/, '') || '0'
      numberString = (isNegative ? '-' : '') + stripped
    }
  }

  // 小数点处理
  dotIndex = numberString.indexOf('.')
  if (dotIndex !== -1) {
    if (dotIndex === 0) {
      numberString = numberString.substring(1)
    }
    dotIndex = numberString.indexOf('.')
    const numStr1 = numberString.substring(0, dotIndex + 1)
    let numStr2 = numberString.substring(dotIndex + 1).replace(/\./g, '')
    if (options.event !== 'input') {
      numStr2 = Number(numStr2) === 0 ? '' : numStr2
    }
    numberString = numStr1 + numStr2
    dotIndex = numberString.indexOf('.')
    if (dotIndex === numberString.length - 1 && options.event !== 'input') {
      numberString = numberString.replace(/\./g, '')
    }
  }

  // 取绝对值
  if (options.abs) {
    numberString = numberString.replace(/-/g, '')
  }

  // 非有限数字不继续处理
  if (!new BigNumber(numberString).isFinite()) {
    return numberString
  }

  const bigNumberValue = new BigNumber(numberString)

  // 最小值限制（input 事件无效）
  if (
    options.valueMin != null &&
    bigNumberValue.lt(String(options.valueMin)) &&
    options.event !== 'input'
  ) {
    numberString = String(options.valueMin)
  }

  // 最大值限制
  if (options.valueMax != null && bigNumberValue.gt(String(options.valueMax))) {
    numberString = String(options.valueMax)
  }

  // 整数位限制（负号不计入整数位数）
  if (options.intMax != null && Number(options.intMax) > 0) {
    dotIndex = numberString.indexOf('.')
    let intPart
    let decimalPart = ''
    if (dotIndex !== -1) {
      intPart = numberString.substring(0, dotIndex)
      decimalPart = numberString.substring(dotIndex)
    } else {
      intPart = numberString
    }
    const sign = intPart.startsWith('-') ? '-' : ''
    const digits = intPart.startsWith('-') ? intPart.slice(1) : intPart
    intPart = sign + digits.substring(0, Number(options.intMax))
    numberString = intPart + decimalPart
  }

  // 小数位处理
  if (Number(options.placesMax) === 0) {
    numberString = numberString?.split('.')?.[0]
  } else {
    if (options.placesMax != null && Number(options.placesMax) > 0) {
      dotIndex = numberString.indexOf('.')
      if (dotIndex !== -1) {
        numberString = numberString.substring(0, dotIndex + Number(options.placesMax) + 1)
        if (options.event !== 'input') {
          numberString = numberString.replace(/\.?0+$/, '')
          if (Number(numberString) === 0) {
            numberString = numberString.replace(/-/g, '')
          }
        }
      }
    }
    if (options.placesMin != null && Number(options.placesMin) > 0 && options.event !== 'input') {
      numberString = forceZeroPadding(numberString, Number(options.placesMin))
    }
  }

  const bigNumberConstValue = new BigNumber(numberString)

  // 不允许为 0（input 事件无效）
  if (bigNumberConstValue.isZero() && options.nonZero && options.event !== 'input') {
    return ''
  }

  // 为 0 时跳过后续格式化（format 事件除外）
  if (numberString === '0' && options.event !== 'format') {
    return '0'
  }

  // 强制补零
  if (
    options.forceZero &&
    options.placesMax != null &&
    Number(options.placesMax) > 0 &&
    options.event !== 'input'
  ) {
    numberString = forceZeroPadding(numberString, Number(options.placesMax))
  }

  // 千分位
  if (options.thousands && options.event !== 'input') {
    const numberArr = numberString.split('.')
    let intPart = numberArr[0]
    const decimalPart = numberArr[1] ? '.' + numberArr[1] : ''
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    numberString = intPart + decimalPart
  }

  // 正号
  if (options.plusSign && options.event !== 'input') {
    if (bigNumberConstValue.gt(0)) {
      numberString = `+${numberString}`
    }
  }

  return numberString
}

/**
 * 实时输入格式化（等同于 formatDecimal 固定 event: 'input'）
 * @param value 要格式化的数字或数字字符串
 * @param options 配置参数（event 固定为 'input'）
 * @returns 格式化后的字符串
 *
 * @example
 * inputFormatDecimal('1234.567', { placesMax: 2 }) // '1234.56'
 */
export const inputFormatDecimal = (
  value: number | string,
  options: Omit<FormatDecimalOptions, 'event'> = {},
): string => {
  return formatDecimal(value, { event: 'input', ...options })
}

/** formatDecimalPlaces 配置项 */
export interface FormatDecimalPlacesOptions {
  /** 强制补零，默认 false */
  forceZero?: boolean
  /** 千分位，默认 false */
  thousands?: boolean
}

/**
 * 数字格式化 - 指定小数位
 * @param value 数字或数字字符串
 * @param decimal 保留小数位数
 * @param options 配置项
 * @returns 格式化后的字符串
 *
 * @example
 * formatDecimalPlaces(1234.5, 2) // '1234.5'
 * formatDecimalPlaces(1234.5, 2, { forceZero: true }) // '1234.50'
 * formatDecimalPlaces(1234567.5, 2, { thousands: true }) // '1,234,567.5'
 */
export const formatDecimalPlaces = (
  value: number | string,
  decimal: number,
  options: FormatDecimalPlacesOptions = {},
): string => {
  const { forceZero = false, thousands = false } = options
  return formatDecimal(value, {
    event: 'format',
    placesMax: decimal,
    forceZero,
    thousands,
  })
}

/** formatNum2Percent 配置项 */
export interface FormatNum2PercentOptions {
  /** 保留小数位，默认 2 */
  decimal?: number
  /** 是否按小数位补零，默认 true */
  forceZero?: boolean
  /** 正数是否带 + 号，默认 true */
  plusSign?: boolean
  /** 缺省值，默认 '--' */
  errValue?: string | number
}

/**
 * 数字转百分比（兼容 BigNumber 精度，正数默认带 + 号）
 * @param num 数值（会乘以 100）
 * @param options 配置项
 * @returns 百分比字符串，如 '+12.50%'；非法数字返回 errValue（默认 '--'）
 *
 * @example
 * formatNum2Percent(0.125) // '+12.50%'
 * formatNum2Percent(-0.05, { plusSign: false }) // '-5.00%'
 * formatNum2Percent('abc') // '--'
 * formatNum2Percent('abc', { errValue: 0 }) // 0
 */
export function formatNum2Percent(
  num: number | string,
  options: FormatNum2PercentOptions & { errValue: number },
): string | number
export function formatNum2Percent(
  num: number | string,
  options?: FormatNum2PercentOptions,
): string
export function formatNum2Percent(
  num: number | string,
  options: FormatNum2PercentOptions = {},
): string | number {
  const { decimal = 2, forceZero = true, plusSign = true, errValue = '--' } = options

  const bigNumberValue = new BigNumber(num)
  if (!bigNumberValue.isFinite()) {
    return errValue
  }

  const multiplied = bigNumberValue.times(100)
  let result = multiplied.toString()

  if (decimal > 0) {
    if (forceZero) {
      result = forceZeroPadding(result, decimal)
    }
    const dotIndex = result.indexOf('.')
    if (dotIndex !== -1) {
      result = result.substring(0, dotIndex + decimal + 1)
    }
  } else {
    result = result.split('.')[0]
  }

  if (plusSign && multiplied.gt(0)) {
    result = `+${result}`
  }

  return `${result}%`
}

/**
 * 金额格式化：保留 2 位小数、强制补零、千分位
 * @param amount 金额数字或字符串
 * @returns 格式化后的金额字符串，如 '1,234,567.89'
 *
 * @example
 * formatMoney(1234567.891) // '1,234,567.89'
 * formatMoney(100) // '100.00'
 * formatMoney('abc') // ''
 */
export const formatMoney = (amount: number | string): string => {
  return formatDecimal(amount, {
    event: 'format',
    placesMax: 2,
    forceZero: true,
    thousands: true,
  })
}
