export type CocinaPhase = 'PREPARATION' | 'COOKING' | 'FINISHED'
export type IngredientState = 'AVAILABLE' | 'DRAGGING' | 'IN_POT'
export type HeatZone = 'LOW' | 'OPTIMAL' | 'HIGH'

export interface CocinaPoint {
  x: number
  y: number
}

export interface IngredientData extends CocinaPoint {
  id: string
  name: string
  isCorrect: boolean
  color: number
}

export interface RecipeSnapshot {
  correctCount: number
  incorrectCount: number
  complete: boolean
}

export interface CookingSnapshot {
  fireLevel: number
  temperature: number
  heatZone: HeatZone
  cookingProgress: number
  burnProgress: number
  victory: boolean
  burned: boolean
}

export interface CocinaDebugSnapshot {
  phase: CocinaPhase
  recipe: RecipeSnapshot
  cooking: CookingSnapshot
  ingredientsInPot: string
}
