export type ParameterCategory = '基础配置参数' | '卫星型号参数' | '任务模板参数'

export interface ParameterSet {
  id: string
  category: ParameterCategory
  name: string
  version: string
  updatedBy: string
  updatedAt: string
}

export interface ManagedParameter {
  id: string
  group: string
  code: string
  name: string
  description: string
  type: string
  length: string
  unitOrHandling: string
  value: string
}
