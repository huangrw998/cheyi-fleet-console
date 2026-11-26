export type MainlandCarrier = '中国移动' | '中国联通' | '中国电信' | '中国广电' | '虚拟运营商'

const carrierByPrefix: Record<string, MainlandCarrier> = {
  // 中国移动
  134: '中国移动', 135: '中国移动', 136: '中国移动', 137: '中国移动', 138: '中国移动',
  139: '中国移动', 147: '中国移动', 150: '中国移动', 151: '中国移动', 152: '中国移动',
  157: '中国移动', 158: '中国移动', 159: '中国移动', 172: '中国移动', 178: '中国移动',
  182: '中国移动', 183: '中国移动', 184: '中国移动', 187: '中国移动', 188: '中国移动',
  195: '中国移动', 197: '中国移动', 198: '中国移动',
  // 中国联通
  130: '中国联通', 131: '中国联通', 132: '中国联通', 145: '中国联通', 155: '中国联通',
  156: '中国联通', 166: '中国联通', 175: '中国联通', 176: '中国联通', 185: '中国联通',
  186: '中国联通', 196: '中国联通',
  // 中国电信
  133: '中国电信', 149: '中国电信', 153: '中国电信', 173: '中国电信', 177: '中国电信',
  180: '中国电信', 181: '中国电信', 189: '中国电信', 190: '中国电信', 191: '中国电信',
  193: '中国电信', 199: '中国电信',
  // 中国广电
  192: '中国广电',
  // 虚拟运营商
  162: '虚拟运营商', 165: '虚拟运营商', 167: '虚拟运营商', 170: '虚拟运营商', 171: '虚拟运营商',
}

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0086') && digits.length === 15) return digits.slice(4)
  if (digits.startsWith('86') && digits.length === 13) return digits.slice(2)
  return digits
}

export function detectCarrier(raw: string): MainlandCarrier | null {
  const phone = normalizePhone(raw)
  if (!/^1[3-9]\d{9}$/.test(phone)) return null
  return carrierByPrefix[phone.slice(0, 3)] ?? null
}

export function isValidMainlandPhone(raw: string): boolean {
  return detectCarrier(raw) !== null
}

export function isValidPhoneShape(raw: string): boolean {
  return /^1\d{10}$/.test(normalizePhone(raw))
}

export function formatPhone(raw: string): string {
  const phone = normalizePhone(raw)
  if (phone.length !== 11) return raw
  return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`
}