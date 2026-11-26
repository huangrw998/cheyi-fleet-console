import type { Lease } from './lease'
import type { Vehicle } from './vehicle'

export type DriverStatus = 'pending' | 'certified' | 'leased' | 'returned' | 'blacklisted'

export interface Driver {
  id: number
  name: string
  phone: string
  id_card_no: string
  license_no: string
  license_expiry: string
  status: DriverStatus
  rating: number
  joined_at: string
  emergency_contact: string
  note: string
  current_vehicle?: Vehicle
  current_lease?: Lease
}