export type PotatoType = 'GOOD' | 'BAD'
export type PotatoState = 'ACTIVE' | 'HIT' | 'MISSED' | 'DESTROYED'

export interface PotatoSpawnOptions {
  id: string
  type: PotatoType
  x: number
  y: number
  velocityX: number
  velocityY: number
  rotationSpeed: number
  scale: number
}

export interface PotatoScoreSnapshot {
  goodPotatoesCollected: number
  badPotatoesTouched: number
  score: number
  target: number
  victory: boolean
}

export interface PapaDebugSnapshot {
  activePotatoes: number
  spawnPaused: boolean
  velocityText: string
}
