import type { EmergencyHandlingConfig, EmergencyHandlingRecord } from '../types/emergency'

export const emergencyHandlingRecords: EmergencyHandlingRecord[] = [
  { id: '2099776557354651648', sourceNo: 'CX260915000014', taskNo: 'RW202609150111008', planNo: '12001500', processedAt: '2026-09-15 16:25:17', satellite: 'MD1B', taskType: '应急提取', uplinkStatus: '未上星', result: '成功', message: '处理成功' },
  { id: '2099776400353464320', sourceNo: 'CX260915000013', taskNo: 'RW202609150111007', planNo: '02001600', processedAt: '2026-09-15 16:24:40', satellite: 'MD1A', taskType: '应急提取', uplinkStatus: '未上星', result: '成功', message: '处理成功' },
  { id: '2099776154021990400', sourceNo: 'CX260915000012', taskNo: 'RW202609150111006', planNo: '12001400', processedAt: '2026-09-15 16:23:41', satellite: 'MD1B', taskType: '应急提取', uplinkStatus: '未上星', result: '成功', message: '处理成功' },
  { id: '2099775945250508800', sourceNo: 'CX260915000011', taskNo: 'RW202609150111005', planNo: '02001500', processedAt: '2026-09-15 16:22:51', satellite: 'MD1A', taskType: '应急提取', uplinkStatus: '未上星', result: '成功', message: '处理成功' },
  { id: '2079759421899632640', sourceNo: 'CX260722000002', taskNo: 'RW202607220112002', planNo: '12001100', processedAt: '2026-07-22 10:44:20', satellite: 'MD1B', taskType: '应急观测', uplinkStatus: '未上星', result: '成功', message: '处理成功' },
  { id: '2099774528024547328', sourceNo: 'CX260915000007', taskNo: 'RW202609150111002', planNo: '—', processedAt: '2026-09-15 16:17:14', satellite: 'MD1B', taskType: '应急提取', uplinkStatus: '未上星', result: '失败', message: '新增排期计划失败，请稍后重试（原始错误详情不在列表直接展示）' },
]

export const emergencyHandlingConfig: EmergencyHandlingConfig = {
  outsideArcDelaySeconds: 0,
  insideArcRemainingSeconds: 300,
  imagingLatestUplinkMinutes: 180,
  transferLatestUplinkMinutes: 180,
}
