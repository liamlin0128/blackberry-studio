import { antennaEvidence } from './antenna-evidence'

export interface PayloadChannel {
  code: string
  name: string
  sensorType: string
  resolution: string
  imagingType: string
  imagingMode: string
  frameRateType: string
  frameRate: string
  bands: string
  quantization: string
  maxRateFrom: string
  maxRateTo: string
  arrayX: string
  arrayY: string
  imageX: string
  imageY: string
  imageSize: string
}

export interface OpticalPayloadRecord {
  name: string
  code: string
  satellite: string
  swath: string
  altitude: string
  createdAt: string
  updatedAt: string
  createdBy: string
  lifetime: string
  rollMin: string
  rollMax: string
  pitchMin: string
  pitchMax: string
  channels: PayloadChannel[]
}

export const blankChannel = (): PayloadChannel => ({
  code: '', name: '', sensorType: '', resolution: '', imagingType: '', imagingMode: '',
  frameRateType: '', frameRate: '', bands: '', quantization: '', maxRateFrom: '', maxRateTo: '',
  arrayX: '', arrayY: '', imageX: '', imageY: '', imageSize: '',
})

export const initialPayloads: OpticalPayloadRecord[] = [
  {
    name: 'HSI', code: 'HSI', satellite: '木铎1B', swath: '30', altitude: '530',
    createdAt: '2023-09-15 09:31:45', updatedAt: '2026-09-01 18:23:57', createdBy: 'lilin',
    lifetime: '5', rollMin: '-45', rollMax: '45', pitchMin: '-45', pitchMax: '45',
    channels: [
      { ...blankChannel(), code: 'VSI', name: '可见光通道', sensorType: '高光谱可见光', resolution: '30m', imagingType: '推扫', imagingMode: '推扫', frameRateType: '无帧率', bands: '0102', quantization: '12', maxRateFrom: '514', maxRateTo: '12' },
      { ...blankChannel(), code: 'RSI', name: '红外通道', sensorType: '高光谱红外', resolution: '30m', imagingType: '推扫', imagingMode: '推扫', frameRateType: '无帧率', bands: '0102 16个@410nm～1020nm；' },
    ],
  },
  {
    name: 'PMS', code: 'PMS', satellite: '木铎1A', swath: '118', altitude: '',
    createdAt: '2023-09-15 09:31:42', updatedAt: '2026-09-01 18:24:07', createdBy: 'lilin',
    lifetime: '', rollMin: '', rollMax: '', pitchMin: '', pitchMax: '',
    channels: [{ ...blankChannel(), code: 'PMS', name: 'PMS' }],
  },
]

export interface AntennaLink {
  enabled: boolean
  type: string
  band: string
  rate: string
  direction: string
  channel: string
}

export interface AntennaPeriod {
  id: number
  status: string
  startAt: string
  endAt: string
}

export interface AntennaRecord {
  id: string
  name: string
  englishName: string
  ownership: string
  type: string
  status: string
  createdAt: string
  updatedAt: string
  updatedBy: string
  maxElevation?: string
  minElevation?: string
  downlinkMinElevation?: string
  aperture?: string
  longitude?: string
  latitude?: string
  altitude?: string
  model?: string
  links?: AntennaLink[]
  periods?: AntennaPeriod[]
}

export const blankLink = (): AntennaLink => ({ enabled: true, type: '测控', band: 'X', rate: '', direction: '上行', channel: '单通道' })

export const initialAntennas: AntennaRecord[] = antennaEvidence.map((row) => row.id === 'TY0702' ? {
  ...row, maxElevation: '90', minElevation: '5', downlinkMinElevation: '15',
  longitude: '113.152016', latitude: '27.941818', altitude: '80', model: 'MDGroundStation',
  links: [
    { enabled: true, type: '测控', band: 'X', rate: '2', direction: '上行', channel: '单通道' },
    { enabled: true, type: '测控', band: 'X', rate: '2', direction: '下行', channel: '单通道' },
    { enabled: true, type: '数传', band: 'X', rate: '300', direction: '上行', channel: '单通道' },
    { enabled: true, type: '数传', band: 'X', rate: '300', direction: '下行', channel: '单通道' },
  ],
  periods: [{ id: 1, status: '维护', startAt: '2026-09-30 23:07:11', endAt: '2026-09-30 23:37:11' }],
} : { ...row })

