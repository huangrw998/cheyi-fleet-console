import type { Driver } from './driver'
import type { Lease } from './lease'
import type { Vehicle, VehicleModel } from './vehicle'

export interface SearchResults {
  models: VehicleModel[]
  vehicles: Vehicle[]
  drivers: Driver[]
  leases: Lease[]
}