export type OrbitRecord = {
  sequence: number
  satelliteId: string
  satelliteName: string
  satelliteEnglishName: string
  tleNumber: string
  mode: '手动'
  updatedAt: string
}

export type OrbitHistoryRecord = {
  sequence: number
  id: string
  updatedAt: string
  epoch: string
  dataType: '两行数' | '瞬根'
  mode: '手动'
}

export type OrbitConfiguration = {
  autoOrbitEnabled: boolean
  calculationTime: string
}

export type OrbitHistorySet = {
  records: OrbitHistoryRecord[]
  total: number | null
}

export const orbitNavigation = [
  { label: '轨道确定', items: [
    { label: '轨道管理', route: '/app/mccs/orbitsys/orbit/track-manage' }, { label: '轨道计算', route: '/app/mccs/orbitsys/orbit/orbital-mechanics' }, { label: 'GNSS数据', route: '/app/mccs/orbitsys/orbit/list' },
    { label: '精密定轨记录', route: '/app/mccs/orbitsys/orbit/precise-record' }, { label: '事后精密定轨', route: '/app/mccs/orbitsys/orbit/determination' },
  ] },
  { label: '辅助计算', items: [
    { label: '星历预报', route: '/app/mccs/orbitsys/aid/ephemeris' }, { label: '对端星轨道计算', route: '/app/mccs/orbitsys/aid/remote-orbit' }, { label: '北斗亚太过境预报', route: '/app/mccs/orbitsys/aid/bds' },
    { label: '设备跟踪预报', route: '/app/mccs/orbitsys/aid/device' }, { label: '地月影预报', route: '/app/mccs/orbitsys/aid/ems' }, { label: '坐标转换', route: '/app/mccs/orbitsys/aid/coordinate' }, { label: '时间转换', route: '/app/mccs/orbitsys/aid/time' },
  ] },
  { label: '轨道控制', items: [
    { label: '轨控策略计算', route: '/app/mccs/orbitsys/control/orbit-strategy' }, { label: '轨道保持监测', route: '/app/mccs/orbitsys/control/orbit-warning' }, { label: '推力器标定管理', route: '/app/mccs/orbitsys/control/thruster' },
    { label: '轨控计算结果', route: '/app/mccs/orbitsys/control/orbit-result' },
  ] },
  { label: '碰撞预警', items: [
    { label: '碰撞预警', route: '/app/mccs/orbitsys/collision/warning' }, { label: '天体数据', route: '/app/mccs/orbitsys/collision/celestial' },
  ] },
]

export const orbitRecords: OrbitRecord[] = [
  { sequence: 1, satelliteId: 'MD1A', satelliteName: '木铎1A', satelliteEnglishName: 'MD1A', tleNumber: '638429677324599671', mode: '手动', updatedAt: '2026-09-22 15:49:01' },
  { sequence: 2, satelliteId: 'MD1B', satelliteName: '木铎1B', satelliteEnglishName: 'MD1B', tleNumber: '638429705711649143', mode: '手动', updatedAt: '2026-09-22 15:49:18' },
]

export const orbitHistoryRecords: OrbitHistoryRecord[] = [
  { sequence: 1, id: '638429677324599671', updatedAt: '2026-09-22 15:49:01', epoch: '2026-09-22 01:12:44', dataType: '两行数', mode: '手动' },
  { sequence: 2, id: '637615409876435311', updatedAt: '2026-09-17 01:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 3, id: '637542932303315292', updatedAt: '2026-09-16 13:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 4, id: '637470454746972508', updatedAt: '2026-09-16 01:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 5, id: '637397977173852508', updatedAt: '2026-09-15 13:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 6, id: '637325499600732508', updatedAt: '2026-09-15 01:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 7, id: '637253022027612474', updatedAt: '2026-09-14 13:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 8, id: '637180544454492474', updatedAt: '2026-09-14 01:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 9, id: '637108066881372474', updatedAt: '2026-09-13 13:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 10, id: '637035589308252474', updatedAt: '2026-09-13 01:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 11, id: '636963111735132474', updatedAt: '2026-09-12 13:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 12, id: '636890634111680826', updatedAt: '2026-09-12 01:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 13, id: '636818156555338042', updatedAt: '2026-09-11 13:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 14, id: '636745678864777530', updatedAt: '2026-09-11 01:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 15, id: '636683184825696604', updatedAt: '2026-09-10 14:39:10', epoch: '2026-09-10T01:16:52', dataType: '两行数', mode: '手动' },
  { sequence: 16, id: '636673201291657564', updatedAt: '2026-09-10 13:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 17, id: '636658250879598940', updatedAt: '2026-09-10 10:31:28', epoch: '2026-09-10T01:16:52', dataType: '两行数', mode: '手动' },
  { sequence: 18, id: '636657983970869596', updatedAt: '2026-09-10 10:28:49', epoch: '2026-09-10T01:16:52', dataType: '两行数', mode: '手动' },
  { sequence: 19, id: '636657347208413532', updatedAt: '2026-09-10 10:22:30', epoch: '2026-09-09T03:03:19', dataType: '两行数', mode: '手动' },
  { sequence: 20, id: '636600723869532508', updatedAt: '2026-09-10 01:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 21, id: '636561725818143068', updatedAt: '2026-09-09 18:32:35', epoch: '2026-09-09T03:08:32', dataType: '两行数', mode: '手动' },
  { sequence: 22, id: '636537606036783452', updatedAt: '2026-09-09 14:32:58', epoch: '2026-09-09T03:03:19', dataType: '两行数', mode: '手动' },
  { sequence: 23, id: '636535718096666968', updatedAt: '2026-09-09 14:14:13', epoch: '2026-09-09T03:03:19', dataType: '两行数', mode: '手动' },
  { sequence: 24, id: '636534566642778456', updatedAt: '2026-09-09 14:02:47', epoch: '2026-09-09T03:03:19', dataType: '两行数', mode: '手动' },
  { sequence: 25, id: '636534180414488920', updatedAt: '2026-09-09 13:58:57', epoch: '2026-09-09T03:03:19', dataType: '两行数', mode: '手动' },
  { sequence: 26, id: '636528246313189717', updatedAt: '2026-09-09 13:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 27, id: '636455768723292501', updatedAt: '2026-09-09 01:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 28, id: '636389086302568789', updatedAt: '2026-09-08 13:57:34', epoch: '2026-09-08T03:11:29', dataType: '两行数', mode: '手动' },
  { sequence: 29, id: '636383291150172493', updatedAt: '2026-09-08 13:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
  { sequence: 30, id: '636310813577052493', updatedAt: '2026-09-08 01:00:00', epoch: '2026-07-17T16:00:00', dataType: '两行数', mode: '手动' },
]

export const defaultOrbitConfiguration: OrbitConfiguration = {
  autoOrbitEnabled: false,
  calculationTime: '19点',
}

export const orbitHistoryBySatellite: Record<string, OrbitHistorySet> = {
  MD1A: { records: orbitHistoryRecords, total: 71 },
  MD1B: { records: [], total: null },
}

export const orbitResult = {
  satelliteId: 'MD1A',
  mode: '手动',
  dataType: '两行数',
  createdAt: '2026-09-22 15:49:01',
  kepler: '{\n  "epoch": "2026-09-22T01:12:44",\n  "a": 0,\n  "e": 0,\n  "i": 0,\n  "raan": 0,\n  "ma": 0,\n  "pa": 0\n}',
  tle: '1 99999U 24001A 26265.05052083 .00013868 00000-0 70059-7 0 00014\n2 99999 097.5392 338.3935 0012025 168.8532 335.2157 15.09718852004218',
}
