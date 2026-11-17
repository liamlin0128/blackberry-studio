export type OrbitColumn = { key: string; label: string }

export type OrbitModule = {
  key: string
  route: string
  label: string
  section: '轨道确定' | '辅助计算' | '轨道控制' | '碰撞预警'
  filters: string[]
  columns: OrbitColumn[]
  rows: Array<Record<string, string>>
  actions?: string[]
  detailTitle?: string
  detailFields?: Array<[string, string]>
  pending?: string
}

const calculationRows = [
  { sequence: '1', satellite: '木铎1A', time: '2026-08-25 17:40:50', type: '轨道确定', amount: '47', result: '成功' },
  { sequence: '2', satellite: '木铎1B', time: '2026-08-05 10:54:12', type: '轨道确定', amount: '1000', result: '成功' },
  { sequence: '3', satellite: '木铎1A', time: '2026-07-30 14:18:31', type: '轨道确定', amount: '32', result: '成功' },
]

export const orbitModules: OrbitModule[] = [
  {
    key: 'orbit-calculation', route: '/app/mccs/orbitsys/orbit/orbital-mechanics', label: '轨道计算', section: '轨道确定',
    filters: ['卫星', '计算时间'], actions: ['查询', '重置', '导出'],
    columns: [{ key: 'sequence', label: '序号' }, { key: 'satellite', label: '卫星' }, { key: 'time', label: '计算时间（北京时间 UTC+8）' }, { key: 'type', label: '类型' }, { key: 'amount', label: '使用数据量' }, { key: 'result', label: '结果' }],
    rows: calculationRows, detailTitle: '定轨结果', detailFields: [['卫星', '木铎1A'], ['定轨模式', '自动'], ['定轨数据', '瞬根'], ['创建时间', '2026-08-25 17:40:51'], ['半长轴', '待确认'], ['偏心率', '待确认']],
  },
  {
    key: 'gnss-data', route: '/app/mccs/orbitsys/orbit/list', label: 'GNSS数据', section: '轨道确定', filters: ['卫星', '数据时间'], actions: ['查询', '重置', '导出'],
    columns: [{ key: 'sequence', label: '序号' }, { key: 'satellite', label: '卫星' }, { key: 'time', label: '数据时间（北京时间 UTC+8）' }, { key: 'type', label: '类型' }, { key: 'result', label: '结果' }], rows: [],
    pending: '本地导出材料未能确认 GNSS 数据页的独立字段与结果；该入口保留，详细内容待确认。',
  },
  {
    key: 'precise-record', route: '/app/mccs/orbitsys/orbit/precise-record', label: '精密定轨记录', section: '轨道确定', filters: ['卫星', '计算时间'], actions: ['查询', '重置', '导出'],
    columns: [{ key: 'sequence', label: '序号' }, { key: 'satellite', label: '卫星' }, { key: 'time', label: '计算时间（北京时间 UTC+8）' }, { key: 'type', label: '类型' }, { key: 'amount', label: '使用数据（条）' }, { key: 'range', label: '数据时间范围' }, { key: 'result', label: '结果' }, { key: 'operator', label: '发起人' }],
    rows: [{ sequence: '1', satellite: '木铎1A', time: '2026-06-16 14:10:35', type: '精轨计算', amount: '0', range: '—', result: '成功', operator: 'hwy001' }],
    detailTitle: '精密定轨记录详情', detailFields: [['记录编号', '待确认'], ['卫星', '木铎1A'], ['计算时间', '2026-06-16 14:10:35'], ['结果', '成功'], ['原始观测量数据条数', '0']],
  },
  {
    key: 'post-precision', route: '/app/mccs/orbitsys/orbit/determination', label: '事后精密定轨', section: '轨道确定', filters: ['卫星', '数据时间'], actions: ['查询', '重置'],
    columns: [{ key: 'id', label: '编号' }, { key: 'satellite', label: '卫星' }, { key: 'file', label: '文件名称' }, { key: 'start', label: '数据开始时间（北京时间 UTC+8）' }, { key: 'end', label: '数据结束时间（北京时间 UTC+8）' }, { key: 'received', label: '数据接收时间（北京时间 UTC+8）' }, { key: 'source', label: '源文件' }],
    rows: [{ id: '1', satellite: '木铎1A', file: 'MD1A_20260922_0x15_232131_GNSS', start: '2026-09-22 23:21:31', end: '2026-09-22 23:59:59', received: '2026-09-23 00:02:10', source: '查看' }],
  },
  {
    key: 'ephemeris', route: '/app/mccs/orbitsys/aid/ephemeris', label: '星历预报', section: '辅助计算', filters: ['卫星', '时间'], actions: ['查询', '重置', '手动触发', '预报配置', '下载'],
    columns: [{ key: 'id', label: '编号' }, { key: 'satellite', label: '卫星' }, { key: 'epoch', label: '历元时刻（北京时间 UTC+8）' }, { key: 'x', label: 'X（m）' }, { key: 'y', label: 'Y（m）' }, { key: 'z', label: 'Z（m）' }, { key: 'updated', label: '数据更新时间（北京时间 UTC+8）' }],
    rows: [{ id: '1', satellite: 'MD1B', epoch: '2026-09-30 00:00:00', x: '待确认', y: '待确认', z: '待确认', updated: '2026-09-23 13:00:03' }],
  },
  {
    key: 'remote-orbit', route: '/app/mccs/orbitsys/aid/remote-orbit', label: '对端星轨道计算', section: '辅助计算', filters: [], actions: [], columns: [], rows: [],
    pending: '未获得该页面的本地导出证据，字段、入口与处理流程待确认。',
  },
  {
    key: 'bds', route: '/app/mccs/orbitsys/aid/bds', label: '北斗亚太过境预报', section: '辅助计算', filters: ['卫星', '时间'], actions: ['查询', '重置', '手动触发', '预报配置', '下载'],
    columns: [{ key: 'sequence', label: '序号' }, { key: 'id', label: '编号' }, { key: 'satellite', label: '卫星' }, { key: 'start', label: '开始时间（北京时间 UTC+8）' }, { key: 'end', label: '结束时间（北京时间 UTC+8）' }, { key: 'duration', label: '时长（s）' }, { key: 'updated', label: '数据更新时间（北京时间 UTC+8）' }], rows: [],
  },
  {
    key: 'device', route: '/app/mccs/orbitsys/aid/device', label: '设备跟踪预报', section: '辅助计算', filters: ['卫星', '地面站', '时间'], actions: ['查询', '重置', '手动触发', '预报配置', '下载'],
    columns: [{ key: 'sequence', label: '序号' }, { key: 'id', label: 'ID' }, { key: 'satellite', label: '卫星' }, { key: 'station', label: '地面站' }, { key: 'start', label: '开始时间（北京时间 UTC+8）' }, { key: 'end', label: '结束时间（北京时间 UTC+8）' }, { key: 'duration', label: '时长（s）' }, { key: 'elevation', label: '最高仰角（°）' }, { key: 'orbit', label: '圈次' }, { key: 'updated', label: '数据更新时间（北京时间 UTC+8）' }],
    rows: [{ sequence: '1', id: 'MD1B_TY0702513', satellite: 'MD1B', station: 'TY0702', start: '2026-09-28 11:33:05', end: '2026-09-28 11:42:11', duration: '545', elevation: '38.0283365', orbit: '13', updated: '2026-09-23 13:00:03' }],
  },
  {
    key: 'eclipse', route: '/app/mccs/orbitsys/aid/ems', label: '地月影预报', section: '辅助计算', filters: ['卫星', '时间'], actions: ['查询', '重置', '手动触发', '预报配置', '下载'],
    columns: [{ key: 'sequence', label: '序号' }, { key: 'satellite', label: '卫星' }, { key: 'start', label: '开始时间（北京时间 UTC+8）' }, { key: 'end', label: '结束时间（北京时间 UTC+8）' }, { key: 'updated', label: '数据更新时间（北京时间 UTC+8）' }], rows: [],
  },
  {
    key: 'coordinate', route: '/app/mccs/orbitsys/aid/coordinate', label: '坐标转换', section: '辅助计算', filters: [], actions: [], columns: [], rows: [], pending: '本地材料没有可确认的坐标转换字段或转换过程，待确认。',
  },
  {
    key: 'time', route: '/app/mccs/orbitsys/aid/time', label: '时间转换', section: '辅助计算', filters: [], actions: ['转换'],
    columns: [{ key: 'utc', label: 'UTC时间' }, { key: 'bjt', label: 'BJT' }, { key: 'jd', label: '儒略日' }, { key: 'mjd', label: '简化儒略日' }, { key: 'tt', label: 'Terrestrial Time' }, { key: 'tai', label: 'International Atomic Time' }],
    rows: [{ utc: '—', bjt: '—', jd: '—', mjd: '—', tt: '—', tai: '—' }],
  },
  {
    key: 'keep', route: '/app/mccs/orbitsys/control/orbit-warning', label: '轨道保持监测', section: '轨道控制', filters: ['计算编号', '计算对象', '监测时间', '触发阈值状态', '计算状态'], actions: ['查询', '重置', '导出', '开始监测', '监控设置'],
    columns: [{ key: 'id', label: '计算编号' }, { key: 'time', label: '最新轨道时间（北京时间 UTC+8）' }, { key: 'source', label: '数据源' }, { key: 'max', label: '最大距离（km）' }, { key: 'min', label: '最小距离（km）' }, { key: 'altitude', label: '最低高度（km）' }, { key: 'threshold', label: '触发阈值状态' }, { key: 'result', label: '计算状态' }, { key: 'advice', label: '处理建议' }],
    rows: [{ id: 'OK_MD1A,MD1B_1790010764_400229', time: '2026-09-22 01:12', source: '最新星历', max: '121.39002', min: '0.018631661', altitude: '531.0492', threshold: '触发', result: '成功', advice: '已触发阈值，建议人工分析，在必要时进行轨道干预。' }],
  },
  {
    key: 'control-result', route: '/app/mccs/orbitsys/control/orbit-result', label: '轨控计算结果', section: '轨道控制', filters: ['计算编号', '轨控卫星', '计算时间', '计算状态'], actions: ['查询', '重置', '导出'],
    columns: [{ key: 'id', label: '轨控计算编号' }, { key: 'type', label: '结果类型' }, { key: 'satellite', label: '轨控卫星' }, { key: 'source', label: '输入来源' }, { key: 'target', label: '目标轨道' }, { key: 'count', label: '机动次数' }, { key: 'result', label: '状态' }, { key: 'time', label: '计算时间（北京时间 UTC+8）' }],
    rows: [{ id: '637230824193786170', type: '双星轨控', satellite: '木铎1B', source: '监测结果', target: '标称轨道', count: '2 次', result: '成功', time: '2026-09-14 09:19:29' }], detailTitle: '轨控计算结果详情', detailFields: [['计算编号', '637230824193786170'], ['结果类型', '双星轨控'], ['轨控卫星', '木铎1B'], ['机动次数', '2 次'], ['推进方向', '降轨（推力←）'], ['推进时长', '8.31 h']],
  },
  {
    key: 'collision', route: '/app/mccs/orbitsys/collision/warning', label: '碰撞预警', section: '碰撞预警', filters: ['记录编号', '生成时间'], actions: ['查询', '重置', '碰撞预警配置'],
    columns: [{ key: 'sequence', label: '编号' }, { key: 'id', label: '预警记录编号' }, { key: 'time', label: '生成时间（北京时间 UTC+8）' }, { key: 'satellite', label: '卫星' }, { key: 'risk', label: '风险预计时间（北京时间 UTC+8）' }, { key: 'object', label: '风险物' }, { key: 'probability', label: '风险概率' }],
    rows: [{ sequence: '1', id: 'CW-20260922-001', time: '2026-09-22 15:00:00', satellite: 'MD1A', risk: '待确认', object: '待确认', probability: '待确认' }],
  },
  {
    key: 'celestial', route: '/app/mccs/orbitsys/collision/celestial', label: '天体数据', section: '碰撞预警', filters: ['唯一编号', '历元时间', '更新时间'], actions: ['查询', '重置', '新增', '批量删除', '数据导入'],
    columns: [{ key: 'id', label: '唯一编号' }, { key: 'name', label: '名称' }, { key: 'type', label: '类型' }, { key: 'source', label: '来源' }, { key: 'epoch', label: '历元时间（北京时间 UTC+8）' }, { key: 'created', label: '创建时间（北京时间 UTC+8）' }, { key: 'updated', label: '更新时间（北京时间 UTC+8）' }, { key: 'operator', label: '更新人' }],
    rows: [{ id: 'EUCROPIS', name: '测试', type: '卫星', source: '导入', epoch: '2025-02-17 02:00:23', created: '0001-01-01 08:06:26', updated: '0001-01-01 08:06:26', operator: '—' }, { id: 'STARLINK-1761', name: '测试', type: '其他', source: '导入', epoch: '2025-02-17 02:00:23', created: '0001-01-01 08:06:26', updated: '0001-01-01 08:06:26', operator: '—' }],
  },
]

export const specialRoutes = {
  strategy: { route: '/app/mccs/orbitsys/control/orbit-strategy', label: '轨控策略计算', section: '轨道控制' },
  thruster: { route: '/app/mccs/orbitsys/control/thruster', label: '推力器标定管理', section: '轨道控制' },
} as const

export function moduleForRoute(route: string) {
  return orbitModules.find((item) => item.route === route)
}
