export interface ScheduleRecord {
  id: string
  startedAt: string
  endedAt: string
  durationSeconds: number
  result: '完成' | '失败'
  progress: number
  triggerType: '自动' | '手动'
}

export type ArcForecastStatus = '已占用' | '未占用'
export type ArcForecastType = '测控弧段' | '数传弧段' | '测控数传弧段'

export interface ArcForecastItem {
  sequence: number
  type: ArcForecastType
  status: ArcForecastStatus
  station: string
  timeWindow: string
  uploadPlans: number
  dataPlans: number
}

export interface ArcForecastDay {
  total: number
  occupied: number
  unoccupied: number
  uploadPlans: number
  dataPlans: number
  arcs: ArcForecastItem[]
}

export interface SatelliteArcForecast {
  key: string
  name: string
  id: string
  summary: {
    totalArcs: number
    occupied: number
    unoccupied: number
    uploadPlans: number
    dataPlans: number
  }
  days: ArcForecastDay[]
}

export type ArcForecastStepState = 'waiting' | 'active' | 'done'

export interface ArcForecastStep {
  label: string
  state: ArcForecastStepState
}

export interface AlgorithmRecord {
  id: string
  updatedAt: string
  name: string
  enabled: boolean
  remark: string
}
