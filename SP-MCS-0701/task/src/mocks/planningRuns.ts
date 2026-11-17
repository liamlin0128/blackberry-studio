import type { ScheduleRecord } from '../types/schedule'

const storageKey = 'sp-mcs-0701-semi-planning-runs'

export function readPlanningRuns(): ScheduleRecord[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey) || '[]')
    return Array.isArray(value) ? value : []
  } catch { return [] }
}

export function addPlanningRun(): ScheduleRecord[] {
  const date = new Date()
  const p = (value: number) => String(value).padStart(2, '0')
  const at = `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
  const rows = [{ id: `0701${Date.now()}`, startedAt: at, endedAt: at, durationSeconds: 0, result: '完成' as const, progress: 100, triggerType: '手动' as const }, ...readPlanningRuns()]
  window.localStorage.setItem(storageKey, JSON.stringify(rows))
  return rows
}
