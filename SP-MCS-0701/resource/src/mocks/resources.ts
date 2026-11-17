export interface SatelliteRecord {
  id: string
  chineseName: string
  englishName: string
  internationalCode: string
  type: string
  network: string
  lifetime: string
  payloadCount: number
  status: string
  createdAt: string
  updatedAt: string
  updatedBy: string
  launchAt?: string
  mass?: string
  orbitHeight?: string
  localTime?: string
  phaseAngle?: string
  shortName?: string
  rollSpeed?: string
  yawSpeed?: string
  homeAngle?: string
  batchNo?: string
  batchName?: string
  satelliteNo?: string
  parseFlag?: string
  model?: string
}

export interface WorkPeriod { id: number; status: string; startAt: string; endAt: string; remark: string }
export interface OnboardStation { id: number; slot: string; stationId: string; stationName: string; remark: string }

export const initialSatellites: SatelliteRecord[] = [
  { id: 'MD1A', chineseName: '木铎1A', englishName: 'MD1A', internationalCode: '0001', type: '遥感卫星', network: '木铎', lifetime: '5', payloadCount: 1, status: '工作', createdAt: '2023-07-25 16:04:35', updatedAt: '2026-08-25 09:15:14', updatedBy: 'lilin', model: 'MDSatellite1A' },
  { id: 'MD1B', chineseName: '木铎1B', englishName: 'MD1B', internationalCode: '0002', type: '遥感卫星', network: '木铎', lifetime: '5', payloadCount: 1, status: '工作', createdAt: '2024-07-24 19:42:59', updatedAt: '2026-08-25 09:15:05', updatedBy: 'lilin' },
]

export const initialWorkPeriods: Record<string, WorkPeriod[]> = { MD1A: [], MD1B: [] }

export const initialOnboardStations: Record<string, OnboardStation[]> = {
  MD1A: [
    { id: 1, slot: '0', stationId: 'XYTC0402', stationName: '铜川0402--星邑', remark: '' },
    { id: 2, slot: '0', stationId: 'XYTC1102', stationName: '铜川1102-星邑', remark: '' },
    { id: 3, slot: '0', stationId: 'XYTC1101', stationName: '铜川1101-星邑', remark: '' },
  ],
  MD1B: [],
}
