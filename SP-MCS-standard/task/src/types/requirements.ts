export type RequirementStatus = '待规划' | '规划中' | '规划失败' | '规划成功' | '执行中' | '已完成' | '已取消'

export interface RequirementRow {
  taskNo: string
  sourceNo: string
  name: string
  taskType: string
  satellites: string
  priority: number
  status: RequirementStatus
  createdAt: string
  earliestAt: string
  latestAt: string
  plans: string[]
  coordinationResult: string
}
