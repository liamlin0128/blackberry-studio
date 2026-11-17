export type CurrentOrbitInput = {
  satellite: string
  orbitId: string
  epoch: string
  altitudeKm: string
  pairDistanceKm: string
  source: string
}

export type ThrusterCalibration = {
  satellite: string
  satelliteCode: string
  propulsionType: string
  nominalThrustMn: string
  calibrationFactor: string
  effectiveThrustMn: string
  specificImpulseSeconds: string
  maxSingleBurnSeconds: string
}

export const currentOrbitInputs: CurrentOrbitInput[] = [
  { satellite: '木铎1A', orbitId: '638429677324599671', epoch: '2026-09-22 01:12:44', altitudeKm: '531.0492', pairDistanceKm: '2654.7017', source: 'TLE' },
  { satellite: '木铎1B', orbitId: '638429705711649143', epoch: '2026-09-22 01:12:44', altitudeKm: '529.8000', pairDistanceKm: '2654.7017', source: 'TLE' },
]

export const thrusterCalibrations: ThrusterCalibration[] = [
  { satellite: '木铎1A', satelliteCode: 'MD1A', propulsionType: '电推进', nominalThrustMn: '20', calibrationFactor: '0.92', effectiveThrustMn: '18.40', specificImpulseSeconds: '1500', maxSingleBurnSeconds: '36000' },
  { satellite: '木铎1B', satelliteCode: 'MD1B', propulsionType: '电推进', nominalThrustMn: '20', calibrationFactor: '0.92', effectiveThrustMn: '18.40', specificImpulseSeconds: '1500', maxSingleBurnSeconds: '36000' },
]

