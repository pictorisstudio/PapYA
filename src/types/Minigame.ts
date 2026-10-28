export type MinigameKey = 'ruana' | 'cocina' | 'trompo' | 'papa' | 'tejo' | 'cocuy'

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
  rawScore: number
  metrics: Record<string, number>
}

export interface RecordedMinigameResult extends MinigameResult {
  // Puntos de viaje comparables entre mecánicas: 100 por completar, 0 en otro caso.
  score: number
}
