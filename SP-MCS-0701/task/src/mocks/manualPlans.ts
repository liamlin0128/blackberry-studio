import type { ManualPlanType } from '../types/taskPlan'

export const manualPlanTypes: ManualPlanType[] = ['轨控', '数传', '上注']
export const manualPlanSatellites = ['木铎1A', '木铎1B']
export const manualPlanPriorities = Array.from({ length: 16 }, (_, index) => index + 1)

export const manualPlanArcs = [
  { id: 'MD1ASDZH04512484', satellite: '木铎1A', station: 'SDZH0451-北师大', startedAt: '2026-09-21 10:47:21', endedAt: '2026-09-21 10:56:45' },
  { id: 'MD1ASDZH04512491', satellite: '木铎1A', station: 'SDZH0451-北师大', startedAt: '2026-09-21 21:23:52', endedAt: '2026-09-21 21:26:04' },
  { id: 'MD1BSDZH04512500', satellite: '木铎1B', station: 'SDZH0451-北师大', startedAt: '2026-09-22 12:14:01', endedAt: '2026-09-22 12:18:58' },
]

export const transferContentRows = Array.from({ length: 10 }, (_, index) => ({
  sequence: index + 1,
  column: '任务号',
  content: '',
  mode: index < 5 ? '原文件' : '压缩',
}))

export const uploadFileRows = [
  { sequence: 1, path: '/nfs/DATA/UDATA/MD1B/OBC/V1.0.0/parts/test/test.part001.frame', md5: '8b26f050e8a83bbacc7dbb32bad8bc82' },
  { sequence: 2, path: '/nfs/DATA/UDATA/MD1B/OBC/V1.0.0/parts/test/test.part002.frame', md5: '5f363e0e58a95f06cbe9bbc662c5dfb6' },
  { sequence: 3, path: '/nfs/DATA/UDATA/MD1B/OBC/V1.0.0/parts/test/test.part003.frame', md5: '5f363e0e58a95f06cbe9bbc662c5dfb6' },
]
