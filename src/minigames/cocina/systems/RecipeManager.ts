import { COCINA_CONFIG } from '../config/cocinaConfig'
import type Ingredient from '../entities/Ingredient'
import type { RecipeSnapshot } from '../types/CocinaTypes'

export default class RecipeManager {
  getSnapshot(ingredientsInPot: readonly Ingredient[]): RecipeSnapshot {
    const correctCount = ingredientsInPot.filter((ingredient) => ingredient.isCorrect).length
    const incorrectCount = ingredientsInPot.filter((ingredient) => !ingredient.isCorrect).length

    return {
      correctCount,
      incorrectCount,
      complete: correctCount === COCINA_CONFIG.CORRECT_INGREDIENT_COUNT && incorrectCount === 0,
    }
  }
}
