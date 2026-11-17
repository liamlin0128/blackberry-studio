import type { PrecisionSource } from '../../mocks/postPrecision'

export type ObservationWindow = { start: string; end: string; satellite: string }

function beijingTimestamp(value: string): number {
  return Date.parse(`${value.replace(' ', 'T')}+08:00`)
}

export function validateObservationSelection(rows: PrecisionSource[]): string | null {
  if (rows.length === 0) return '请先选择原始观测量记录。'
  const ordered = [...rows].sort((a, b) => a.start.localeCompare(b.start))
  const satellite = ordered[0].satellite
  let coveredUntil = Number.NEGATIVE_INFINITY

  for (const row of ordered) {
    const start = beijingTimestamp(row.start)
    const end = beijingTimestamp(row.end)
    if (row.satellite !== satellite) return '所选原始观测量记录必须属于同一卫星。'
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return `记录 ${row.id} 的数据时间无效，请重新选择。`
    if (start > coveredUntil && coveredUntil !== Number.NEGATIVE_INFINITY) return '所选记录的数据时间不连续，请选择时间相接或重叠的记录。'
    coveredUntil = Math.max(coveredUntil, end)
  }
  return null
}

export function observationWindow(rows: PrecisionSource[]): ObservationWindow | null {
  if (validateObservationSelection(rows)) return null
  return {
    start: rows.reduce((earliest, row) => row.start < earliest ? row.start : earliest, rows[0].start),
    end: rows.reduce((latest, row) => row.end > latest ? row.end : latest, rows[0].end),
    satellite: rows[0].satellite,
  }
}
