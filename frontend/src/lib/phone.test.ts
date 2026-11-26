import { describe, expect, it } from 'vitest'
import { detectCarrier, formatPhone, isValidMainlandPhone, isValidPhoneShape, normalizePhone } from './phone'

describe('phone helpers', () => {
  it('normalizes country code and separators', () => {
    expect(normalizePhone('+86 139 0188 7261')).toBe('13901887261')
    expect(normalizePhone('8613901887261')).toBe('13901887261')
    expect(normalizePhone('0086 139-0188-7261')).toBe('13901887261')
  })

  it('detects mainland carriers by prefix', () => {
    expect(detectCarrier('13901887261')).toBe('中国移动')
    expect(detectCarrier('13001887261')).toBe('中国联通')
    expect(detectCarrier('18901887261')).toBe('中国电信')
    expect(detectCarrier('19201887261')).toBe('中国广电')
    expect(detectCarrier('17001887261')).toBe('虚拟运营商')
  })

  it('rejects invalid formats and unknown segments', () => {
    expect(isValidMainlandPhone('14001887261')).toBe(false)
    expect(isValidMainlandPhone('23801887261')).toBe(false)
    expect(isValidMainlandPhone('1380188726')).toBe(false)
    expect(isValidMainlandPhone('139018872611')).toBe(false)
    expect(isValidMainlandPhone('12388888888')).toBe(false)
    expect(isValidPhoneShape('12388888888')).toBe(true)
  })

  it('formats an 11 digit number for display', () => {
    expect(formatPhone('13901887261')).toBe('139 0188 7261')
  })
})