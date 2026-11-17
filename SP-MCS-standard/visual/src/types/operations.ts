export type SatelliteStatus = '正常' | '跟踪中' | '告警'

export interface SatelliteSnapshot {
  id: string
  name: string
  orbit: string
  status: SatelliteStatus
  elevationDeg: number
  rangeKm: number
  downlinkMHz: number
  updatedAt: string
}
