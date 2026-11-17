export type DictionaryStatus = '生效' | '停用'

export interface DictionaryCategory {
  id: string
  name: string
}

export interface DictionaryEntry {
  id: string
  categoryId: string
  name: string
  value: string
  remark: string
  status: DictionaryStatus
}

export interface SystemLogRecord {
  id: number
  operationType: string
  operator: string
  startedAt: string
  endedAt: string
  moduleName: string
  action: string
  content: string
  resultContent: string
  result: '成功' | '失败'
  exception: string
}

export interface OperationLogRecord {
  id: number
  operator: string
  system: string
  startedAt: string
  endedAt: string
  moduleName: string
  operationType: string
  content: string
  ipAddress: string
}
