export type PlanStatus = '待发送' | '已发送' | '已上星' | '已完成' | '执行失败' | '已取消' | '待确认'

export interface TaskPlanRecord {
  planNo: string
  arcId: string
  satellite: string
  type: string
  priority: number | '待确认'
  status: PlanStatus
  latestUploadAt: string
  executeStartAt: string
  executeEndAt: string
  createdAt: string
  sentAt: string
  station: string
  requirementNo: string
  metaTaskNo: string
  abnormal: boolean
  abnormalCount: number
  abnormalReason: string
}

export interface ManualPassRecord {
  id: string
  startedAt: string
  endedAt: string
  satellite: string
  creator: string
  remark: string
}

export type ManualPlanType = '轨控' | '数传' | '上注'

export interface ManualPlanContext {
  passId?: string
  satellite?: string
  startedAt?: string
  endedAt?: string
}

export interface TransmissionRecord {
  sequence: number
  planNo: string
  type: string
  timeliness: string
  sentAt: string
  status: '发送成功' | '发送失败'
  failureReason: string
}

export interface GanttTask {
  id: string
  satellite: string
  lane: '成像' | '数传' | '软件'
  phase: '上注' | '执行'
  status: PlanStatus | '执行成功'
  left: number
  width: number
}
