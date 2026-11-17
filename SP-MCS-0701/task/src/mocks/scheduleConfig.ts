export interface ScheduleConfig {
  trigger: string
  paths: string[]
  cycle: string
  timeout: string
  algorithm: string
  taskDays: string
  coverageDays: string
  confirmDays: string
}

const key = 'sp-mcs-0701-schedule-config'
export const defaultScheduleConfig: ScheduleConfig = {
  trigger: '自动定时触发', paths: ['遥控路径', '北斗路径'], cycle: '12小时1次',
  timeout: '5', algorithm: '巡查优先+任务数量优化策略模型', taskDays: '8', coverageDays: '7', confirmDays: '7',
}

export function loadScheduleConfig(): ScheduleConfig {
  try { return { ...defaultScheduleConfig, ...JSON.parse(localStorage.getItem(key) || '{}') } }
  catch { return { ...defaultScheduleConfig } }
}

export function saveScheduleConfig(value: ScheduleConfig) { localStorage.setItem(key, JSON.stringify(value)) }

export function nextPlanningTime(config: ScheduleConfig, now = new Date()): string {
  if (config.trigger !== '自动定时触发') return '未启用自动规划'
  const matched = config.cycle.match(/^(\d+)(分钟|小时)1次$/)
  if (!matched) return '请配置执行周期'
  const interval = Number(matched[1]) * (matched[2] === '小时' ? 3_600_000 : 60_000)
  // 按北京时间当日 00:00 对齐周期，不依赖浏览器所在时区。
  const beijingOffset = 8 * 3_600_000
  const next = (Math.floor((now.getTime() + beijingOffset) / interval) + 1) * interval - beijingOffset
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date(next))
}
