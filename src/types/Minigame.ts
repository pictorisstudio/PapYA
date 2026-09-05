export type MinigameKey = 'ruana' | 'cocina' | 'papa' | 'tejo' | 'cocuy'

export interface MinigameConfig {
  key: MinigameKey
  sceneKey: string
  name: string
  instruction: string
  backgroundColor: number
}

export interface MinigameResult {
  key: MinigameKey
  won: boolean
  score: number
}
