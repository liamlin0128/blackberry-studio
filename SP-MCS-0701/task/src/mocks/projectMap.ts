// V3.0 HTML 的展示数据；轮廓、边界和过境均为原型模拟，不作业务计算依据。
export const gansuOutline: [number, number][] = [[95,41],[97,41.5],[99,41],[100,41.6],[101.6,41.2],[102.9,41],[103.6,40],[104.4,39.5],[105.3,39],[106.2,39],[107.2,38.5],[108.6,37.5],[109.2,36.5],[108.6,35.4],[107.5,34.4],[106.1,33.9],[105.1,33.4],[104.1,32.9],[103.2,33.6],[102.6,34.6],[101.1,34.1],[99.6,34.1],[98.6,35.2],[97.1,35.6],[95.6,36.7],[94.1,37.2],[93.1,38.2],[92.6,39.2],[93.1,40.2],[94.1,40.6]]
export const adminCenters: Record<string, Record<string, Record<string, [number, number]>>> = {
  甘肃省: {
    兰州市: { 城关区:[103.89,36.06], 七里河区:[103.78,36.06], 安宁区:[103.72,36.10], 西固区:[103.63,36.09] },
    酒泉市: { 肃州区:[98.51,39.74], 敦煌市:[94.66,40.14], 金塔县:[98.90,39.98] },
    张掖市: { 甘州区:[100.45,38.93], 临泽县:[100.17,39.15] },
    天水市: { 秦州区:[105.72,34.58], 麦积区:[105.89,34.57] },
    武威市: { 凉州区:[102.64,37.93], 民勤县:[103.09,38.62] },
  },
  陕西省: { 西安市: { 碑林区:[108.93,34.23], 雁塔区:[108.94,34.22], 未央区:[108.96,34.30] }, 宝鸡市: { 渭滨区:[107.15,34.37], 金台区:[107.13,34.38] } },
  青海省: { 西宁市: { 城中区:[101.78,36.62], 城东区:[101.82,36.60] }, 海东市: { 乐都区:[102.40,36.48] } },
  宁夏回族自治区: { 银川市: { 兴庆区:[106.29,38.48], 金凤区:[106.23,38.47] } },
}

export interface MockPass { id: number; start: Date; end: Date; longitude: number; areaM2: number }
const anchor = new Date('2026-08-25T12:12:15+08:00').getTime()
const dayMs = 86_400_000
export function mockPasses(start: Date, end: Date, center: [number, number]): MockPass[] {
  if (end <= start) return []
  const first = Math.floor((start.getTime() - anchor) / dayMs) - 1
  const last = Math.ceil((end.getTime() - anchor) / dayMs) + 1
  const days: number[] = []
  for (let day = first; day <= last; day++) {
    const time = anchor + day * dayMs - day * 9.5 * 60_000
    if (time >= start.getTime() && time <= end.getTime()) days.push(day)
  }
  return days.map((day, index) => {
    const time = anchor + day * dayMs - day * 9.5 * 60_000
    return { id: index + 1, start: new Date(time), end: new Date(time + 141_000 + ((index + 1) % 3) * 3_000), longitude: center[0] + (index - (days.length - 1) / 2) * .45, areaM2: Math.round(119_000 + (index + 1) * 1120 + Math.abs(Math.sin(day)) * 260) }
  })
}
