import type { SimulationModel, SimulationVersion } from '../types/model'

export const initialModels: SimulationModel[] = [
  { id: 'S000005', name: 'MDSatellite1B', shortName: '木铎1B卫星', category: '卫星', version: '1.0', updateTime: '2025-11-07 16:28:21', enabled: true, description: '木铎1B卫星实体模型' },
  { id: 'S000004', name: 'MDSatellite1A', shortName: '木铎1A卫星', category: '卫星', version: '1.0', updateTime: '2025-11-07 16:28:21', enabled: true, description: '木铎1A卫星实体模型' },
  { id: 'S000003', name: 'MDGroundStation', shortName: '地面站', category: '地面站', version: '1.0', updateTime: '2025-11-07 16:28:21', enabled: true, description: '地面站实体模型' },
  { id: 'S000006', name: 'MDStorage', shortName: '固存', category: '固存', version: '1.0', updateTime: '2025-11-07 16:28:21', enabled: true, description: '星载固存实体模型' },
  { id: 'S000009', name: 'MDCameraHyperspectral', shortName: '高光谱相机', category: '相机', version: '1.0', updateTime: '2026-02-09 13:23:39', enabled: true, description: '高光谱相机实体模型' },
]

export const initialSimulationVersions: SimulationVersion[] = [
  { id: 'version-1.0', name: 'V 1.0', engine: '仿真引擎 1.0', modelIds: initialModels.map((item) => item.id) },
]
