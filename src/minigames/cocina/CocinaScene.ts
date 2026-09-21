import Phaser from 'phaser'
import DebugPanel from '../../components/DebugPanel'
import { DEBUG_MODE } from '../../config/constants'
import { gameManager } from '../../core/GameManager'
import { COCINA_CONFIG } from './config/cocinaConfig'
import CookingPot from './entities/CookingPot'
import CocinaScoreManager from './systems/CocinaScoreManager'
import CookingSystem from './systems/CookingSystem'
import IngredientManager from './systems/IngredientManager'
import RecipeManager from './systems/RecipeManager'
import CocinaHUD from './ui/CocinaHUD'
import CookingDisplay from './ui/CookingDisplay'
import HeatControls from './ui/HeatControls'
import type { CocinaPhase } from './types/CocinaTypes'

export default class CocinaScene extends Phaser.Scene {
  private pot?: CookingPot
  private ingredientManager?: IngredientManager
  private recipeManager?: RecipeManager
  private cookingSystem?: CookingSystem
  private scoreManager?: CocinaScoreManager
  private hud?: CocinaHUD
  private heatControls?: HeatControls
  private cookingDisplay?: CookingDisplay
  private phase: CocinaPhase = 'PREPARATION'
  private elapsedMs = 0
  private finished = false
  private ingredientErrors = 0
  private cleanupEvents: Phaser.Time.TimerEvent[] = []

  constructor() {
    super('CocinaScene')
  }

  create(): void {
    this.resetState()
    this.cameras.main.setBackgroundColor(COCINA_CONFIG.COLORS.background)

    this.pot = new CookingPot(this)
    this.ingredientManager = new IngredientManager(this, this.pot)
    this.recipeManager = new RecipeManager()
    this.cookingSystem = new CookingSystem()
    this.scoreManager = new CocinaScoreManager()
    this.cookingDisplay = new CookingDisplay(this)
    this.heatControls = new HeatControls(this, () => this.decreaseHeat(), () => this.increaseHeat())
    this.heatControls.setEnabled(false)
    this.hud = new CocinaHUD(this, {
      forceRecipeComplete: () => this.forceRecipeComplete(),
      addWrongIngredient: () => this.addWrongIngredient(),
      removeWrongIngredients: () => this.removeWrongIngredients(),
      forceOptimal: () => this.forceOptimalTemperature(),
      forceHigh: () => this.forceHighTemperature(),
      forceCooking95: () => this.forceCooking95(),
      forceBurn95: () => this.forceBurn95(),
      forceWin: () => this.finish(true),
      forceLose: () => this.finish(false),
      restart: () => this.scene.restart(),
    })

    this.setDebugVisible(DEBUG_MODE && gameManager.debugManager.areTouchAreasVisible())
    this.input.on('pointerdown', this.handlePointerDown, this)
    this.input.on('pointermove', this.handlePointerMove, this)
    this.input.on('pointerup', this.handlePointerUp, this)
    this.input.on('pointerupoutside', this.handlePointerUp, this)
    this.events.on('debug:touch-areas-changed', this.handleDebugTouchAreasChanged, this)

    new DebugPanel(this)
    this.refreshHud()
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup())
  }

  update(_time: number, delta: number): void {
    if (this.phase === 'FINISHED' || !this.cookingSystem) {
      return
    }

    this.elapsedMs += delta
    const cooking = this.cookingSystem.update(delta, this.phase === 'COOKING')
    this.pot?.updateFire(cooking.fireLevel)
    this.refreshHud()

    if (this.phase === 'COOKING') {
      if (cooking.victory) {
        this.finish(true)
        return
      }

      if (cooking.burned) {
        this.finish(false)
        return
      }
    }

    if (this.elapsedMs >= COCINA_CONFIG.GAME_DURATION_MS) {
      this.finish(cooking.victory)
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.phase !== 'PREPARATION' || !this.ingredientManager) {
      return
    }

    this.ingredientManager.startDrag(pointer.worldX, pointer.worldY)
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.phase !== 'PREPARATION' || !this.ingredientManager) {
      return
    }

    this.ingredientManager.dragTo(pointer.worldX, pointer.worldY)
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.phase !== 'PREPARATION' || !this.ingredientManager) {
      return
    }

    this.ingredientManager.dropAt(pointer.worldX, pointer.worldY)
    this.checkRecipe()
  }

  private checkRecipe(): void {
    if (!this.ingredientManager || !this.recipeManager) {
      return
    }

    const recipe = this.recipeManager.getSnapshot(this.ingredientManager.getIngredientsInPot())

    if (recipe.incorrectCount > 0) {
      this.ingredientErrors += 1
    }

    if (recipe.complete) {
      this.startCooking()
      return
    }

    this.refreshHud()
  }

  private startCooking(): void {
    if (this.phase !== 'PREPARATION') {
      return
    }

    this.phase = 'COOKING'
    this.heatControls?.setEnabled(true)
    this.hud?.showMessage('¡INGREDIENTES LISTOS!')
    this.refreshHud()
  }

  private increaseHeat(): void {
    if (this.phase !== 'COOKING') {
      return
    }

    this.cookingSystem?.increaseHeat()
  }

  private decreaseHeat(): void {
    if (this.phase !== 'COOKING') {
      return
    }

    this.cookingSystem?.decreaseHeat()
  }

  private forceRecipeComplete(): void {
    if (this.phase !== 'PREPARATION') {
      return
    }

    this.ingredientManager?.forceRecipeComplete()
    this.checkRecipe()
  }

  private addWrongIngredient(): void {
    if (this.phase !== 'PREPARATION') {
      return
    }

    this.ingredientManager?.addWrongIngredient()
    this.checkRecipe()
  }

  private removeWrongIngredients(): void {
    if (this.phase !== 'PREPARATION') {
      return
    }

    this.ingredientManager?.removeWrongIngredients()
    this.checkRecipe()
  }

  private forceOptimalTemperature(): void {
    this.cookingSystem?.forceOptimalTemperature()
  }

  private forceHighTemperature(): void {
    this.cookingSystem?.forceHighTemperature()
  }

  private forceCooking95(): void {
    this.cookingSystem?.forceCookingProgress(95)
  }

  private forceBurn95(): void {
    this.cookingSystem?.forceBurnProgress(95)
  }

  private finish(victory: boolean): void {
    if (this.finished || !this.hud || !this.cookingSystem || !this.scoreManager) {
      return
    }

    this.finished = true
    this.phase = 'FINISHED'
    this.removeInputHandlers()
    this.heatControls?.setEnabled(false)

    const remainingMs = Math.max(0, COCINA_CONFIG.GAME_DURATION_MS - this.elapsedMs)
    const cooking = this.cookingSystem.getSnapshot()
    const score = this.scoreManager.calculateScore(remainingMs, cooking.burnProgress, this.ingredientErrors)
    this.hud.showFinal(victory, score)

    this.trackTimer(
      this.time.delayedCall(COCINA_CONFIG.RESET_DELAY_MS, () => {
        const nextScene = gameManager.completeCurrentMinigame(victory)
        this.scene.start(nextScene === 'next' ? 'TransitionScene' : 'ResultsScene')
      }),
    )
  }

  private refreshHud(): void {
    if (!this.hud || !this.cookingSystem || !this.recipeManager || !this.ingredientManager || !this.cookingDisplay) {
      return
    }

    const remainingMs = Math.max(0, COCINA_CONFIG.GAME_DURATION_MS - this.elapsedMs)
    const recipe = this.recipeManager.getSnapshot(this.ingredientManager.getIngredientsInPot())
    const cooking = this.cookingSystem.getSnapshot()

    this.hud.update(this.phase, remainingMs, recipe, cooking)
    this.hud.updateDebug({
      phase: this.phase,
      recipe,
      cooking,
      ingredientsInPot: this.ingredientManager.getIngredientNamesInPot(),
    })
    this.cookingDisplay.update(cooking, this.phase === 'COOKING')
  }

  private handleDebugTouchAreasChanged(visible: boolean): void {
    this.setDebugVisible(DEBUG_MODE && visible)
  }

  private setDebugVisible(visible: boolean): void {
    this.pot?.setDebugVisible(visible)
    this.ingredientManager?.setTouchAreasVisible(visible)
  }

  private resetState(): void {
    this.phase = 'PREPARATION'
    this.elapsedMs = 0
    this.finished = false
    this.ingredientErrors = 0
    this.cleanupEvents = []
  }

  private trackTimer(timer: Phaser.Time.TimerEvent): void {
    this.cleanupEvents.push(timer)
  }

  private cleanup(): void {
    this.removeInputHandlers()
    this.events.off('debug:touch-areas-changed', this.handleDebugTouchAreasChanged, this)

    for (const timer of this.cleanupEvents) {
      timer.remove(false)
    }

    this.ingredientManager?.destroy()
    this.pot?.destroy()
    this.cookingDisplay?.destroy()
    this.heatControls?.destroy()
    this.pot = undefined
    this.ingredientManager = undefined
    this.recipeManager = undefined
    this.cookingSystem = undefined
    this.scoreManager = undefined
    this.hud = undefined
    this.heatControls = undefined
    this.cookingDisplay = undefined
  }

  private removeInputHandlers(): void {
    this.input.off('pointerdown', this.handlePointerDown, this)
    this.input.off('pointermove', this.handlePointerMove, this)
    this.input.off('pointerup', this.handlePointerUp, this)
    this.input.off('pointerupoutside', this.handlePointerUp, this)
  }
}
