import { LAYERS } from '../../../config/layers'
import { COCINA_ASSETS } from '../../../config/assets'
import Phaser from 'phaser'
import { COCINA_CONFIG } from '../config/cocinaConfig'
import type { CocinaPoint } from '../types/CocinaTypes'

export default class CookingPot {
  private readonly graphics: Phaser.GameObjects.Graphics
  private readonly debugGraphics: Phaser.GameObjects.Graphics
  private readonly fire: Phaser.GameObjects.Triangle
  private readonly dropArea: Phaser.Geom.Rectangle
  private readonly art: Phaser.GameObjects.Image[] = []

  constructor(private readonly scene: Phaser.Scene) {
    scene.add.rectangle(640, 360, 1280, 720, COCINA_CONFIG.COLORS.background).setDepth(LAYERS.background)
    scene.add.rectangle(640, 606, 1280, 228, COCINA_CONFIG.COLORS.table).setDepth(LAYERS.scenery)
    scene.add.rectangle(640, 489, 380, 54, 0x2f1f16).setDepth(50)
    this.graphics = scene.add.graphics().setDepth(60)
    this.debugGraphics = scene.add.graphics().setDepth(920)
    this.dropArea = new Phaser.Geom.Rectangle(
      COCINA_CONFIG.POT_DROP_AREA.x,
      COCINA_CONFIG.POT_DROP_AREA.y,
      COCINA_CONFIG.POT_DROP_AREA.width,
      COCINA_CONFIG.POT_DROP_AREA.height,
    )
    this.fire = scene.add.triangle(COCINA_CONFIG.POT_POSITION.x, COCINA_CONFIG.POT_POSITION.y + 126, 0, 58, 34, 0, 68, 58, COCINA_CONFIG.COLORS.fireHigh, 0.95).setDepth(55).setVisible(false)
    for (const [asset, depth] of [[COCINA_ASSETS.ollaAtras, 60], [COCINA_ASSETS.caldo, 61], [COCINA_ASSETS.ollaFrente, 499]] as const) {
      this.art.push(scene.add.image(640, 350, asset.key).setDisplaySize(384, 384).setDepth(depth))
    }
  }

  containsDropPoint(x: number, y: number): boolean {
    return Phaser.Geom.Rectangle.Contains(this.dropArea, x, y)
  }

  getSlotPosition(index: number): CocinaPoint {
    return COCINA_CONFIG.INTERNAL_POT_SLOTS[index % COCINA_CONFIG.INTERNAL_POT_SLOTS.length]
  }

  updateFire(fireLevel: number): void {
    this.fire.setVisible(fireLevel > 0)
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
    for (const image of this.art) image.destroy()
    this.graphics.destroy()
    this.debugGraphics.destroy()
    this.fire.destroy()
  }

}
