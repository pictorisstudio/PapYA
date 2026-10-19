import { LAYERS } from '../../../config/layers'
import { COCINA_ASSETS } from '../../../config/assets'
import Phaser from 'phaser'
import { COCINA_CONFIG } from '../config/cocinaConfig'
import type { CocinaPoint } from '../types/CocinaTypes'

export default class CookingPot {
  private readonly graphics: Phaser.GameObjects.Graphics
  private readonly debugGraphics: Phaser.GameObjects.Graphics
  private readonly fire: Phaser.GameObjects.Sprite
  private readonly dropArea: Phaser.Geom.Rectangle
  private readonly art: Phaser.GameObjects.Image[] = []

  constructor(private readonly scene: Phaser.Scene) {
    scene.add.image(640, 360, COCINA_ASSETS.pared.key).setDisplaySize(1280, 720).setDepth(LAYERS.background)
    scene.add.image(640, 360, COCINA_ASSETS.mesa.key).setDisplaySize(1280, 720).setDepth(LAYERS.scenery)
    scene.add.image(640, 465, COCINA_ASSETS.hornilla.key).setDisplaySize(340, 204).setDepth(50)
    this.graphics = scene.add.graphics().setDepth(60)
    this.debugGraphics = scene.add.graphics().setDepth(920)
    this.dropArea = new Phaser.Geom.Rectangle(
      COCINA_CONFIG.POT_DROP_AREA.x,
      COCINA_CONFIG.POT_DROP_AREA.y,
      COCINA_CONFIG.POT_DROP_AREA.width,
      COCINA_CONFIG.POT_DROP_AREA.height,
    )
    this.fire = scene.add.sprite(640, 467, COCINA_ASSETS.fuego1.key).setOrigin(0.5, 0.75).play('cocina-fire').setDepth(510).setVisible(false)
    const { x, y } = COCINA_CONFIG.POT_POSITION
    // El PNG del frente contiene también el borde trasero y las asas.
    // Dibujarlo completo detrás de la comida y repetir solo su parte delantera encima.
    for (const [asset, depth] of [[COCINA_ASSETS.ollaAtras, 60], [COCINA_ASSETS.ollaFrente, 61], [COCINA_ASSETS.caldo, 62]] as const) {
      this.art.push(scene.add.image(x, y, asset.key).setDisplaySize(430, 430).setDepth(depth))
    }
    this.art.push(scene.add.image(x, y, COCINA_ASSETS.ollaFrente.key)
      .setDisplaySize(430, 430).setCrop(0, 25, 64, 39).setDepth(499))
  }

  containsDropPoint(x: number, y: number): boolean {
    return Phaser.Geom.Rectangle.Contains(this.dropArea, x, y)
  }

  getSlotPosition(index: number): CocinaPoint {
    return COCINA_CONFIG.INTERNAL_POT_SLOTS[index % COCINA_CONFIG.INTERNAL_POT_SLOTS.length]
  }

  updateFire(fireLevel: number): void {
    this.fire.setVisible(fireLevel > 0)
    const scale = Phaser.Math.Linear(2.6, 3.8, fireLevel)
    this.fire.setScale(scale, scale)

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
