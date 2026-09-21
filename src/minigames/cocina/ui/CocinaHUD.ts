import Phaser from 'phaser'
import { DEBUG_MODE } from '../../../config/constants'
import { COCINA_CONFIG } from '../config/cocinaConfig'
import type { CocinaDebugSnapshot, CocinaPhase, CookingSnapshot, RecipeSnapshot } from '../types/CocinaTypes'

interface CocinaHUDActions {
  forceRecipeComplete: () => void
  addWrongIngredient: () => void
  removeWrongIngredients: () => void
  forceOptimal: () => void
  forceHigh: () => void
  forceCooking95: () => void
  forceBurn95: () => void
  forceWin: () => void
  forceLose: () => void
  restart: () => void
}

export default class CocinaHUD {
  private readonly timeText: Phaser.GameObjects.Text
  private readonly phaseText: Phaser.GameObjects.Text
  private readonly messageText: Phaser.GameObjects.Text
  private readonly finalText: Phaser.GameObjects.Text
  private readonly debugText?: Phaser.GameObjects.Text

  constructor(private readonly scene: Phaser.Scene, actions: CocinaHUDActions) {
    scene.add.rectangle(430, COCINA_CONFIG.SAFE_MARGIN_Y + 30, 748, 84, COCINA_CONFIG.COLORS.panel, 0.82).setStrokeStyle(2, 0x334155)
    scene.add.text(COCINA_CONFIG.SAFE_MARGIN_X, COCINA_CONFIG.SAFE_MARGIN_Y, 'COCIDO BOYACENSE', {
      fontSize: '28px',
      fontStyle: '700',
      color: COCINA_CONFIG.COLORS.text,
    })
    this.timeText = scene.add.text(940, COCINA_CONFIG.SAFE_MARGIN_Y, 'TIEMPO: 30', { fontSize: '26px', fontStyle: '700', color: COCINA_CONFIG.COLORS.text })
    this.phaseText = scene.add.text(COCINA_CONFIG.SAFE_MARGIN_X, COCINA_CONFIG.SAFE_MARGIN_Y + 42, 'FASE: INGREDIENTES', {
      fontSize: '20px',
      color: '#d8dee9',
    })
    this.messageText = scene.add.text(640, 500, 'Arrastra los ingredientes a la olla', { fontSize: '25px', fontStyle: '700', color: COCINA_CONFIG.COLORS.text }).setOrigin(0.5).setDepth(760)
    this.finalText = scene.add.text(640, 330, '', { fontSize: '46px', fontStyle: '700', color: COCINA_CONFIG.COLORS.text, align: 'center', lineSpacing: 12 }).setOrigin(0.5).setDepth(1000)

    if (DEBUG_MODE) {
      scene.add.rectangle(856, 174, 400, 244, 0x05070c, 0.7).setOrigin(0, 0).setDepth(900)
      this.debugText = scene.add.text(870, 186, '', { fontSize: '13px', color: '#d6e4ff', lineSpacing: 4 }).setDepth(901)
      this.addButton(870, 338, 'RECIPE', actions.forceRecipeComplete, 64)
      this.addButton(940, 338, 'WRONG', actions.addWrongIngredient, 60)
      this.addButton(1006, 338, 'CLEAN', actions.removeWrongIngredients, 58)
      this.addButton(1070, 338, 'OPT', actions.forceOptimal, 44)
      this.addButton(1120, 338, 'HIGH', actions.forceHigh, 48)
      this.addButton(1174, 338, 'C95', actions.forceCooking95, 42)
      this.addButton(870, 368, 'B95', actions.forceBurn95, 42)
      this.addButton(918, 368, 'WIN', actions.forceWin, 48)
      this.addButton(972, 368, 'LOSE', actions.forceLose, 54)
      this.addButton(1032, 368, 'RESET', actions.restart, 58)
    }
  }

  update(phase: CocinaPhase, remainingMs: number, recipe: RecipeSnapshot, cooking: CookingSnapshot): void {
    this.timeText.setText(`TIEMPO: ${Math.ceil(remainingMs / 1000)}`)
    this.phaseText.setText(`FASE: ${phase === 'PREPARATION' ? 'INGREDIENTES' : phase === 'COOKING' ? 'COCCION' : 'FINAL'}`)

    if (phase === 'PREPARATION') {
      if (recipe.incorrectCount > 0) {
        this.messageText.setText('HAY UN INGREDIENTE INCORRECTO')
        this.messageText.setColor(COCINA_CONFIG.COLORS.warning)
        return
      }

      this.messageText.setText(`Ingredientes correctos: ${recipe.correctCount}/${COCINA_CONFIG.CORRECT_INGREDIENT_COUNT}`)
      this.messageText.setColor(COCINA_CONFIG.COLORS.text)
      return
    }

    if (phase === 'COOKING') {
      this.messageText.setText(`Fuego ${cooking.heatZone}`)
      this.messageText.setColor(cooking.heatZone === 'OPTIMAL' ? COCINA_CONFIG.COLORS.good : cooking.heatZone === 'HIGH' ? COCINA_CONFIG.COLORS.danger : COCINA_CONFIG.COLORS.warning)
    }
  }

  showMessage(message: string, color = COCINA_CONFIG.COLORS.good): void {
    this.messageText.setText(message)
    this.messageText.setColor(color)
    this.messageText.setAlpha(1)
    this.scene.tweens.add({
      targets: this.messageText,
      alpha: { from: 1, to: 0.72 },
      duration: 520,
      ease: 'Sine.easeOut',
    })
  }

  updateDebug(snapshot: CocinaDebugSnapshot): void {
    if (!this.debugText) {
      return
    }

    this.debugText.setText([
      `Phase: ${snapshot.phase}`,
      `Correct: ${snapshot.recipe.correctCount}`,
      `Wrong: ${snapshot.recipe.incorrectCount}`,
      `In pot: ${snapshot.ingredientsInPot}`,
      `Fire: ${snapshot.cooking.fireLevel.toFixed(2)}`,
      `Temp: ${snapshot.cooking.temperature.toFixed(2)} (${snapshot.cooking.heatZone})`,
      `Cook: ${Math.round(snapshot.cooking.cookingProgress)}%`,
      `Burn: ${Math.round(snapshot.cooking.burnProgress)}%`,
    ])
  }

  showFinal(victory: boolean, score: number): void {
    this.finalText.setText(`${victory ? '¡Cocido listo!' : 'Cocido perdido'}\n${victory ? 'VICTORIA' : 'DERROTA'}\nPuntaje: ${score}`)
    this.finalText.setColor(victory ? COCINA_CONFIG.COLORS.good : COCINA_CONFIG.COLORS.danger)
  }

  private addButton(x: number, y: number, label: string, action: () => void, width: number): void {
    const button = this.scene.add.rectangle(x, y, width, 24, 0x1f2937, 0.94).setOrigin(0, 0).setDepth(902)
    button.setStrokeStyle(1, 0x64748b)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerdown', action)
    this.scene.add.text(x + width / 2, y + 12, label, { fontSize: '10px', color: '#ffffff' }).setOrigin(0.5).setDepth(903)
  }
}
