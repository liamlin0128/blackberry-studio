import { parseClock } from './time'

export type System = 'kepler' | 'j2000' | 'wgs84'
export type TargetSystem = System | 'orbit-elements'
export const SYSTEM_LABELS: Record<TargetSystem, string> = { kepler: 'Kepler根数', j2000: 'J2000坐标系', wgs84: 'WGS84坐标系', 'orbit-elements': '卫星轨道根数' }
export const KEPLER_FIELDS = [
  ['a', '半长轴', 'km'], ['e', '偏心率', ''], ['i', '轨道倾角', '°'],
  ['raan', '升交点赤经', '°'], ['argp', '近地点幅角', '°'], ['m', '平近点角', '°'],
] as const
export const CART_FIELDS = [
  ['x', 'X', 'km'], ['y', 'Y', 'km'], ['z', 'Z', 'km'],
  ['vx', 'Vx', 'km/s'], ['vy', 'Vy', 'km/s'], ['vz', 'Vz', 'km/s'],
] as const
export type Values = Record<string, string>
const MU = 398600.4418 // km^3/s^2
const OMEGA = 7.292115e-5 // rad/s
const RAD = Math.PI / 180
const norm = (a: number) => (a % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
const dot = (a: number[], b: number[]) => a.reduce((sum, v, i) => sum + v * b[i], 0)
const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const mag = (a: number[]) => Math.hypot(...a)
const turn = (a: number[], angle: number) => [Math.cos(angle) * a[0] - Math.sin(angle) * a[1], Math.sin(angle) * a[0] + Math.cos(angle) * a[1], a[2]]

function read(values: Values, keys: readonly string[]) {
  return keys.map((key) => {
    const raw = values[key]?.trim()
    if (!raw) throw new Error(`请填写${key.toUpperCase()}。`)
    const value = Number(raw)
    if (!Number.isFinite(value)) throw new Error(`${key.toUpperCase()} 必须是有效数字。`)
    return value
  })
}

function keplerToCartesian(v: number[]) {
  const [a, e, i, raan, argp, m] = v
  if (a <= 0 || e < 0 || e >= 1 || i < 0 || i > 180) throw new Error('仅支持椭圆轨道：半长轴 > 0 km，0 ≤ 偏心率 < 1，0° ≤ 倾角 ≤ 180°。')
  let eccentric = norm(m * RAD)
  for (let k = 0; k < 30; k++) { const delta = (eccentric - e * Math.sin(eccentric) - norm(m * RAD)) / (1 - e * Math.cos(eccentric)); eccentric -= delta; if (Math.abs(delta) < 1e-13) break }
  const cosE = Math.cos(eccentric), sinE = Math.sin(eccentric), den = 1 - e * cosE
  const p = [a * (cosE - e), a * Math.sqrt(1 - e * e) * sinE, 0]
  const factor = Math.sqrt(MU / a) / den
  const velocity = [-factor * sinE, factor * Math.sqrt(1 - e * e) * cosE, 0]
  const rotate = (q: number[]) => {
    const w = argp * RAD, inc = i * RAD
    const peri = turn(q, w)
    return turn([peri[0], Math.cos(inc) * peri[1], Math.sin(inc) * peri[1]], raan * RAD)
  }
  return [...rotate(p), ...rotate(velocity)]
}

function cartesianToKepler(cart: number[]) {
  const r = cart.slice(0, 3), v = cart.slice(3), radius = mag(r), speed2 = dot(v, v)
  const h = cross(r, v), hmag = mag(h)
  if (radius < 1 || hmag < 1e-9) throw new Error('位置或角动量无效，无法计算轨道根数。')
  const energy = speed2 / 2 - MU / radius
  if (energy >= 0) throw new Error('仅支持椭圆轨道；当前状态对应抛物线或双曲线轨道。')
  const evec = cross(v, h).map((x, idx) => x / MU - r[idx] / radius), e = mag(evec)
  const n = [-h[1], h[0], 0], nmag = mag(n), inc = Math.acos(Math.max(-1, Math.min(1, h[2] / hmag)))
  const raan = nmag < 1e-10 ? 0 : norm(Math.atan2(n[1], n[0]))
  const argp = e < 1e-10 ? 0 : nmag < 1e-10 ? norm(Math.atan2(evec[1], evec[0])) : norm(Math.atan2(dot(cross(n, evec), h) / (nmag * e * hmag), dot(n, evec) / (nmag * e)))
  const trueAnomaly = e < 1e-10 ? nmag < 1e-10 ? norm(Math.atan2(r[1], r[0])) : norm(Math.atan2(dot(cross(n, r), h) / (nmag * radius * hmag), dot(n, r) / (nmag * radius))) : norm(Math.atan2(dot(cross(evec, r), h) / (e * radius * hmag), dot(evec, r) / (e * radius)))
  const eccentric = 2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(trueAnomaly / 2), Math.sqrt(1 + e) * Math.cos(trueAnomaly / 2))
  return [-MU / (2 * energy), e, inc / RAD, raan / RAD, argp / RAD, norm(eccentric - e * Math.sin(eccentric)) / RAD]
}

function gmst(utc: Date) {
  const jd = utc.getTime() / 86400000 + 2440587.5
  return norm((18.697375 + 24.065709824279 * (jd - 2451545)) * Math.PI / 12)
}

function earthFixed(cart: number[], utc: Date, toFixed: boolean) {
  const theta = gmst(utc), r = cart.slice(0, 3), v = cart.slice(3)
  if (toFixed) {
    const rotatedR = turn(r, -theta)
    const rotatedV = turn(v, -theta)
    return [...rotatedR, rotatedV[0] + OMEGA * rotatedR[1], rotatedV[1] - OMEGA * rotatedR[0], rotatedV[2]]
  }
  const correctedV = [v[0] - OMEGA * r[1], v[1] + OMEGA * r[0], v[2]]
  return [...turn(r, theta), ...turn(correctedV, theta)]
}

export function convertOrbit(source: System, target: TargetSystem, values: Values, epoch: string) {
  const utc = parseClock(epoch, 'BJT')
  const sourceValues = read(values, source === 'kepler' ? KEPLER_FIELDS.map(([key]) => key) : CART_FIELDS.map(([key]) => key))
  if (source === target) {
    if (source === 'kepler') keplerToCartesian(sourceValues)
    return sourceValues
  }
  const inertial = source === 'kepler' ? keplerToCartesian(sourceValues) : source === 'wgs84' ? earthFixed(sourceValues, utc, false) : sourceValues
  return target === 'j2000' ? inertial : target === 'wgs84' ? earthFixed(inertial, utc, true) : cartesianToKepler(inertial)
}
