export type PrecisionSource = { id: string; satellite: string; file: string; start: string; end: string; received: string; source: string }
export type HistoricalTelemetry = { id: string; satellite: string; start: string; end: string; count: number; source: string }

export const precisionSatellites = ['木铎1A', '木铎1B']
export const rawObservationRows: PrecisionSource[] = [
  { id: 'GNSS-001', satellite: '木铎1A', file: 'MD1A_20260525_0x15_105020_GNSS', start: '2026-05-25 10:50:20', end: '2026-05-26 10:50:20', received: '2026-05-26 11:30:42', source: 'MD1A_20260525_0x15_105020_GNSS.DAT' },
  { id: 'GNSS-003', satellite: '木铎1A', file: 'MD1A_20260526_0x15_105020_GNSS', start: '2026-05-26 10:50:20', end: '2026-05-27 10:50:20', received: '2026-05-27 11:30:42', source: 'MD1A_20260526_0x15_105020_GNSS.DAT' },
  { id: 'GNSS-004', satellite: '木铎1A', file: 'MD1A_20260528_0x15_105020_GNSS', start: '2026-05-28 10:50:20', end: '2026-05-29 10:50:20', received: '2026-05-29 11:30:42', source: 'MD1A_20260528_0x15_105020_GNSS.DAT' },
  { id: 'GNSS-002', satellite: '木铎1B', file: 'MD1B_20260525_0x15_111230_GNSS', start: '2026-05-25 11:12:30', end: '2026-05-25 11:12:30', received: '2026-05-25 11:51:08', source: 'MD1B_20260525_0x15_111230_GNSS.DAT' },
]
export const historicalTelemetryRows: HistoricalTelemetry[] = [
  { id: 'TM-001', satellite: '木铎1A', start: '2026-05-25 10:50:20', end: '2026-05-27 10:50:20', count: 2881, source: 'MD1A_20260525_20260527_TM.DAT' },
  { id: 'TM-002', satellite: '木铎1B', start: '2026-05-25 11:12:30', end: '2026-05-25 12:12:30', count: 61, source: 'MD1B_20260525_TM.DAT' },
]
export const precisionAuxiliaryFiles = [
  { key: 'sp3', label: '精密星历（sp3）', file: 'COD0OPSFIN_20231600000_01D_05M_ORB.SP3' },
  { key: 'clk', label: '精密钟差（clk）', file: 'COD0OPSFIN_20231600000_01D_05S_CLK.CLK' },
  { key: 'bia', label: '绝对信号偏差（bia）', file: 'COD0OPSFIN_20231600000_01D_01D_OSB.BIA' },
  { key: 'atx', label: '天线相位中心改正（atx）', file: 'igs20.atx' },
  { key: 'erp', label: '地球自转参数（erp）', file: 'COD0OPSFIN_20231550000_07D_01D_ERP.ERP' },
  { key: 'p23', label: '广播星历（23n）', file: 'brdc1600.23n' },
]
