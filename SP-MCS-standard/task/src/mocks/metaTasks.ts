import type { MetaTaskRecord } from '../types/metaTask'

export const metaTaskStatuses = ['待规划', '规划中', '规划失败', '规划成功', '执行中', '已完成', '已取消']
export const metaTaskTypes = ['双星提取', '双星观测', '应急提取', '应急观测', '单星提取', '单星观测', '协同提取']

export const metaTasks: MetaTaskRecord[] = [
  { id: '1407203269542345', requirementNo: 'RW202609080131001', type: '协同', satellite: 'MD1A', createdAt: '2026-09-10 04:00:36', priority: 8, status: '待规划', mark: '原始元任务', planningNo: 'MD1A#RW202609080131001=2516', startedAt: '2026-09-23 13:37:03', endedAt: '2026-09-23 13:40:06', payload: 'PMS', rollRange: '-39.38~33°' },
  { id: '1407203269476809', requirementNo: 'RW202609080131001', type: '协同', satellite: 'MD1A', createdAt: '2026-09-10 04:00:36', priority: 8, status: '待规划', mark: '原始元任务', planningNo: 'MD1A#RW202609080131001=2515', startedAt: '2026-09-23 12:02:37', endedAt: '2026-09-23 12:07:49', payload: 'PMS', rollRange: '-45~33°' },
  { id: '1407203269411273', requirementNo: 'RW202609080131001', type: '协同', satellite: 'MD1A', createdAt: '2026-09-10 04:00:36', priority: 8, status: '待规划', mark: '原始元任务', planningNo: 'MD1A#RW202609080131001=2514', startedAt: '2026-09-23 10:25:16', endedAt: '2026-09-23 10:32:50', payload: 'PMS', rollRange: '-45~27.71°' },
  { id: '1407203252830665', requirementNo: 'RW202609080131001', type: '协同', satellite: 'MD1A', createdAt: '2026-09-10 04:00:36', priority: 8, status: '待规划', mark: '原始元任务', planningNo: 'MD1A#RW202609080131001=2501', startedAt: '2026-09-22 13:46:44', endedAt: '2026-09-22 13:49:26', payload: 'PMS', rollRange: '-24.99~33°' },
  { id: '1407203252765129', requirementNo: 'RW202609080131001', type: '协同', satellite: 'MD1A', createdAt: '2026-09-10 04:00:36', priority: 8, status: '待规划', mark: '原始元任务', planningNo: 'MD1A#RW202609080131001=2500', startedAt: '2026-09-22 12:12:06', endedAt: '2026-09-22 12:16:14', payload: 'PMS', rollRange: '-45~33°' },
  { id: '1407203252699593', requirementNo: 'RW202609080131001', type: '协同', satellite: 'MD1A', createdAt: '2026-09-10 04:00:36', priority: 8, status: '待规划', mark: '原始元任务', planningNo: 'MD1A#RW202609080131001=2499', startedAt: '2026-09-22 10:34:32', endedAt: '2026-09-22 10:44:32', payload: 'PMS', rollRange: '-45~33°' },
]
