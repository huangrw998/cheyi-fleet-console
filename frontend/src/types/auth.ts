export interface User {
  id: number
  name: string
  role: string
  phone: string
  created_at: string
}
export interface PublicOverview {
  vehicles: number
  drivers: number
  stores: number
  active_leases: number
}
