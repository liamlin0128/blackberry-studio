export interface PlanningRecord {
  id: string
  startedAt: string
  endedAt: string
  durationSeconds: number | null
  result: '完成' | '超时'
  progress: number
  triggerType: '自动' | '手动'
  requirementCount: number
  generatedCount: number
}

export interface PlanningLog {
  sequence: number
  time: string
  stage: string
  message: string
  detail?: string
}

export interface AreaPlanningTask {
  taskNo: string
  sourceNo: string
  name: string
  businessType: string
  status: string
  priority: number
  createdAt: string
  receivedAt: string
  earliestAt: string
  latestAt: string
  businessMode: string
  satelliteMode: string
  keyArea: string
  satellite: string
  payload: string
  longitude: number | null
  latitude: number | null
  scaleKm: number
  maxRollAngle: number
}

export interface AreaObservationStrip {
  no: number
  satellite: string
  payload: string
  widthKm: number
  startedAt: string
  endedAt: string
  rollAngle: number
}

export interface AreaPlanningResult {
  areaKm2: number
  stripCount: number
  coveragePercent: number
  durationDays: number
  daysBeforeDeadline: number
  windowStart: string
  windowEnd: string
  strips: AreaObservationStrip[]
}
