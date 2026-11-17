export type EmergencyTaskType = '应急提取' | '应急观测'

export interface EmergencyHandlingRecord {
  id: string
  sourceNo: string
  taskNo: string
  planNo: string
  processedAt: string
  satellite: string
  taskType: EmergencyTaskType
  uplinkStatus: '未上星'
  result: '成功' | '失败'
  message: string
}

export interface EmergencyHandlingConfig {
  outsideArcDelaySeconds: number
  insideArcRemainingSeconds: number
  imagingLatestUplinkMinutes: number
  transferLatestUplinkMinutes: number
}
