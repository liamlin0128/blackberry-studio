export type InstanceStatus = 'initial' | 'running' | 'paused' | 'stopped'
export type SceneStatus = 'active' | 'archived'

export interface SimulationInstance {
  id: string
  recordNo: string
  name: string
  instanceType: '在线仿真' | '模拟仿真' | '推演仿真'
  type: string
  scene: string
  status: InstanceStatus
  recordTime: string
  runtime: string
  color: string
}

export interface CreateSimulationInstancePayload {
  name: string
  instanceType: SimulationInstance['instanceType']
  scene: string
  modelNames: string[]
}

export interface SimulationInstanceLog {
  id: string
  instanceId: string
  time: string
  level: 'operation' | 'error'
  action: string
  content: string
  source: string
  operator: string
}

export interface SimulationScene {
  id: string
  name: string
  shortName: string
  type: string
  scheduleMethod: string
  editor: string
  editTime: string
  createTime: string
  status: SceneStatus
  startTime: string
  version: string
  description: string
}
