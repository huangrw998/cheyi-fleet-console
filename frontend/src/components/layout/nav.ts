import {
  ArrowsLeftRight,
  CarProfile,
  ChartLineUp,
  Gear,
  Images,
  Receipt,
  SquaresFour,
  SteeringWheel,
  Users,
  Wrench,
} from '@phosphor-icons/react'

export const navGroups = [
  {
    label: '运营',
    items: [
      { to: '/', label: '运营总览', icon: SquaresFour, end: true },
      { to: '/dispatch', label: '调度中心', icon: ArrowsLeftRight },
    ],
  },
  {
    label: '资产',
    items: [
      { to: '/models', label: '车型展厅', icon: Images },
      { to: '/vehicles', label: '车辆资产', icon: CarProfile },
      { to: '/maintenance', label: '维保保险', icon: Wrench },
    ],
  },
  {
    label: '业务',
    items: [
      { to: '/leases', label: '租约订单', icon: SteeringWheel },
      { to: '/drivers', label: '司机管理', icon: Users },
    ],
  },
  {
    label: '财务',
    items: [
      { to: '/finance', label: '财务账单', icon: Receipt },
      { to: '/reports', label: '数据报表', icon: ChartLineUp },
    ],
  },
  {
    label: '系统',
    items: [{ to: '/settings', label: '系统设置', icon: Gear }],
  },
]

export function pageTitle(pathname: string) {
  if (pathname === '/') return '运营总览'
  if (pathname.startsWith('/models/')) return '车型详情'
  if (pathname.startsWith('/vehicles/')) return '车辆详情'
  if (pathname.startsWith('/leases/new')) return '新建租约'
  if (pathname.startsWith('/leases/')) return '租约详情'
  if (pathname.startsWith('/drivers/')) return '司机详情'
  const map: Record<string, string> = {
    '/models': '车型展厅',
    '/vehicles': '车辆资产',
    '/leases': '租约订单',
    '/drivers': '司机管理',
    '/dispatch': '调度中心',
    '/maintenance': '维保保险',
    '/finance': '财务账单',
    '/reports': '数据报表',
    '/settings': '系统设置',
    '/credits': '素材与许可',
  }
  return map[pathname] ?? '驰驿'
}