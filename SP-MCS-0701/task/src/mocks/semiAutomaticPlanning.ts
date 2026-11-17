export interface PlanningTask {
  taskNo: string
  name: string
  type: string
  status: '待规划' | '规划成功' | '执行中'
  priority: number
  earliestAt: string
  latestAt: string
}

export interface UploadArc {
  id: string
  startedAt: string
  endedAt: string
  satellite: string
  station: string
  status: '已占用' | '未占用'
}

// 数据集中维护，时间窗口由页面按当前日期生成，便于长期演示筛选交集。
export const planningTasks: PlanningTask[] = [
  { taskNo: 'RW07010001', name: '甘肃区域常规观测', type: '单星观测', status: '待规划', priority: 9, earliestAt: '', latestAt: '' },
  { taskNo: 'RW07010002', name: '河西走廊巡查', type: '协同观测', status: '规划成功', priority: 8, earliestAt: '', latestAt: '' },
  { taskNo: 'RW07010003', name: '应急目标复拍', type: '应急观测', status: '执行中', priority: 6, earliestAt: '', latestAt: '' },
]

export const groundStations = ['株洲0701-椭圆', '株洲0702-椭圆', '密云地面站', '三亚地面站', '喀什地面站']

export const uploadArcs: UploadArc[] = Array.from({ length: 24 }, (_, index) => ({
  id: `MD1${index % 2 ? 'B' : 'A'}TY0701${String(index + 1).padStart(5, '0')}`,
  startedAt: '', endedAt: '',
  satellite: index % 2 ? '木铎1B' : '木铎1A',
  station: groundStations[index % groundStations.length],
  status: index % 3 ? '未占用' : '已占用',
}))
