import type { ObservationMode, ProjectRequirement } from '../types/projectRequirement'

export const projectSatellite = '甘肃资源环境小卫星'
export const projectPayloads = ['可见光', '红外', '宽幅相机'] as const
export const projectPayloadOptions = [
  { value: '可见光', description: '幅宽 60km · 全色 2m · 多光谱 8m' },
  { value: '红外', description: '幅宽 30km · 分辨率 6m · 热红外成像' },
  { value: '宽幅相机', description: '幅宽 100km · 分辨率 16m · 宽幅普查' },
] as const
export const observationModes: { value: ObservationMode; hint: string; code: string }[] = [
  { value: '常规观测', hint: '目标点 / 绘制区域 / 行政区', code: '22' },
  { value: '点目标多条带观测', hint: '仅目标点', code: '24' },
  { value: '凝视视频', hint: '目标选择规则待定', code: '25' },
  { value: '星上规划任务', hint: '实验模式 · 仅目标点', code: '23' },
]

const storageKey = 'sp-mcs-0701-requirements-v3'
// V3.0 参考稿中的演示需求。只用于原型展示，不表示已接入任务或计划服务。
const examples: ProjectRequirement[] = [
  { id: 'RQ20261030001', taskNo: 'RW202610300122001', name: '兰州新区土地利用监测', satellite: projectSatellite, payloads: ['可见光'], businessType: '成像', businessMode: '单星成像', orderMode: '单次', observationMode: '常规观测', priority: 9, rollAngle: 25, startAt: '2026-10-28T08:30:00+08:00', endAt: '2026-11-01T10:30:00+08:00', target: { kind: 'point', coordinates: [103.84, 36.06] }, status: '执行中', createdAt: '2026-10-30T09:12:00+08:00', linkedTask: { no: 'RW202610300122001', status: '规划成功', type: '0122' }, plans: [{ no: 'JH20261030001', type: '单星观测计划', execMode: '常规观测', status: '规划成功' }, { no: 'SC20261030002', type: '数传计划', execMode: '', status: '待执行' }] },
  { id: 'RQ20261030002', taskNo: 'RW202610300123001', name: '河西走廊植被覆盖调查', satellite: projectSatellite, payloads: ['可见光', '红外'], businessType: '成像', businessMode: '单星成像', orderMode: '单次', observationMode: '星上规划任务', priority: 5, rollAngle: 45, startAt: '2026-10-30T14:00:00+08:00', endAt: '2026-10-30T15:20:00+08:00', target: { kind: 'point', coordinates: [100.46, 39.4] }, status: '已创建', createdAt: '2026-10-30T10:05:00+08:00', linkedTask: { no: 'RW202610300123001', status: '待规划', type: '0123' }, plans: [] },
  { id: 'RQ20261030003', taskNo: '', name: '祁连山雪线巡查', satellite: projectSatellite, payloads: ['宽幅相机'], businessType: '成像', businessMode: '单星成像', orderMode: '单次', observationMode: '常规观测', priority: 9, rollAngle: 25, startAt: '2026-10-30T09:00:00+08:00', endAt: '2026-10-30T11:00:00+08:00', target: { kind: 'polygon', coordinates: [[99.9, 38.4], [100.5, 38.2], [100.6, 38.8], [100.2, 39], [99.8, 38.7], [99.9, 38.4]] }, status: '已创建', createdAt: '2026-10-30T11:20:00+08:00', linkedTask: null, plans: [] },
  { id: 'RQ20261024004', taskNo: 'RW202610240124002', name: '敦煌月牙泉精细成像', satellite: projectSatellite, payloads: ['可见光'], businessType: '成像', businessMode: '单星成像', orderMode: '单次', observationMode: '点目标多条带观测', priority: 9, rollAngle: 25, startAt: '2026-10-24T10:00:00+08:00', endAt: '2026-10-24T11:30:00+08:00', target: { kind: 'point', coordinates: [94.66, 40.09] }, status: '已完成', createdAt: '2026-10-24T09:40:00+08:00', linkedTask: { no: 'RW202610240124002', status: '完成', type: '0124' }, plans: [{ no: 'JH20261024003', type: '单星观测计划', execMode: '点目标多条带观测', status: '已完成' }, { no: 'SC20261024004', type: '数传计划', execMode: '', status: '已完成' }] },
  { id: 'RQ20261024005', taskNo: 'RW202610240125001', name: '酒泉发射场动态监测', satellite: projectSatellite, payloads: ['可见光'], businessType: '成像', businessMode: '单星成像', orderMode: '单次', observationMode: '凝视视频', priority: 6, rollAngle: 45, startAt: '2026-10-24T16:00:00+08:00', endAt: '2026-10-24T16:10:00+08:00', target: { kind: 'point', coordinates: [98.4, 39.8] }, status: '取消中', createdAt: '2026-10-24T15:00:00+08:00', linkedTask: { no: 'RW202610240125001', status: '待规划', type: '0125' }, plans: [], logs: [{ time: '2026-10-24 15:45', text: '发起取消，状态 → 取消中' }] },
  { id: 'RQ20261023006', taskNo: 'RW202610230122004', name: '青海湖流域生态观测', satellite: projectSatellite, payloads: ['可见光', '宽幅相机'], businessType: '成像', businessMode: '单星成像', orderMode: '单次', observationMode: '常规观测', priority: 9, rollAngle: 25, startAt: '2026-10-23T08:00:00+08:00', endAt: '2026-10-23T10:00:00+08:00', target: { kind: 'administrative', name: '青海省 / 海南藏族自治州 / 共和县' }, status: '已取消', createdAt: '2026-10-23T08:30:00+08:00', linkedTask: { no: 'RW202610230122004', status: '已取消', type: '0122' }, plans: [], logs: [{ time: '2026-10-23 09:10', text: '发起取消，状态 → 取消中' }, { time: '2026-10-23 09:12', text: '取消处理完成，状态 → 已取消' }] },
  { id: 'RQ20261022007', taskNo: '', name: '城市热岛效应研究', satellite: projectSatellite, payloads: ['红外'], businessType: '成像', businessMode: '单星成像', orderMode: '单次', observationMode: '常规观测', priority: 9, rollAngle: 25, startAt: '2026-10-22T12:00:00+08:00', endAt: '2026-10-22T13:00:00+08:00', target: { kind: 'administrative', name: '甘肃省 / 兰州市 / 城关区' }, status: '已取消', createdAt: '2026-10-22T11:00:00+08:00', linkedTask: null, plans: [], logs: [{ time: '2026-10-22 11:30', text: '发起取消，状态 → 取消中' }, { time: '2026-10-22 11:35', text: '取消处理完成，状态 → 已取消' }] },
]
export function loadProjectRequirements(): ProjectRequirement[] {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const stored: ProjectRequirement[] = Array.isArray(value) ? value : []
    const ids = new Set(stored.map(row => row.id))
    return [...stored, ...examples.filter(row => !ids.has(row.id))]
  } catch { return examples.map(row => ({ ...row })) }
}
export function saveProjectRequirements(rows: ProjectRequirement[]) {
  localStorage.setItem(storageKey, JSON.stringify(rows))
}
export function nextTaskNo(mode: ObservationMode, rows: ProjectRequirement[], now = new Date()) {
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const code = observationModes.find(item => item.value === mode)!.code
  const prefix = `RW${date}01${code}`
  const sequence = Math.max(0, ...rows.filter(row => row.taskNo.startsWith(prefix)).map(row => Number(row.taskNo.slice(-3)) || 0)) + 1
  return `${prefix}${String(sequence).padStart(3, '0')}`
}
