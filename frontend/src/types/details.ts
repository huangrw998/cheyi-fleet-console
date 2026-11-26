import type { Bill } from './billing'
import type { Driver } from './driver'
import type { Lease } from './lease'
import type { InsurancePolicy, MaintenanceOrder, Violation } from './operations'
import type { Vehicle, VehicleModel } from './vehicle'

export interface ModelDetailData {
  model: VehicleModel
  vehicles: Vehicle[]
  related: VehicleModel[]
}

export interface VehicleDetailData {
  vehicle: Vehicle
  leases: Lease[]
  maintenance: MaintenanceOrder[]
  insurance: InsurancePolicy[]
  violations: Violation[]
}

export interface DriverDetailData {
  driver: Driver
  leases: Lease[]
  bills: Bill[]
  violations: Violation[]
}