import { loadProjectRequirements, saveProjectRequirements } from './projectRequirements'
import { projectSatellite } from './projectRequirements'

export const virtualUplinkArcId = 'VIRTUAL-UPLINK-0701'
export const defaultArcSelectionDelayMinutes = 240
const arcSelectionDelayKey = 'sp-mcs-0701-onboard-arc-selection-delay-v1'

export function loadArcSelectionDelayMinutes(): number {
  const stored = localStorage.getItem(arcSelectionDelayKey)
  if (stored === null) return defaultArcSelectionDelayMinutes
  const minutes = Number(stored)
  return Number.isSafeInteger(minutes) && minutes >= 0 ? minutes : defaultArcSelectionDelayMinutes
}

export function saveArcSelectionDelayMinutes(minutes: number): void {
  if (!Number.isSafeInteger(minutes) || minutes < 0) throw new Error('可选弧段延后时间须为非负整数分钟')
  localStorage.setItem(arcSelectionDelayKey, String(minutes))
}

export interface UplinkArc { id: string; satellite: string; startAt: string; endAt: string; available: boolean }
export interface OnboardRecord {
  id: string; sourceNo: string; taskNo: string; planNo: string; processedAt: string
  satellite: string; taskType: '星上规划任务'; uplinkStatus: '未上星'
  result: '成功'; message: string; arcId: string; arcStartAt: string; arcEndAt: string
  virtualArc: boolean; fileId: string; fileName: string; fileStatus: '待安排'
  arcSelectionDelayMinutes?: number
}

// 弧段管理服务接入前，用集中样例验证排序、时间窗与虚拟弧段分支。
export const availableUplinkArcs: UplinkArc[] = [
  { id: 'GS-ARC-20261030-01', satellite: projectSatellite, startAt: '2026-10-30T14:10:00+08:00', endAt: '2026-10-30T14:20:00+08:00', available: true },
  { id: 'GS-ARC-20261030-02', satellite: projectSatellite, startAt: '2026-10-30T14:30:00+08:00', endAt: '2026-10-30T14:45:00+08:00', available: true },
]

const key = 'sp-mcs-0701-onboard-handling-v1'
export function selectUplinkArc(arcs: UplinkArc[], satellite: string, processedAt: string, latestAt: string, delayMinutes = defaultArcSelectionDelayMinutes) {
  const earliest = new Date(processedAt).getTime() + delayMinutes * 60_000
  const latest = new Date(latestAt).getTime()
  return arcs.filter(arc => arc.available && arc.satellite === satellite && new Date(arc.startAt).getTime() >= earliest && new Date(arc.endAt).getTime() < latest)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0] || null
}

export function loadOnboardRecords(): OnboardRecord[] {
  try { const value: unknown = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value as OnboardRecord[] : [] }
  catch { return [] }
}

export function ensureOnboardProcessing(): OnboardRecord[] {
  const requirements = loadProjectRequirements()
  const records = loadOnboardRecords()
  const arcSelectionDelayMinutes = loadArcSelectionDelayMinutes()
  let changed = false
  for (const row of requirements) {
    if (row.observationMode !== '星上规划任务' || !row.taskNo || row.status === '已取消' || records.some(item => item.sourceNo === row.id)) continue
    const arc = selectUplinkArc(availableUplinkArcs, row.satellite, row.createdAt, row.endAt, arcSelectionDelayMinutes)
    const planNo = `JH${row.taskNo.slice(2, 10)}23${row.taskNo.slice(-3)}`
    const fileId = `XF${row.taskNo.slice(2)}`
    const record: OnboardRecord = {
      id: `CL${row.taskNo.slice(2)}`, sourceNo: row.id, taskNo: row.taskNo, planNo,
      processedAt: row.createdAt, satellite: row.satellite, taskType: '星上规划任务',
      uplinkStatus: '未上星', result: '成功',
      message: arc ? '成像计划与待安排下传文件已生成；已关联上注弧段' : '成像计划与待安排下传文件已生成；待人工配置上注弧段',
      arcId: arc?.id || virtualUplinkArcId, arcStartAt: arc?.startAt || '', arcEndAt: arc?.endAt || '',
      virtualArc: !arc, fileId, fileName: '待回填', fileStatus: '待安排', arcSelectionDelayMinutes,
    }
    records.unshift(record)
    row.plans = [...(row.plans || []), { no: planNo, type: '单星观测计划', execMode: '星上规划任务', status: '待发送' }]
    row.linkedTask = { no: row.taskNo, type: '0123', status: '规划成功' }
    changed = true
  }
  if (changed) { localStorage.setItem(key, JSON.stringify(records)); saveProjectRequirements(requirements) }
  return records
}
