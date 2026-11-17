import type { DictionaryCategory, DictionaryEntry, OperationLogRecord, SystemLogRecord } from '../types/systemManagement'

export const dictionaryCategories: DictionaryCategory[] = [
  { id: '1003', name: '卫星状态' },
  { id: '1004', name: '光学载荷名称' },
  { id: '1005', name: '传感器类型' },
  { id: '1006', name: '像元分辨率' },
  { id: '1007', name: '谱段' },
  { id: '1008', name: '成像类型' },
  { id: '1009', name: '拍摄模式' },
  { id: '1010', name: '成像模式' },
  { id: '1011', name: '组网类型' },
  { id: '1012', name: '卫星其他能力' },
  { id: '1013', name: '用户状态' },
  { id: '1014', name: '卫星批次名' },
  { id: '1015', name: '天线类型' },
  { id: '1016', name: '天线状态' },
  { id: '1017', name: '卫星类型' },
  { id: '1018', name: '参数标签' },
  { id: '1019', name: '任务参数标签' },
  { id: '1020', name: '计划类型' },
  { id: '1021', name: '任务参数来源' },
]

export const dictionaryEntries: DictionaryEntry[] = [
  { id: '100304', categoryId: '1003', name: '离轨', value: '4', remark: '', status: '生效' },
  { id: '100303', categoryId: '1003', name: '测试', value: '3', remark: '', status: '生效' },
  { id: '100302', categoryId: '1003', name: '退役', value: '2', remark: '', status: '生效' },
  { id: '100301', categoryId: '1003', name: '故障', value: '1', remark: '', status: '生效' },
  { id: '100300', categoryId: '1003', name: '工作', value: '0', remark: '', status: '生效' },
]

export const systemLogRecords: SystemLogRecord[] = [
  { id: 1, operationType: '筹划算法调用', operator: 'system', startedAt: '2026-09-10 10:34:23', endedAt: '2026-09-10 10:34:32', moduleName: '筹划算法', action: '待确认', content: '{"payload":{"action":1,"tasks":[...]},"request_id":"d0439384-..."}', resultContent: '{}', result: '成功', exception: '' },
  { id: 2, operationType: '推送筹划结果', operator: 'system', startedAt: '2026-09-10 10:26:33', endedAt: '2026-09-10 10:26:34', moduleName: '筹划算法', action: '待确认', content: '{"request_id":"de9fd83b-...","code":100000,"message":"Coordination completed."}', resultContent: '{}', result: '成功', exception: '' },
  { id: 3, operationType: '区域筹划', operator: 'lilinlilin', startedAt: '2026-09-10 10:12:44', endedAt: '2026-09-10 10:12:44', moduleName: '筹划算法', action: '待确认', content: '{"payloads":{"task":{"task_id":"RW202609090121001"}}}', resultContent: '待确认', result: '失败', exception: '区域筹划请求失败，服务返回 500（证据样例）' },
]

export const operationLogRecords: OperationLogRecord[] = [
  { id: 1, operator: 'hwy001', system: 'scss', startedAt: '2026-09-10 10:32:09', endedAt: '2026-09-10 10:32:09', moduleName: '轨道保持监控', operationType: '分页查询轨道保持计算汇总记录', content: '{"pageNumber":1,"pageSize":30}', ipAddress: '192.168.4.132' },
  { id: 2, operator: 'hwy001', system: 'scss', startedAt: '2026-09-10 10:31:41', endedAt: '2026-09-10 10:31:41', moduleName: '轨道保持监控', operationType: '分页查询轨道保持计算汇总记录', content: '{"pageNumber":1,"pageSize":30}', ipAddress: '192.168.4.132' },
  { id: 3, operator: 'hwy001', system: 'scss', startedAt: '2026-09-10 10:31:28', endedAt: '2026-09-10 10:31:36', moduleName: '轨道管理', operationType: '手动新增轨道参数', content: '{"OrbitType":2,"satelliteId":"MD1A","TLE1":"1 99999U ...","TLE2":"2 99999 ..."}', ipAddress: '192.168.4.132' },
  { id: 4, operator: 'hwy001', system: 'scss', startedAt: '2026-09-10 10:31:06', endedAt: '2026-09-10 10:31:06', moduleName: '轨道保持监控', operationType: '轨道保持监控配置设置', content: '{"step":30,"thresholdDistance":{"maxDistance":1300,"minDistance":1200}}', ipAddress: '192.168.4.132' },
]
