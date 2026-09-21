import Phaser from 'phaser'
import { COCINA_CONFIG } from '../config/cocinaConfig'
import CookingPot from '../entities/CookingPot'
import Ingredient from '../entities/Ingredient'

export default class IngredientManager {
  private readonly ingredients: Ingredient[] = []
  private draggingIngredient: Ingredient | null = null
  private dragOffsetX = 0
  private dragOffsetY = 0

  constructor(private readonly scene: Phaser.Scene, private readonly pot: CookingPot) {
    for (const ingredientData of COCINA_CONFIG.INGREDIENTS) {
      this.ingredients.push(new Ingredient(scene, ingredientData))
    }
  }

  startDrag(x: number, y: number): boolean {
    const ingredient = this.getIngredientAt(x, y)

    if (!ingredient) {
      return false
    }

    this.draggingIngredient = ingredient
    this.dragOffsetX = ingredient.originalPosition.x - ingredient.originalPosition.x
    this.dragOffsetY = ingredient.originalPosition.y - ingredient.originalPosition.y
    ingredient.startDrag()
    ingredient.setPosition({ x, y })
    return true
  }

  dragTo(x: number, y: number): void {
    this.draggingIngredient?.setPosition({ x: x + this.dragOffsetX, y: y + this.dragOffsetY })
  }

  dropAt(x: number, y: number): void {
    const ingredient = this.draggingIngredient

    if (!ingredient) {
      return
    }

    ingredient.stopDrag()
    this.draggingIngredient = null

    if (this.pot.containsDropPoint(x, y)) {
      this.placeIngredientInPot(ingredient)
      return
    }

    ingredient.returnHome()
    this.reflowPotSlots()
  }

  forceRecipeComplete(): void {
    for (const ingredient of this.ingredients) {
      if (ingredient.isCorrect) {
        this.placeIngredientInPot(ingredient)
      } else {
        ingredient.returnHome()
      }
    }

    this.reflowPotSlots()
  }

  addWrongIngredient(): void {
    const wrongIngredient = this.ingredients.find((ingredient) => !ingredient.isCorrect && ingredient.getState() !== 'IN_POT')
    if (wrongIngredient) {
      this.placeIngredientInPot(wrongIngredient)
    }
  }

  removeWrongIngredients(): void {
    for (const ingredient of this.ingredients) {
      if (!ingredient.isCorrect && ingredient.getState() === 'IN_POT') {
        ingredient.returnHome()
      }
    }

    this.reflowPotSlots()
  }

  setTouchAreasVisible(visible: boolean): void {
    for (const ingredient of this.ingredients) {
      ingredient.setTouchAreaVisible(visible)
    }
  }

  getIngredientsInPot(): readonly Ingredient[] {
    return this.ingredients.filter((ingredient) => ingredient.getState() === 'IN_POT')
  }

  getIngredientNamesInPot(): string {
    const names = this.getIngredientsInPot().map((ingredient) => ingredient.name)
    return names.length > 0 ? names.join(', ') : '-'
  }

  destroy(): void {
    for (const ingredient of this.ingredients) {
      ingredient.destroy()
    }

    this.ingredients.length = 0
    this.draggingIngredient = null
  }

  private getIngredientAt(x: number, y: number): Ingredient | null {
    for (let index = this.ingredients.length - 1; index >= 0; index -= 1) {
      const ingredient = this.ingredients[index]

      if (ingredient.contains(x, y)) {
        return ingredient
      }
    }

    return null
  }

  private placeIngredientInPot(ingredient: Ingredient): void {
    const slot = this.pot.getSlotPosition(this.getIngredientsInPot().filter((item) => item.id !== ingredient.id).length)
    ingredient.placeInPot(slot)
    this.reflowPotSlots()
  }

  private reflowPotSlots(): void {
    this.getIngredientsInPot().forEach((ingredient, index) => {
      ingredient.placeInPot(this.pot.getSlotPosition(index))
    })
  }
}
