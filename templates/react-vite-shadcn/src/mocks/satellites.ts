import type { SatelliteSnapshot } from '@/types/operations'

export const satelliteSnapshots: SatelliteSnapshot[] = [
  { id: 'SAT-01', name: '实践二十一号', orbit: 'LEO', status: '跟踪中', elevationDeg: 48.6, rangeKm: 1268, downlinkMHz: 2250.5, updatedAt: '2026-09-09 14:32:18 UTC+8' },
  { id: 'SAT-02', name: '中星十六号', orbit: 'GEO', status: '正常', elevationDeg: 36.2, rangeKm: 37842, downlinkMHz: 4198.2, updatedAt: '2026-09-09 14:32:15 UTC+8' },
  { id: 'SAT-03', name: '试验十三号', orbit: 'MEO', status: '告警', elevationDeg: 12.8, rangeKm: 19640, downlinkMHz: 2218.7, updatedAt: '2026-09-09 14:31:58 UTC+8' },
]
