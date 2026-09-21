import Phaser from 'phaser'
import { COCINA_CONFIG } from '../config/cocinaConfig'
import type { CocinaPoint, IngredientData, IngredientState } from '../types/CocinaTypes'

export default class Ingredient {
  readonly id: string
  readonly name: string
  readonly isCorrect: boolean
  readonly originalPosition: CocinaPoint
  private readonly container: Phaser.GameObjects.Container
  private readonly touchArea: Phaser.GameObjects.Arc
  private state: IngredientState = 'AVAILABLE'

  constructor(private readonly scene: Phaser.Scene, data: IngredientData) {
    this.id = data.id
    this.name = data.name
    this.isCorrect = data.isCorrect
    this.originalPosition = { x: data.x, y: data.y }

    this.touchArea = scene.add.circle(0, 0, COCINA_CONFIG.INGREDIENT_VISUAL_RADIUS + COCINA_CONFIG.INGREDIENT_TOUCH_PADDING, COCINA_CONFIG.COLORS.touchArea, 0)
    this.touchArea.setStrokeStyle(2, COCINA_CONFIG.COLORS.touchArea, 0)
    const body = scene.add.circle(0, 0, COCINA_CONFIG.INGREDIENT_VISUAL_RADIUS, data.color, 0.96).setStrokeStyle(3, 0xfff7cc, 0.82)
    const label = scene.add
      .text(0, 48, data.name, { fontSize: '17px', fontStyle: '700', color: COCINA_CONFIG.COLORS.text })
      .setOrigin(0.5)

    this.container = scene.add.container(data.x, data.y, [this.touchArea, body, label]).setDepth(data.y)
  }

  contains(x: number, y: number): boolean {
    const radius = COCINA_CONFIG.INGREDIENT_VISUAL_RADIUS + COCINA_CONFIG.INGREDIENT_TOUCH_PADDING
    return Phaser.Math.Distance.Between(this.container.x, this.container.y, x, y) <= radius
  }

  setPosition(point: CocinaPoint): void {
    this.container.setPosition(point.x, point.y)
    this.container.setDepth(Math.round(point.y) + (this.state === 'DRAGGING' ? 500 : 0))
  }

  moveTo(point: CocinaPoint, duration: number = COCINA_CONFIG.INGREDIENT_RETURN_MS): void {
    this.scene.tweens.add({
      targets: this.container,
      x: point.x,
      y: point.y,
      duration,
      ease: 'Sine.easeOut',
      onUpdate: () => this.container.setDepth(Math.round(this.container.y)),
    })
  }

  returnHome(): void {
    this.state = 'AVAILABLE'
    this.moveTo(this.originalPosition)
  }

  placeInPot(point: CocinaPoint): void {
    this.state = 'IN_POT'
    this.moveTo(point, 140)
  }

  startDrag(): void {
    this.state = 'DRAGGING'
    this.container.setScale(1.08)
  }

  stopDrag(): void {
    this.container.setScale(1)
  }

  setTouchAreaVisible(visible: boolean): void {
    this.touchArea.setFillStyle(COCINA_CONFIG.COLORS.touchArea, visible ? 0.1 : 0)
    this.touchArea.setStrokeStyle(2, COCINA_CONFIG.COLORS.touchArea, visible ? 0.82 : 0)
  }

  getState(): IngredientState {
    return this.state
  }

  destroy(): void {
    this.container.destroy(true)
  }
}
