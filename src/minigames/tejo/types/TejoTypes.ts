export type TejoImpactResult = 'MECHA' | 'NEAR' | 'OUT'
export type TejoPhase = 'READY' | 'AIMING' | 'THROWING' | 'IMPACT' | 'RESETTING' | 'FINISHED'

export interface TejoPoint {
  x: number
  y: number
}

export interface TejoAimState {
  dragX: number
  dragY: number
  dragDistance: number
  effectiveDragDistance: number
  normalizedPower: number
  power: number
  target: TejoPoint
  arcHeight: number
  durationMs: number
}

export interface TejoScoreSnapshot {
  score: number
  mechas: number
  throws: number
  victory: boolean
}

export interface TejoDebugSnapshot {
  phase: TejoPhase
  power: number
  normalizedPower: number
  dragDistance: number
  effectiveDragDistance: number
  target: TejoPoint | null
  drag: TejoPoint | null
  elapsedMs: number
}
