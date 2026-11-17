import type { ManagedParameter, ParameterSet } from '../types/parameterManagement'

type ParameterSource = Omit<ManagedParameter, 'group'>

export const parameterSets: ParameterSet[] = [
  { id: 'base_defaults', category: '基础配置参数', name: 'base_defaults', version: 'V3', updatedBy: 'admin', updatedAt: '2026-05-27 16:14:49' },
  { id: 'sat-md1b', category: '卫星型号参数', name: 'MD1B', version: 'V3', updatedBy: 'admin', updatedAt: '2026-05-27 15:26:27' },
  { id: 'sat-md1a', category: '卫星型号参数', name: 'MD1A', version: 'V3', updatedBy: 'admin', updatedAt: '2026-05-27 15:26:27' },
  { id: 'tpl-md1a', category: '任务模板参数', name: 'MD1A卫星参数', version: 'V6', updatedBy: 'hwy001', updatedAt: '2026-06-02 09:37:09' },
  { id: 'tpl-md1b', category: '任务模板参数', name: 'MD1B卫星参数', version: 'V5', updatedBy: 'hwy001', updatedAt: '2026-06-02 09:37:09' },
]

let rowIndex = 0
const p = (code: string, name: string, description: string, type: string, length: string, unitOrHandling: string): ParameterSource => ({ id: `${code}-${++rowIndex}`, code, name, description, type, length, unitOrHandling, value: '—' })

const base: ParameterSource[] = [
  p('base_test', '基础测试', '基础测试', 'string', '12', '-'),
  p('common_test', '通用测试', '通用测试', 'string', '12', '-'),
  p('task_deadline_grace_period', '超时宽限期', '任务在超过deadline之后，等待在途计划时的宽限期， 在宽限期内仍不会被判为超时完成。', 'int', '12', '-'),
]

const satellite: ParameterSource[] = [
  p('satellite_id', '卫星标识', '卫星的唯一标识', 'string', '12', '-'),
  p('storage_capacity_mb', '固存容量', '固存容量', 'float', '12', 'Mb'),
  p('task_envelope_start_offset_sec', '任务包络开始时间约束', '使用时卫星对任务对开始时间的特殊要求不低于', 'int', '12', '秒'),
  p('task_envelope_end_offset_sec', '任务包络结束时间约束', '使用时卫星对任务对结束时间的特殊要求不低于', 'int', '12', '秒'),
  p('min_upload_delay_hours', '最小上注延迟', '使用时卫星成像上注弧段不得小于此时间间隔', 'float', '12', '小时'),
  p('max_upload_delay_hours', '最大上注延迟', '使用时卫星成像上注弧段不得大于此时间间隔', 'float', '12', '小时'),
  p('single_upload_max_data', '单弧段最大上注任务数', '使用时卫星单个弧段上注任务数量不得大于此数量', 'int', '12', '个'),
  p('single_download_max_data', '单弧段最大下传数据包数', '使用时卫星单个弧段下传数据包数量不得大于此数量', 'int', '12', '个'),
  p('same_arc_upload_download_constraint', '同弧段上注、下传约束开关', '使用时弧段上注和下传不可共用', 'bool', '12', '布尔值'),
  p('camera_id', '载荷标识', '载荷标识', 'string', '12', '-'),
  p('single_orbit_max_duration', '单圈最大工作时长', '单圈最大工作时长', 'int', '12', '秒'),
  p('single_orbit_max_switches', '单圈最大开机次数', '单圈最大开机次数', 'int', '12', '次'),
  p('single_day_max_duration', '单日最大累计工作时长', '单日最大累计工作时长', 'int', '12', '秒'),
  p('single_day_max_switches', '单日最大开机次数', '单日最大开机次数', 'int', '12', '次'),
  p('single_day_max_active_orbits', '单日开机圈数', '单日开机圈数', 'int', '12', '圈'),
  p('consecutive_power_on_min_interval_sec', '连续开机最小间隔', '连续开机最小间隔', 'int', '12', '秒'),
  p('max_consecutive_switches', '最大连续开机次数', '最大连续开机次数', 'int', '12', '次'),
  p('min_shooting_duration', '最小成像时长', '最小成像时长', 'int', '12', '秒'),
  p('data_downlink_compress_rate', '数据下传压缩率', '数据下传压缩率', 'string', '12', '-'),
  p('energy_balance_orbit_count', '能源平衡圈数', '能源平衡圈数', 'int', '12', '圈'),
  p('sun_altitude_min', '可用最小太阳高度角', '可用最小太阳高度角', 'float', '12', '度'),
  p('sun_altitude_max', '可用最大太阳高度角', '可用最大太阳高度角', 'float', '12', '度'),
  p('imaging_lead', '成像准备时间', '单星/应急成像任务开始前所需的准备时间偏移量（秒），即 T0 - 287。适用于单星观测/提取、应急观测/提取及双星任务', 'int', '12', '秒'),
  p('extract_after', '提取任务结束后偏移', '提取类任务（单星/应急/协同提取）结束后相对于 T0 的偏移量（秒），即 T0 + N + 389。用于计算提取任务的结束时间窗口', 'int', '12', '秒'),
  p('observe_after', '观测任务结束后偏移', '观测类任务（单星/应急/双星观测及A星协同观测）结束后相对于 T0 的偏移量（秒），即 T0 + N + 389。用于计算观测任务的结束时间窗口', 'int', '12', '秒'),
  p('cooperative_exec', '协同成像执行预留时间', '协同任务相较于单星任务额外增加的前置准备时间（秒），即协同开始偏移 1504= 1130+ 374。体现协同成像所需的额外调度/对准时间', 'int', '12', '秒'),
  p('cooperative_delay', '协同提取任务结束后偏移', 'B星协同任务额外增加的开始延迟时间（秒），即B星协同开始偏移 386 。体现B星作为从星的额外响应延迟', 'int', '12', '秒'),
  p('cooperative_observe_delay', '协同观测任务结束后偏移', 'B星协同观测任务结束时间的偏移量（秒）。仅对B星协同观测生效', 'int', '12', '秒'),
  p('dt_lead', '数传准备时间', '数传任务开始前所需的准备时间偏移量（秒），即 T0 - 320。适用于高速数传和应急数传，双星一致', 'int', '12', '秒'),
  p('dt_after', '数传结束后偏移', '数传任务结束后相对于 T0 的偏移量（秒），即 T0 + N + 87。用于计算数传任务的结束时间窗口，双星一致', 'int', '12', '秒'),
  p('link_establishment_time', '建链时刻参数', '建链时刻为成像开始时间的xx秒之前', 'int', '12', '秒'),
  p('roll_start_lead', '成像前开始侧摆时间', '成像任务开始前开始侧摆所需的时间偏移量（秒），即 T0 - roll_start_lead。适用于单星观测/提取、应急观测/提取及双星任务，用于计算开始侧摆时间。', 'int', '12', '秒'),
  p('roll_end_lead', '成像前结束侧摆时间', '成像任务开始前结束侧摆所需的时间偏移量（秒），即 T0 - roll_end_lead。适用于单星观测/提取、应急观测/提取及双星任务，用于计算结束侧摆时间。', 'int', '12', '秒'),
  p('reset_start_after', '成像后开始回位时间', '成像任务结束后开始回位的时间偏移量（秒），即 T0 + N + reset_start_after。适用于单星观测/提取、应急观测/提取及双星任务，用于计算开始回位时间。', 'int', '12', '秒'),
  p('reset_end_after', '成像后结束回位时间', '成像任务结束后完成回位的时间偏移量（秒），即 T0 + N + reset_end_after。适用于单星观测/提取、应急观测/提取及双星任务，用于计算结束回位时间。', 'int', '12', '秒'),
]

const template: ParameterSource[] = [
  p('missionId', '星上任务号', '星上任务号', 'string', '4', '规划结果'),
  p('type', '计划类型', '计划类型：0单星/1协同/2应急/3双星/5数传/6紧急数传7升级/8轨控', 'int', '1', '规划结果'),
  p('priority', '优先级', '优先级：1-16', 'int', '1', '规划结果'),
  p('startTime', '任务开始时间', '任务开始时间', 'time', '4', '规划结果'),
  p('expiryTime', '任务失效时间', '任务失效时间', 'time', '4', '规划结果'),
  p('instructNo', '指令序列标识', '指令序列标识', 'int', '4', '规划结果'),
  p('longitude', '目标点经度', '目标点经度', 'float', '4', '规划结果'),
  p('latitude', '目标点维度', '目标点维度', 'float', '4', '规划结果'),
  p('altitude', '目标点高度', '目标点高度', 'float', '4', '规划结果'),
  p('obsTime', '观测时长', '观测时长', 'int', '4', '规划结果'),
  p('extract', '是否提取', '是否提取 0否 1 是', 'int', '1', '规划结果'),
  p('xRollAngle', 'X轴偏置角', 'X轴偏置角', 'float', '4', '规划结果'),
  p('yRollAngle', 'Y轴偏置角', 'Y轴偏置角', 'float', '4', '规划结果'),
  p('zRollAngle', 'Z轴偏置角', 'Z轴偏置角', 'float', '4', '规划结果'),
  p('startRollTime', '开始侧摆时间', '开始侧摆时间', 'time', '4', '规划结果'),
  p('endRollTime', '结束侧摆时间', '结束侧摆时间', 'time', '4', '规划结果'),
  p('startShootTime', '开始成像时间', '开始成像时间', 'time', '4', '规划结果'),
  p('endShootTime', '结束成像时间', '结束成像时间', 'time', '4', '规划结果'),
  p('startResetTime', '开始回位时间', '开始回位时间', 'time', '4', '规划结果'),
  p('endResetTime', '结束回位时间', '结束回位时间', 'time', '4', '规划结果'),
  p('maxRollAngle', '任务最大侧摆要求', '任务最大侧摆要求', 'float', '5', '规划结果'),
  p('linkEstablishmentTime', '建链时刻', '建链时刻', 'time', '6', '规划结果'),
  p('missionId', '星上任务号', '星上任务号', 'string', '4', '规划结果'),
  p('type', '计划类型', '计划类型：0单星/1协同/2应急/3双星/5数传/6紧急数传7升级/8轨控', 'int', '1', '规划结果'),
  p('priority', '优先级', '优先级：1-16', 'int', '1', '规划结果'),
  p('startTime', '任务开始时间', '任务开始时间', 'time', '4', '规划结果'),
  p('expiryTime', '任务失效时间', '任务失效时间', 'time', '4', '规划结果'),
  p('instructNo', '指令序列标识', '指令序列标识', 'int', '4', '规划结果'),
  p('startTransTime', '数传开始时间', '数传开始时间', 'time', '4', '规划结果'),
  p('endTransTime', '数传结束时间', '数传结束时间', 'time', '4', '规划结果'),
  p('dtAntennaNo', '数传站号', '数传站号', 'int', '4', '规划结果'),
  p('durationTransTime', '数传时长', '', 'int', '2', '规划结果'),
  p('missionId', '星上任务号', '星上任务号', 'string', '4', '规划结果'),
  p('type', '计划类型', '计划类型：0单星/1协同/2应急/3双星/5数传/6紧急数传7升级/8轨控', 'int', '1', '规划结果'),
  p('priority', '优先级', '优先级：1-16', 'int', '1', '规划结果'),
  p('startTime', '任务开始时间', '任务开始时间', 'time', '4', '规划结果'),
  p('expiryTime', '任务失效时间', '任务失效时间', 'time', '4', '规划结果'),
  p('instructNo', '指令序列标识', '指令序列标识', 'int', '4', '规划结果'),
  p('longitude', '地面站经度', '地面站经度', 'float', '4', '规划结果'),
  p('latitude', '地面站维度', '地面站维度', 'float', '4', '规划结果'),
  p('altitude', '地面站高度', '地面站高度', 'float', '4', '规划结果'),
  p('dtAntennaNo', '数传站号', '数传站号', 'int', '4', '默认值'),
  p('pitchAngleMin', '最低仰角', '最低仰角', 'float', '4', '默认值'),
  p('durationTransTime', '数传时长', '', 'int', '2', '规划结果'),
  p('missionId', '星上任务号', '星上任务号', 'string', '4', '规划结果'),
  p('type', '计划类型', '计划类型：0单星/1协同/2应急/3双星/5数传/6紧急数传7升级/8轨控', 'int', '1', '规划结果'),
  p('priority', '优先级', '优先级：1-16', 'int', '1', '规划结果'),
  p('startTime', '任务开始时间', '任务开始时间', 'time', '4', '规划结果'),
  p('expiryTime', '任务失效时间', '任务失效时间', 'time', '4', '规划结果'),
  p('files', '文件数组', '文件数组', 'string', '0', '规划结果'),
  p('fccCorrParamGrp', 'FCC校正参数加载组号', 'FCC校正参数加载组号', 'int', '1', '相机参数'),
  p('bandPTdiStage', '谱段P积分级数', '谱段P积分级数', 'string', '1', '相机参数'),
  p('bandB1TdiStage', '谱段B1积分级数', '谱段B1积分级数', 'string', '1', '相机参数'),
  p('bandB2TdiStage', '谱段B2积分级数', '谱段B2积分级数', 'string', '1', '相机参数'),
  p('bandB3TdiStage', '谱段B3积分级数', '谱段B3积分级数', 'string', '1', '相机参数'),
  p('bandB4TdiStage', '谱段B4积分级数', '谱段B4积分级数', 'string', '1', '相机参数'),
  p('bandB5TdiStage', '谱段B5积分级数', '谱段B5积分级数', 'string', '1', '相机参数'),
  p('bandB6TdiStage', '谱段B6积分级数', '谱段B6积分级数', 'string', '1', '相机参数'),
  p('bandB7TdiStage', '谱段B7积分级数', '谱段B7积分级数', 'string', '1', '相机参数'),
  p('bandB8TdiStage', '谱段B8积分级数', '谱段B8积分级数', 'string', '1', '相机参数'),
  p('gainBandP', '增益设置_P谱段', '增益设置_P谱段', 'string', '1', '相机参数'),
  p('gainBandB1', '增益设置_B1谱段', '增益设置_B1谱段', 'string', '1', '相机参数'),
  p('gainBandB2', '增益设置_B2谱段', '增益设置_B2谱段', 'string', '1', '相机参数'),
  p('gainBandB3', '增益设置_B3谱段', '增益设置_B3谱段', 'string', '1', '相机参数'),
  p('gainBandB4', '增益设置_B4谱段', '增益设置_B4谱段', 'string', '1', '相机参数'),
  p('gainBandB5', '增益设置_B5谱段', '增益设置_B5谱段', 'string', '1', '相机参数'),
  p('gainBandB6', '增益设置_B6谱段', '增益设置_B6谱段', 'string', '1', '相机参数'),
  p('gainBandB7', '增益设置_B7谱段', '增益设置_B7谱段', 'string', '1', '相机参数'),
  p('gainBandB8', '增益设置_B8谱段', '增益设置_B8谱段', 'string', '1', '相机参数'),
  p('isLoadAlgoApp', '是否启动算法预加载APP', '是否启动算法预加载APP', 'string', '4', '规划结果'),
  p('productLevelCode', '处理层级', '处理层级', 'string', '1', '规划结果'),
  p('subType', '处理类型', '处理类型', 'string', '1', '规划结果'),
  p('ErrMsgDataSendLaserEn', '异常消息及数据发送激光使能', '异常消息及数据发送激光使能', 'string', '1', '规划结果'),
  p('appLaserEn', 'APP异常消息及数据发送激光使能', 'APP异常消息及数据发送激光使能', 'string', '1', '规划结果'),
  p('errMsgLaserEn', '整合参数-异常消息&APP异常数据发送激光使能', '整合参数-异常消息&APP异常数据发送激光使能', 'string', '1', '规划结果'),
  p('procHistOrRealTask', '处理历史还是实时任务', '处理历史还是实时任务', 'string', '1', '规划结果'),
  p('playbackRoute', '回放链路选择', '回放链路选择11H: 测控机22H: 数传', 'string', '1', '默认值'),
  p('missionId1', '查询-配置主任务号1', '查询-配置主任务号1', 'string', '4', '规划结果'),
  p('missionId2', '查询-配置主任务号2', '查询-配置主任务号2', 'string', '4', '规划结果'),
  p('missionId3', '查询-配置主任务号3', '查询-配置主任务号3', 'string', '4', '规划结果'),
  p('playbackRoute', '回放链路选择', '回放链路选择', 'string', '1', '默认值'),
  p('compressionRatio', '压缩参数', 'FF：不压缩 00：无损压缩 01：1:2压缩 02：1:4压缩 03：1:8压缩', 'string', '4', '默认值'),
  p('unitCount', '单元个数', '单元个数', 'int', '4', '规划结果'),
  p('missionId1', '查询-配置主任务号1', '查询-配置主任务号1', 'string', '4', '规划结果'),
  p('missionId2', '查询-配置主任务号2', '查询-配置主任务号2', 'string', '4', '规划结果'),
  p('missionId3', '查询-配置主任务号3', '查询-配置主任务号3', 'string', '4', '规划结果'),
  p('missionId4', '查询-配置主任务号4', '查询-配置主任务号4', 'string', '4', '规划结果'),
  p('missionId5', '查询-配置主任务号5', '查询-配置主任务号5', 'string', '4', '规划结果'),
  p('missionId6', '查询-配置主任务号6', '查询-配置主任务号6', 'string', '4', '规划结果'),
  p('missionId7', '查询-配置主任务号7', '查询-配置主任务号7', 'string', '4', '规划结果'),
  p('missionId8', '查询-配置主任务号8', '查询-配置主任务号8', 'string', '4', '规划结果'),
  p('missionId9', '查询-配置主任务号9', '查询-配置主任务号9', 'string', '4', '规划结果'),
  p('missionId10', '查询-配置主任务号10', '查询-配置主任务号10', 'string', '4', '规划结果'),
]

interface ParameterGroupBoundary {
  title: string
  end: number
}

function withGroups(rows: ParameterSource[], boundaries: ParameterGroupBoundary[], values: Record<number, string> = {}): ManagedParameter[] {
  return rows.map((row, index) => ({
    ...row,
    group: boundaries.find((boundary) => index < boundary.end)?.title || '未分类参数',
    value: values[index] ?? row.value,
  }))
}

const basicParameters = withGroups(base, [
  { title: '基础信息', end: 1 },
  { title: '规划算法通用参数', end: 2 },
  { title: '筹划算法通用参数', end: 3 },
], { 0: 'base1', 1: 'common_test', 2: '2' })

const satelliteParameters = withGroups(satellite, [
  { title: '平台约束参数', end: 9 },
  { title: '载荷约束参数-HSI', end: 22 },
  { title: '飞行时序参数', end: 35 },
], {
  0: 'MD1B', 1: '4194304', 2: '-100', 3: '100', 4: '4', 5: '24', 6: '5', 7: '5', 8: 'TRUE',
  9: 'HSI', 10: '600', 11: '5', 12: '2400', 13: '100', 14: '-', 15: '-', 16: '3', 17: '10',
  18: '1', 19: '4', 20: '0', 21: '90', 22: '287', 23: '389', 24: '389', 25: '1130',
})

const templateParameters = withGroups(template, [
  { title: '成像参数', end: 22 },
  { title: '数传参数', end: 32 },
  { title: '应急数传', end: 44 },
  { title: '软件上注', end: 50 },
  { title: '多光谱相机参数', end: 69 },
  { title: 'IPU成像参数', end: 76 },
  { title: 'IPU参数-只传不压-应急', end: 80 },
  { title: 'IPU参数-高速数传', end: 93 },
], { 12: '0', 13: '0', 20: '45' })

export const parametersByCategory = {
  基础配置参数: basicParameters,
  卫星型号参数: satelliteParameters,
  任务模板参数: templateParameters,
} as const
