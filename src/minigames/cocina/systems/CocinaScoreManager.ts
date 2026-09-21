import { COCINA_CONFIG } from '../config/cocinaConfig'

export default class CocinaScoreManager {
  calculateScore(remainingMs: number, burnProgress: number, ingredientErrors: number): number {
    const timeBonus = Math.ceil(remainingMs / 1000) * 10
    const burnBonus = Math.max(0, Math.round(100 - burnProgress))
    const errorPenalty = ingredientErrors * 20

    return Math.max(0, timeBonus + burnBonus - errorPenalty + COCINA_CONFIG.CORRECT_INGREDIENT_COUNT * 10)
  }
}
