import { ports, previewHost } from '../version'
export const taskPlanningUrl = `http://${previewHost}:${ports.task}/app/mccs/tasksys/requirement/list`
export const orbitUrl = `http://${previewHost}:${ports.orbit}/app/mccs/orbitsys/orbit/track-manage`
export const visualSimulationUrl = `http://${previewHost}:${ports.visual}/app/mccs/visualsys/model/list`

export const productSystems = [
  { label: '任务规划系统', href: taskPlanningUrl },
  { label: '轨道计算系统', href: orbitUrl, active: true },
  { label: '可视化仿真系统', href: visualSimulationUrl },
  { label: '遥控管理系统' },
  { label: '遥测监视系统' },
  { label: '接入与权限系统', global: true },
]

export const frameworkAreas = [
  { title: '轨道数据', description: '统一承载轨道数据接入、版本识别与数据可用性核验。' },
  { title: '轨道计算', description: '承载计算任务、执行过程与结果状态的统一工作区。' },
  { title: '结果分析', description: '承载轨道结果查看、比对与后续业务联动入口。' },
]
