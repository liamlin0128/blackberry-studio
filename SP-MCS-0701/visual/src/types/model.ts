export type ModelCategory = '卫星' | '相机' | '固存' | '地面站'

export interface SimulationModel {
  id: string
  name: string
  shortName: string
  category: ModelCategory
  version: string
  updateTime: string
  enabled: boolean
  description: string
  fileName?: string
}

export interface SimulationVersion {
  id: string
  name: string
  engine: string
  modelIds: string[]
}
