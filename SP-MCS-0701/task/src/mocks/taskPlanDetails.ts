export interface DetailField {
  label: string
  value: string | number
  unit?: string
}

export interface TaskPlanDetailEvidence {
  status: string
  station: string
  sentAt: string
  executeStartAt: string
  executeEndAt: string
  latestUploadAt: string
  executeAt: string
  uploadArc: string
  executeArc: string
  category: '数传' | '成像'
  sections: Array<{ title: string; fields: DetailField[] }>
  template: Record<string, unknown>
  relatedTask?: Record<string, string>[]
  relatedMetaTask?: Record<string, string>[]
  logs: Array<{ status: string; action: string; time: string; type: 'warning' | 'primary' }>
}

export const taskPlanDetails: Record<string, TaskPlanDetailEvidence> = {
  '15007600': {
    status: '待发送', station: 'SDZH0451-北师大', sentAt: '2026-09-15 10:39:15', executeStartAt: '2026-09-15 10:40:00', executeEndAt: '2026-09-15 10:50:00', latestUploadAt: '2026-09-15 10:42:00', executeAt: '2026-09-15 10:47:00',
    uploadArc: 'MD1BSDZH04512394', executeArc: 'MD1BSDZH0451318', category: '数传',
    sections: [
      { title: '基础参数', fields: [{ label: '数传站', value: '-' }, { label: '最低仰角', value: 0, unit: '°' }, { label: '目标点经度', value: '115.6153488', unit: '°' }, { label: '目标点纬度', value: '40.2597389', unit: '°' }, { label: '目标点高度', value: 100, unit: 'm' }] },
      { title: '时间信息', fields: [{ label: '任务开始时间', value: '2026-09-15 10:40:00' }, { label: '任务失效时间', value: '2026-09-15 10:50:00' }, { label: '开始传输时间', value: '2026-09-15 10:42:00' }, { label: '结束传输时间', value: '2026-09-15 10:47:00' }] },
      { title: '文件信息', fields: [{ label: '文件列表', value: '10002400_8898' }, { label: '前置遥感计划号', value: '10002400' }] },
    ],
    template: { param: { dt: { missionId: '15007600', type: 5, priority: 8, startTime: '2026-09-15 10:40:00', expiryTime: '2026-09-15 10:50:00', instructNo: 14, startTransTime: '2026-09-15 10:42:00', endTransTime: '2026-09-15 10:47:00', dtAntennaNo: 0, durationTransTime: 456 }, ipuDt: { playbackRoute: '22', compressionRatio: 'FF', unitCount: 1, missionId1: '10002400' } } },
    logs: [{ status: '待发送', action: '新增计划', time: '2026-09-09 12:00:11', type: 'warning' }],
  },
  '10002400': {
    status: '已发送', station: 'SDZH0451-北师大', sentAt: '2026-09-14 11:47:11', executeStartAt: '2026-09-15 11:49:10', executeEndAt: '2026-09-15 12:00:41', latestUploadAt: '2026-09-15 11:47:10', executeAt: '2026-09-15 11:49:10',
    uploadArc: 'MD1BSDZH04512386', executeArc: '-', category: '成像',
    sections: [
      { title: '成像参数', fields: [{ label: '执行卫星', value: '木铎1B' }, { label: '卫星执行模式', value: '提取' }, { label: '是否重点区域', value: '是' }, { label: '执行载荷', value: 'HSI' }, { label: '侧摆角度', value: '-15.8', unit: '°' }, { label: '太阳高度角', value: 0, unit: '°' }, { label: '处理层级', value: 23 }, { label: '处理类型', value: 0 }, { label: '是否提取', value: '是' }, { label: '观测时长', value: 15, unit: '秒' }] },
      { title: '目标点', fields: [{ label: '目标点经度', value: '100.9700487', unit: '°' }, { label: '目标点纬度', value: '26.173141', unit: '°' }, { label: '目标点高度', value: 0, unit: 'm' }] },
      { title: '时间信息', fields: [{ label: '任务开始时间', value: '2026-09-15 11:49:10' }, { label: '任务失效时间', value: '2026-09-15 12:00:41' }, { label: '开始侧摆时间', value: '2026-09-15 11:51:53' }, { label: '结束侧摆时间', value: '2026-09-15 11:52:53' }, { label: '开始成像时间', value: '2026-09-15 11:53:57' }, { label: '结束成像时间', value: '2026-09-15 11:54:12' }, { label: '开始回位时间', value: '2026-09-15 11:54:25' }, { label: '结束回位时间', value: '2026-09-15 11:55:25' }] },
    ],
    template: { param: { ipuImg: { productLevelCode: '23', subType: '00' }, imaging: { missionId: '10002400', type: 0, priority: 8, longitude: 100.9700486527157, latitude: 26.173141046814106, altitude: 0, obsTime: 15, extract: 1, xRollAngle: -15.79871976954147, maxRollAngle: 30 }, hsi: { ffcCorrectionParam: 1, band1Stage: 7, band1Gain: 2 } } },
    relatedTask: [{ taskNo: 'RW202609090121002', sourceNo: 'CX260909000002', name: '1B规划090901', taskType: '单星提取', businessType: '成像', mode: '提取', satellite: 'MD1B', priority: '12', status: '规划成功', createdAt: '2026-09-09 10:38:35', earliestAt: '2026-09-10 00:00:00', latestAt: '2026-09-16 23:59:59', result: '可执行' }],
    relatedMetaTask: [{ metaNo: '1302325033435593', requirementNo: 'RW202609090121002', type: '单星', satellite: '木铎1B', createdAt: '2026-09-09 10:38:43', priority: '12', status: '执行成功', planNo: '10002400', startedAt: '2026-09-15 11:53:57', endedAt: '2026-09-15 11:54:12', payload: 'HSI', rollAngle: '-4.1035°' }],
    logs: [{ status: '待发送', action: '新增计划', time: '2026-09-09 12:00:11', type: 'warning' }, { status: '已发送', action: '计划发送成功', time: '2026-09-14 11:47:11', type: 'primary' }],
  },
}
