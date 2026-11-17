import type { SimulationInstance, SimulationInstanceLog, SimulationScene } from '../types/simulation'

export const initialSimulationInstances: SimulationInstance[] = [
  { id: 'LEO-001', recordNo: 'N1', name: '轨道仿真-LEO-001', instanceType: '在线仿真', type: '轨道力学', scene: '低轨星座场景', status: 'running', recordTime: '2026-10-13 09:18:26', runtime: '3h 42min', color: '#3b82f6' },
  { id: 'MEO-002', recordNo: 'N2', name: '轨道仿真-MEO-002', instanceType: '在线仿真', type: '轨道力学', scene: '中轨导航场景', status: 'running', recordTime: '2026-10-13 08:02:15', runtime: '5h 18min', color: '#22c55e' },
  { id: 'GEO-003', recordNo: 'S1', name: '姿态仿真-GEO-003', instanceType: '模拟仿真', type: '姿态控制', scene: '地球同步轨道场景', status: 'paused', recordTime: '2026-10-12 17:34:08', runtime: '1h 05min', color: '#f59e0b' },
  { id: 'LEO-004', recordNo: 'N3', name: '通信仿真-LEO-004', instanceType: '在线仿真', type: '通信链路', scene: '星间链路场景', status: 'running', recordTime: '2026-10-13 06:46:51', runtime: '8h 12min', color: '#8b5cf6' },
  { id: 'LEO-005', recordNo: 'S2', name: '热控仿真-LEO-005', instanceType: '模拟仿真', type: '热分析', scene: '深空探测场景', status: 'stopped', recordTime: '2026-10-12 16:12:43', runtime: '--', color: '#6b7280' },
  { id: 'LEO-006', recordNo: 'S3', name: '星座仿真-LEO-006', instanceType: '模拟仿真', type: '星座设计', scene: '低轨星座场景', status: 'running', recordTime: '2026-10-13 08:49:32', runtime: '2h 30min', color: '#ec4899' },
]

export const initialSimulationInstanceLogs: SimulationInstanceLog[] = [
  { id: 'log-N1-06', instanceId: 'LEO-001', time: '2026-10-13 09:18:26', level: 'operation', action: '启动', content: '仿真实例开始启动：成功', source: 'centreServer', operator: '演示用户' },
  { id: 'log-N1-05', instanceId: 'LEO-001', time: '2026-10-13 09:18:25', level: 'operation', action: '启动', content: '仿真实例服务配置文件准备就绪：成功', source: 'managerServer', operator: '演示用户' },
  { id: 'log-N1-04', instanceId: 'LEO-001', time: '2026-10-13 09:18:23', level: 'operation', action: '启动', content: '仿真实例服务运行目录准备就绪：成功', source: 'managerServer', operator: '演示用户' },
  { id: 'log-N1-03', instanceId: 'LEO-001', time: '2026-10-13 09:17:51', level: 'error', action: '启动', content: '实例启动失败：未获取到可用的仿真管理服务', source: 'centreServer', operator: '演示用户' },
  { id: 'log-N1-02', instanceId: 'LEO-001', time: '2026-10-13 09:17:46', level: 'operation', action: '重启', content: '仿真管理服务开始启动实例：成功', source: 'centreServer', operator: '演示用户' },
  { id: 'log-N1-01', instanceId: 'LEO-001', time: '2026-10-13 09:16:30', level: 'operation', action: '关闭', content: '实例已关闭。', source: 'managerServer', operator: '演示用户' },
  { id: 'log-N2-01', instanceId: 'MEO-002', time: '2026-10-13 08:02:15', level: 'operation', action: '启动', content: '实例已启动并进入运行中状态。', source: 'centreServer', operator: '演示用户' },
  { id: 'log-S1-01', instanceId: 'GEO-003', time: '2026-10-12 17:34:08', level: 'operation', action: '暂停', content: '实例已暂停。', source: 'centreServer', operator: '演示用户' },
  { id: 'log-N3-01', instanceId: 'LEO-004', time: '2026-10-13 06:46:51', level: 'operation', action: '启动', content: '实例已启动并进入运行中状态。', source: 'centreServer', operator: '演示用户' },
  { id: 'log-S2-01', instanceId: 'LEO-005', time: '2026-10-12 16:12:43', level: 'operation', action: '关闭', content: '实例已关闭。', source: 'managerServer', operator: '演示用户' },
  { id: 'log-S3-01', instanceId: 'LEO-006', time: '2026-10-13 08:49:32', level: 'operation', action: '启动', content: '实例已启动并进入运行中状态。', source: 'centreServer', operator: '演示用户' },
]

export const initialSimulationScenes: SimulationScene[] = [
  { id: 'scene-001', name: '木铎双星仿真场景', shortName: 'online', type: '正式', scheduleMethod: '在线仿真', editor: '李林', editTime: '2026-10-12 15:40:00', createTime: '2026-10-11 10:28:16', status: 'active', startTime: '同启动时间', version: '1.0', description: '木铎双星仿真场景' },
]
