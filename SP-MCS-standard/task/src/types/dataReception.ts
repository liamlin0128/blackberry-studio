export interface ParsedDataRecord {
  id: string
  planId: string
  status?: string
  timestamp?: string
  type: string
  satellite: string
  receivedAt: string
  raw: string
}

export interface SpaceFileRecord {
  id: string
  fileName: string
  packageName: string
  predecessorPlan: string
  location: string
  sizeMb: number
  existenceStatus: string
  transmissionStatus: string
  relatedPlan: string
  satellite: string
  createdAt: string
  updatedAt: string
}

export interface UploadRegistration {
  softwareName: string
  version: string
  satellite: string
  volumeCount: number
  sourcePath: string
  editor: string
  registeredAt: string
  editedAt: string
  md5?: string
  volumePath?: string
  sourceRemark?: string
  finalResult?: '成功' | '失败'
  resultRemark?: string
  volumeFiles?: UploadVolumeFile[]
}

export interface UploadVolumeFile {
  id: string
  fileName: string
  path: string
  md5: string
  uploadedAt?: string
}
