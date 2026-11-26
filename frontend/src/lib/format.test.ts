import { describe, expect, it } from 'vitest'
import { addMonthsISO, bodyTypeLabel, formatMoney, formatPercent, statusLabel } from './format'

describe('format helpers', () => {
  it('formats money in yuan from cents', () => {
    expect(formatMoney(428000)).toBe('¥4,280')
    expect(formatMoney(1000000, true)).toContain('1.00万')
  })

  it('formats percentages', () => {
    expect(formatPercent(47.916)).toBe('47.9%')
  })

  it('maps status and body type labels', () => {
    expect(statusLabel('active')).toBe('租用中')
    expect(statusLabel('pending_pickup')).toBe('待交车')
    expect(bodyTypeLabel('suv')).toBe('SUV')
  })

  it('adds months without overflowing month-end', () => {
    expect(addMonthsISO('2026-01-31', 1)).toBe('2026-02-28')
    expect(addMonthsISO('2026-11-25', 6)).toBe('2027-05-25')
  })
})
