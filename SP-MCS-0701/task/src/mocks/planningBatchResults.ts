import type { ScheduleRecord } from '../types/schedule'
export type BatchStatus = '计算中' | '成功' | '失败' | '超时' | '待确认' | '已自动确认' | '确认超时' | '已放弃' | '已人工确认'
export type BatchResultRecord = ScheduleRecord & { batchStatus?: BatchStatus; hasSnapshot: boolean; taskCount?: number }
export const batchResultExamples: BatchResultRecord[] = [
  { id:'BT-0701-001', startedAt:'2026-11-13 09:30:00', endedAt:'2026-11-13 09:30:04', durationSeconds:4, result:'完成', progress:100, triggerType:'手动', batchStatus:'待确认', hasSnapshot:true, taskCount:5 },
  { id:'BT-0701-002', startedAt:'2026-11-13 00:00:00', endedAt:'2026-11-13 00:00:03', durationSeconds:3, result:'完成', progress:100, triggerType:'自动', batchStatus:'已自动确认', hasSnapshot:true, taskCount:4 },
  { id:'BT-0701-003', startedAt:'2026-11-12 12:00:00', endedAt:'2026-11-12 12:00:05', durationSeconds:5, result:'完成', progress:100, triggerType:'自动', batchStatus:'确认超时', hasSnapshot:true, taskCount:3 },
  { id:'BT-0701-004', startedAt:'2026-11-12 08:00:00', endedAt:'2026-11-12 08:00:04', durationSeconds:4, result:'完成', progress:100, triggerType:'手动', batchStatus:'已放弃', hasSnapshot:true, taskCount:2 },
  { id:'BT-0701-005', startedAt:'2026-11-11 12:00:00', endedAt:'2026-11-11 12:00:03', durationSeconds:3, result:'失败', progress:67, triggerType:'自动', batchStatus:'失败', hasSnapshot:false, taskCount:3 },
  { id:'BT-0701-006', startedAt:'2026-11-11 08:00:00', endedAt:'2026-11-11 08:00:04', durationSeconds:4, result:'完成', progress:100, triggerType:'手动', batchStatus:'已人工确认', hasSnapshot:true, taskCount:5 },
  { id:'BT-0701-007', startedAt:'2026-11-10 12:00:00', endedAt:'2026-11-10 12:05:00', durationSeconds:300, result:'失败', progress:81, triggerType:'自动', batchStatus:'超时', hasSnapshot:false, taskCount:4 },
  { id:'BT-0701-008', startedAt:'2026-11-10 08:00:00', endedAt:'2026-11-10 08:00:04', durationSeconds:4, result:'完成', progress:100, triggerType:'自动', batchStatus:'成功', hasSnapshot:true, taskCount:2 },
  { id:'BT-0701-009', startedAt:'2026-11-10 00:00:00', endedAt:'', durationSeconds:0, result:'完成', progress:42, triggerType:'自动', batchStatus:'计算中', hasSnapshot:false, taskCount:3 },
]
