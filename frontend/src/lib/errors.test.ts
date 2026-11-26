import { describe, expect, it } from 'vitest'
import { errorText } from './errors'

describe('errorText', () => {
  it('uses an Error message when present', () => {
    expect(errorText(new Error('网络异常'), '操作失败')).toBe('网络异常')
  })

  it('falls back for unknown errors and empty messages', () => {
    expect(errorText('oops', '保存失败')).toBe('保存失败')
    expect(errorText(new Error(''), '保存失败')).toBe('保存失败')
  })
})