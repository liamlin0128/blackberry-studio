// Local preview calculations. Leap-second validity is deliberately bounded to the published interval.
const HOUR = 3_600_000
const DAY = 86_400_000
const FIRST_UTC = Date.UTC(2017, 0, 1)
const LAST_UTC = Date.UTC(2027, 0, 1)

export type InputScale = 'BJT' | 'UTC'

export function parseClock(value: string, scale: InputScale): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value)
  if (!match) throw new Error('请选择完整的时间点。')
  const [, year, month, day, hour, minute, second = '00'] = match
  const naive = Date.UTC(+year, +month - 1, +day, +hour, +minute, +second)
  const check = new Date(naive)
  if (check.getUTCFullYear() !== +year || check.getUTCMonth() !== +month - 1 || check.getUTCDate() !== +day || check.getUTCHours() !== +hour || check.getUTCMinutes() !== +minute || check.getUTCSeconds() !== +second) throw new Error('时间点无效。')
  const utc = naive - (scale === 'BJT' ? 8 * HOUR : 0)
  if (utc < FIRST_UTC || utc >= LAST_UTC) throw new Error('当前时间尺度换算仅支持 2017-01-01 至 2026-12-31；超出范围需更新闰秒数据。')
  return new Date(utc)
}

export function clockInput(date = new Date(), scale: InputScale = 'BJT'): string {
  const shifted = new Date(date.getTime() + (scale === 'BJT' ? 8 * HOUR : 0))
  return shifted.toISOString().slice(0, 19)
}

function stamp(ms: number): string { return new Date(ms).toISOString().slice(0, 23) }

export function convertTime(utc: Date) {
  const ms = utc.getTime()
  if (ms < FIRST_UTC || ms >= LAST_UTC) throw new Error('当前闰秒数据仅覆盖 2017 至 2026 年。')
  const tai = ms + 37_000
  const tt = tai + 32_184
  const jdUtc = ms / DAY + 2440587.5
  const jdTt = tt / DAY + 2440587.5
  const centuries = (jdTt - 2451545) / 36525
  const meanAnomaly = (357.528 + 35999.05 * centuries) * Math.PI / 180
  const tdb = tt + 1.658 * Math.sin(meanAnomaly + 0.0167 * Math.sin(meanAnomaly))
  const tcg = tt + 6.969290134e-10 * (jdTt - 2443144.5) * DAY
  const jdTdb = tdb / DAY + 2440587.5
  const tcb = tdb + 1.550519768e-8 * (jdTdb - 2443144.5003725) * DAY + 0.0655
  return [
    ['UTC时间', stamp(ms)], ['BJT', stamp(ms + 8 * HOUR)],
    ['儒略日（UTC）', jdUtc.toFixed(9)], ['简化儒略日（UTC）', (jdUtc - 2400000.5).toFixed(9)],
    ['Terrestrial Time（TT）', stamp(tt)], ['Barycentric Coordinate Time（TCB，近似）', stamp(tcb)],
    ['Galileo System Time（GST）', stamp(tai - 19_000)], ['Geocentric Coordinate Time（TCG）', stamp(tcg)],
    ['Barycentric Dynamic Time（TDB，近似）', stamp(tdb)], ['International Atomic Time（TAI）', stamp(tai)],
  ] as const
}
