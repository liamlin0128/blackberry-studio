import type { RequirementRow, RequirementStatus } from '../types/requirements'

export const requirementStatuses: RequirementStatus[] = ['待规划', '规划中', '规划失败', '规划成功', '执行中', '已完成', '已取消']
export const taskTypes = ['双星提取', '双星观测', '应急提取', '应急观测', '单星提取', '单星观测', '协同提取']
export const satellites = ['木铎1A', '木铎1B', '木铎1B,木铎1A']

export const requirementRows: RequirementRow[] = [
  { taskNo: 'RW202609090121002', sourceNo: 'CX260909000002', name: '1B规划090901', taskType: '单星提取', satellites: '木铎1B', priority: 12, status: '规划成功', createdAt: '2026-09-09 10:38:35', earliestAt: '2026-09-10 00:00:00', latestAt: '2026-09-16 23:59:59', plans: ['10002200', '15007400', '10002300', '15007300', '10002400', '15007600'], coordinationResult: '可执行(0/4)' },
  { taskNo: 'RW202609090121001', sourceNo: 'CX260909000001', name: '1A规划090901', taskType: '单星提取', satellites: '木铎1A', priority: 12, status: '规划成功', createdAt: '2026-09-09 10:38:11', earliestAt: '2026-09-10 00:00:00', latestAt: '2026-09-16 23:59:59', plans: ['00004100', '05006A00'], coordinationResult: '可执行(0/1)' },
  { taskNo: 'RW202609080131001', sourceNo: 'CX260908000001', name: '巡查任务', taskType: '协同提取', satellites: '木铎1B,木铎1A', priority: 8, status: '规划成功', createdAt: '2026-09-08 09:11:30', earliestAt: '2026-09-09 00:00:00', latestAt: '2026-09-30 23:59:59', plans: ['01006200', '15007000', '11006300'], coordinationResult: '可执行(0/22)' },
  { taskNo: 'RW202609070131001', sourceNo: 'CX260907000005', name: '巡查任务', taskType: '协同提取', satellites: '木铎1B,木铎1A', priority: 8, status: '已取消', createdAt: '2026-09-07 13:40:33', earliestAt: '2026-09-07 13:40:21', latestAt: '2026-09-30 23:59:59', plans: [], coordinationResult: '可执行(0/24)' },
  { taskNo: 'RW202609070121002', sourceNo: 'CX260907000002', name: 'ceshi成像提交', taskType: '单星提取', satellites: '木铎1A', priority: 14, status: '待规划', createdAt: '2026-09-07 11:31:58', earliestAt: '2026-09-07 11:30:28', latestAt: '2026-10-07 23:59:59', plans: [], coordinationResult: '可执行(0/1)' },
  { taskNo: 'RW202609070121001', sourceNo: 'CX260907000001', name: '1111111111111111111111111', taskType: '单星提取', satellites: '木铎1A', priority: 14, status: '规划成功', createdAt: '2026-09-07 11:31:54', earliestAt: '2026-09-07 11:21:58', latestAt: '2026-10-13 23:59:59', plans: ['00004000', '05006800'], coordinationResult: '可执行(0/1)' },
  { taskNo: 'RW202608310121013', sourceNo: 'CX260831000013', name: '1A规划07', taskType: '单星提取', satellites: '木铎1A', priority: 12, status: '已完成', createdAt: '2026-08-31 14:16:28', earliestAt: '2026-09-01 00:00:00', latestAt: '2026-09-05 23:59:59', plans: ['00003D00', '05006200'], coordinationResult: '超时已完成(0/1)' },
  { taskNo: 'RW202609010111001', sourceNo: 'CX260901000001', name: '测试用户端成像需求提交260901_1', taskType: '应急提取', satellites: '木铎1A', priority: 6, status: '规划成功', createdAt: '2026-09-01 17:49:42', earliestAt: '2026-09-01 17:48:59', latestAt: '2026-09-02 17:48:59', plans: ['02001300'], coordinationResult: '可执行(0/1)' },
]
