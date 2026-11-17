export type ObservationMode = '常规观测' | '星上规划任务' | '点目标多条带观测' | '凝视视频'
export type ProjectRequirementStatus = '已创建' | '执行中' | '已完成' | '取消中' | '已取消'
export type Target =
  | { kind: 'point'; coordinates: [number, number] }
  | { kind: 'polygon'; coordinates: [number, number][] }
  | { kind: 'administrative'; name: string }

export interface ProjectRequirement {
  id: string
  taskNo: string
  name: string
  satellite: string
  payloads: string[]
  businessType: '成像'
  businessMode: '单星成像'
  orderMode: '单次'
  observationMode: ObservationMode
  priority: 5 | 6 | 9
  rollAngle: number
  startAt: string
  endAt: string
  target: Target
  status: ProjectRequirementStatus
  createdAt: string
  linkedTask?: { no: string; status: string; type: string } | null
  plans?: { no: string; type: string; execMode: string; status: string }[]
  logs?: { time: string; text: string }[]
}
