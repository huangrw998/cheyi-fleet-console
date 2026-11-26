import { addMonths, differenceInCalendarDays, format, isValid, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function formatMoney(cents: number, compact = false): string {
  const yuan = (cents ?? 0) / 100
  if (compact && yuan >= 10000) {
    return `¥${(yuan / 10000).toFixed(yuan >= 100000 ? 1 : 2)}万`
  }
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(yuan)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-CN').format(value)
}

export function formatPercent(value: number, digits = 1): string {
  return `${Number(value || 0).toFixed(digits)}%`
}

export function formatDate(value?: string | null): string {
  if (!value) return '-'
  const d = typeof value === 'string' ? parseISO(value) : value
  return isValid(d) ? format(d, 'yyyy-MM-dd') : '-'
}

export function formatDateCN(value?: string | null): string {
  if (!value) return '-'
  const d = parseISO(value)
  return isValid(d) ? format(d, 'M月d日', { locale: zhCN }) : '-'
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '-'
  const d = parseISO(value)
  return isValid(d) ? format(d, 'yyyy-MM-dd HH:mm') : '-'
}

export function formatMonth(value?: string | null): string {
  if (!value) return '-'
  const d = parseISO(value)
  return isValid(d) ? format(d, 'yyyy年M月') : '-'
}

export function daysUntil(value?: string | null): number | null {
  if (!value) return null
  const d = parseISO(value)
  if (!isValid(d)) return null
  return differenceInCalendarDays(d, new Date())
}

export function initials(name?: string): string {
  if (!name) return '?'
  const clean = name.replace(/\s/g, '')
  return clean.slice(-2)
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function addMonthsISO(date: string, months: number): string {
  const d = parseISO(date)
  if (!isValid(d)) return date
  return format(addMonths(d, months), 'yyyy-MM-dd')
}

export function statusTone(status?: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  switch (status) {
    case 'available':
    case 'active':
    case 'paid':
    case 'certified':
    case 'completed':
    case 'handled':
      return 'success'
    case 'reserved':
    case 'pending_return':
    case 'pending_sign':
    case 'pending_pickup':
    case 'pending':
    case 'scheduled':
    case 'in_transit':
    case 'expiring':
      return 'warning'
    case 'returned':
    case 'rented':
    case 'leased':
    case 'in_progress':
    case 'pending_acceptance':
    case 'dispatch':
      return 'info'
    case 'overdue':
    case 'maintenance':
    case 'retired':
    case 'blacklisted':
    case 'cancelled':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function statusLabel(status?: string): string {
  const map: Record<string, string> = {
    available: '待租',
    reserved: '已锁定',
    rented: '在租',
    maintenance: '维保中',
    dispatch: '调拨中',
    retired: '停运',
    pending_sign: '待签约',
    pending_pickup: '待交车',
    active: '租用中',
    pending_return: '待退车',
    returned: '已退租',
    cancelled: '已取消',
    pending: '待收',
    paid: '已收',
    overdue: '逾期',
    waived: '免收',
    scheduled: '待排期',
    in_progress: '进行中',
    pending_acceptance: '待验收',
    completed: '已完成',
    in_transit: '在途',
    handled: '已处理',
    certified: '已认证',
    leased: '租用中',
    blacklisted: '黑名单',
  }
  return map[status ?? ''] ?? status ?? '-'
}

export function bodyTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    sedan: '轿车',
    suv: 'SUV',
    mpv: 'MPV',
    hatchback: '两厢',
    wagon: '旅行车',
  }
  return map[type ?? ''] ?? type ?? '-'
}

export function billTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    rent: '租金',
    deposit: '押金',
    violation: '违章',
    damage: '车损',
    penalty: '违约金',
  }
  return map[type ?? ''] ?? type ?? '-'
}

export function leaseStatusLabel(status?: string): string {
  return statusLabel(status)
}

export function daysText(days: number | null): string {
  if (days === null) return '-'
  if (days < 0) return `逾期 ${Math.abs(days)} 天`
  if (days === 0) return '今天'
  return `${days} 天后`
}