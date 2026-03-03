import { describe, it, expect } from 'vitest'
import {
  formatDecimal,
  inputFormatDecimal,
  formatDecimalPlaces,
  formatNum2Percent,
  formatMoney,
} from '../number'

describe('formatDecimal', () => {
  describe('空值处理', () => {
    it('null 返回空字符串', () => {
      expect(formatDecimal(null as unknown as string)).toBe('')
    })
    it('undefined 返回空字符串', () => {
      expect(formatDecimal(undefined as unknown as string)).toBe('')
    })
    it('空字符串返回空字符串', () => {
      expect(formatDecimal('')).toBe('')
    })
    it('NaN 返回空字符串', () => {
      expect(formatDecimal(NaN)).toBe('')
    })
    it('Infinity 返回空字符串', () => {
      expect(formatDecimal(Infinity)).toBe('')
    })
    it('字符串 NaN 返回空字符串', () => {
      expect(formatDecimal('NaN')).toBe('')
    })
  })

  describe('基础数字格式化', () => {
    it('整数原样返回', () => {
      expect(formatDecimal(123)).toBe('123')
    })
    it('小数原样返回', () => {
      expect(formatDecimal(1.5)).toBe('1.5')
    })
    it('负数原样返回', () => {
      expect(formatDecimal(-3.14)).toBe('-3.14')
    })
    it('0 返回 "0"', () => {
      expect(formatDecimal(0)).toBe('0')
    })
    it('科学计数法转普通字符串', () => {
      expect(formatDecimal(1e10)).toBe('10000000000')
    })
  })

  describe('placesMax - 最大小数位', () => {
    it('截断超出的小数位', () => {
      expect(formatDecimal(1.999, { placesMax: 2 })).toBe('1.99')
    })
    it('placesMax 为 0 时去掉小数部分', () => {
      expect(formatDecimal(3.7, { placesMax: 0 })).toBe('3')
    })
    it('小数位不足时不补零（默认）', () => {
      expect(formatDecimal(1.5, { placesMax: 3 })).toBe('1.5')
    })
  })

  describe('placesMin - 最小小数位补零', () => {
    it('不足时补零', () => {
      expect(formatDecimal(1.5, { placesMin: 3 })).toBe('1.500')
    })
    it('整数补零', () => {
      expect(formatDecimal(5, { placesMin: 2 })).toBe('5.00')
    })
  })

  describe('forceZero - 按 placesMax 强制补零', () => {
    it('按 placesMax 补零', () => {
      expect(formatDecimal(0.5, { event: 'format', placesMax: 2, forceZero: true })).toBe('0.50')
    })
    it('整数强制补零', () => {
      expect(formatDecimal(100, { event: 'format', placesMax: 2, forceZero: true })).toBe('100.00')
    })
  })

  describe('thousands - 千分位', () => {
    it('整数千分位', () => {
      expect(formatDecimal(1234567, { thousands: true })).toBe('1,234,567')
    })
    it('小数千分位', () => {
      expect(formatDecimal(1234567.891, { thousands: true, placesMax: 2 })).toBe('1,234,567.89')
    })
    it('负数千分位', () => {
      expect(formatDecimal(-1234567, { thousands: true })).toBe('-1,234,567')
    })
  })

  describe('abs - 绝对值', () => {
    it('负数取绝对值', () => {
      expect(formatDecimal(-0.001, { abs: true })).toBe('0.001')
    })
    it('正数不变', () => {
      expect(formatDecimal(5, { abs: true })).toBe('5')
    })
  })

  describe('valueMin / valueMax - 数值范围限制', () => {
    it('小于 valueMin 时返回 valueMin', () => {
      expect(formatDecimal(-5, { valueMin: 0 })).toBe('0')
    })
    it('大于 valueMax 时返回 valueMax', () => {
      expect(formatDecimal(200, { valueMax: 100 })).toBe('100')
    })
    it('在范围内时原样返回', () => {
      expect(formatDecimal(50, { valueMin: 0, valueMax: 100 })).toBe('50')
    })
  })

  describe('nonZero - 不允许为 0', () => {
    it('值为 0 时返回空字符串', () => {
      expect(formatDecimal(0, { nonZero: true })).toBe('')
    })
    it('非零值正常返回', () => {
      expect(formatDecimal(1, { nonZero: true })).toBe('1')
    })
  })

  describe('plusSign - 正数加号', () => {
    it('正数添加 + 号', () => {
      expect(formatDecimal(5, { plusSign: true })).toBe('+5')
    })
    it('负数不加 + 号', () => {
      expect(formatDecimal(-5, { plusSign: true })).toBe('-5')
    })
    it('0 不加 + 号', () => {
      expect(formatDecimal(0, { plusSign: true })).toBe('0')
    })
  })

  describe('intMax - 最大整数位', () => {
    it('超出整数位时截断', () => {
      expect(formatDecimal(12345, { intMax: 3 })).toBe('123')
    })
    it('负数整数位截断', () => {
      expect(formatDecimal(-12345, { intMax: 3 })).toBe('-123')
    })
  })

  describe('event: input - 实时输入模式', () => {
    it('保留末尾小数点', () => {
      expect(formatDecimal('1.', { event: 'input' })).toBe('1.')
    })
    it('不补零', () => {
      expect(formatDecimal('1.5', { event: 'input', placesMin: 3 })).toBe('1.5')
    })
    it('截断超出小数位', () => {
      expect(formatDecimal('1.999', { event: 'input', placesMax: 2 })).toBe('1.99')
    })
  })
})

describe('inputFormatDecimal', () => {
  it('等同于 event: input 的 formatDecimal', () => {
    expect(inputFormatDecimal('1.', { placesMax: 2 })).toBe('1.')
  })
  it('截断超出小数位', () => {
    expect(inputFormatDecimal('1234.567', { placesMax: 2 })).toBe('1234.56')
  })
})

describe('formatDecimalPlaces', () => {
  it('保留指定小数位（不补零）', () => {
    expect(formatDecimalPlaces(1234.5, 2)).toBe('1234.5')
  })
  it('forceZero 补零', () => {
    expect(formatDecimalPlaces(1234.5, 2, { forceZero: true })).toBe('1234.50')
  })
  it('千分位', () => {
    expect(formatDecimalPlaces(1234567.5, 2, { thousands: true })).toBe('1,234,567.5')
  })
  it('整数不补零', () => {
    expect(formatDecimalPlaces(100, 2)).toBe('100')
  })
})

describe('formatNum2Percent', () => {
  it('正数默认带 + 号和 2 位小数', () => {
    expect(formatNum2Percent(0.125)).toBe('+12.50%')
  })
  it('负数不带 + 号', () => {
    expect(formatNum2Percent(-0.05, { plusSign: false })).toBe('-5.00%')
  })
  it('非法字符串返回默认 errValue "--"', () => {
    expect(formatNum2Percent('abc')).toBe('--')
  })
  it('非法字符串返回自定义 errValue', () => {
    expect(formatNum2Percent('abc', { errValue: 0 })).toBe(0)
  })
  it('0 返回 "0.00%"', () => {
    expect(formatNum2Percent(0)).toBe('0.00%')
  })
  it('自定义小数位', () => {
    expect(formatNum2Percent(0.1, { decimal: 0 })).toBe('+10%')
  })
  it('不补零', () => {
    expect(formatNum2Percent(0.1, { forceZero: false })).toBe('+10%')
  })
})

describe('formatMoney', () => {
  it('标准金额格式化', () => {
    expect(formatMoney(1234567.891)).toBe('1,234,567.89')
  })
  it('整数补两位小数', () => {
    expect(formatMoney(100)).toBe('100.00')
  })
  it('负数金额', () => {
    expect(formatMoney(-1234.5)).toBe('-1,234.50')
  })
  it('非法字符串返回 "0.00"', () => {
    expect(formatMoney('abc')).toBe('0.00')
  })
  it('0 默认开启 forceZero 后返回 "0.00"', () => {
    expect(formatMoney(0)).toBe('0.00')
  })
})
