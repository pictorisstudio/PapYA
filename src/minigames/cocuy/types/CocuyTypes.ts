export type ObstacleType = 'ROCK' | 'CLOUD' | 'WIND'
export type ObstacleState = 'ACTIVE' | 'TRIGGERED' | 'DESTROYED'
export type CocuyGameState = 'READY' | 'PLAYING' | 'FINISHED'
export type CocuyInputDirection = -1 | 0 | 1
export type EnvironmentZone = 'VEGETATION' | 'PARAMO' | 'ROCK' | 'SNOW'

export interface CocuyPoint {
  x: number
  y: number
}

export interface CocuyRect {
  x: number
  y: number
  width: number
  height: number
}

export interface ObstacleSpawnOptions extends CocuyPoint {
  id: string
  type: ObstacleType
  speed: number
  radius?: number
  windDirection?: -1 | 1
}

export interface AscentSnapshot {
  altitude: number
  rate: number
  environmentZone: EnvironmentZone
  victory: boolean
}

export interface MovementSnapshot {
  x: number
  velocity: number
  inputDirection: CocuyInputDirection
  windInfluence: number
}

export interface CocuyDebugSnapshot {
  state: CocuyGameState
  elapsedMs: number
  ascent: AscentSnapshot
  movement: MovementSnapshot
  worldScrollSpeed: number
  activeObstacles: number
}
