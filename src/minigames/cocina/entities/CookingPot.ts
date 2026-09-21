import Phaser from 'phaser'
import { COCINA_CONFIG } from '../config/cocinaConfig'
import type { CocinaPoint } from '../types/CocinaTypes'

export default class CookingPot {
  private readonly graphics: Phaser.GameObjects.Graphics
  private readonly debugGraphics: Phaser.GameObjects.Graphics
  private readonly fire: Phaser.GameObjects.Triangle
  private readonly dropArea: Phaser.Geom.Rectangle

  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(60)
    this.debugGraphics = scene.add.graphics().setDepth(920)
    this.dropArea = new Phaser.Geom.Rectangle(
      COCINA_CONFIG.POT_DROP_AREA.x,
      COCINA_CONFIG.POT_DROP_AREA.y,
      COCINA_CONFIG.POT_DROP_AREA.width,
      COCINA_CONFIG.POT_DROP_AREA.height,
    )
    this.fire = scene.add.triangle(COCINA_CONFIG.POT_POSITION.x, COCINA_CONFIG.POT_POSITION.y + 126, 0, 58, 34, 0, 68, 58, COCINA_CONFIG.COLORS.fireHigh, 0.95).setDepth(55)
    this.draw()
  }

  containsDropPoint(x: number, y: number): boolean {
    return Phaser.Geom.Rectangle.Contains(this.dropArea, x, y)
  }

  getSlotPosition(index: number): CocinaPoint {
    return COCINA_CONFIG.INTERNAL_POT_SLOTS[index % COCINA_CONFIG.INTERNAL_POT_SLOTS.length]
  }

  updateFire(fireLevel: number): void {
    const scale = Phaser.Math.Linear(0.58, 1.36, fireLevel)
    this.fire.setScale(scale, scale)
    this.fire.setFillStyle(fireLevel > COCINA_CONFIG.HIGH_MIN ? COCINA_CONFIG.COLORS.fireHigh : COCINA_CONFIG.COLORS.fireLow, 0.95)
  }

  setDebugVisible(visible: boolean): void {
    this.debugGraphics.clear()

    if (!visible) {
      return
    }

    this.debugGraphics.lineStyle(3, COCINA_CONFIG.COLORS.dropArea, 0.82)
    this.debugGraphics.strokeRect(this.dropArea.x, this.dropArea.y, this.dropArea.width, this.dropArea.height)
    this.debugGraphics.lineStyle(2, COCINA_CONFIG.COLORS.touchArea, 0.7)

    for (const slot of COCINA_CONFIG.INTERNAL_POT_SLOTS) {
      this.debugGraphics.strokeCircle(slot.x, slot.y, 28)
    }
  }

  destroy(): void {
    this.graphics.destroy()
    this.debugGraphics.destroy()
    this.fire.destroy()
  }

  private draw(): void {
    const { x, y } = COCINA_CONFIG.POT_POSITION
    this.graphics.clear()
    this.graphics.fillStyle(COCINA_CONFIG.COLORS.background, 1)
    this.graphics.fillRect(0, 0, 1280, 720)
    this.graphics.fillStyle(COCINA_CONFIG.COLORS.table, 1)
    this.graphics.fillRect(0, 492, 1280, 228)
    this.graphics.fillStyle(0x2f1f16, 0.95)
    this.graphics.fillRoundedRect(x - 190, y + 102, 380, 54, 18)

    this.graphics.fillStyle(COCINA_CONFIG.COLORS.pot, 1)
    this.graphics.fillRoundedRect(x - COCINA_CONFIG.POT_WIDTH / 2, y - 66, COCINA_CONFIG.POT_WIDTH, COCINA_CONFIG.POT_HEIGHT, 34)
    this.graphics.lineStyle(5, COCINA_CONFIG.COLORS.potStroke, 0.85)
    this.graphics.strokeRoundedRect(x - COCINA_CONFIG.POT_WIDTH / 2, y - 66, COCINA_CONFIG.POT_WIDTH, COCINA_CONFIG.POT_HEIGHT, 34)
    this.graphics.fillStyle(0x3b2052, 1)
    this.graphics.fillEllipse(x, y - 62, COCINA_CONFIG.POT_WIDTH + 18, 62)
    this.graphics.lineStyle(4, 0xf5d0fe, 0.65)
    this.graphics.strokeEllipse(x, y - 62, COCINA_CONFIG.POT_WIDTH + 18, 62)
  }
}
