import { SCENE_ASSETS } from '../../../config/sceneAssets'
import { LAYERS } from '../../../config/layers'
import Phaser from 'phaser'
import { COCUY_CONFIG } from '../config/cocuyConfig'

export default class WorldScrollSystem {
  private readonly graphics: Phaser.GameObjects.Graphics
  private readonly clouds: Phaser.GameObjects.Image[] = []
  private readonly scenery: Phaser.GameObjects.Image[] = []
  private speed: number = COCUY_CONFIG.WORLD_SCROLL_SPEED_START
  private scroll = 0

  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(LAYERS.background)
    this.scenery.push(scene.add.image(360, 747, SCENE_ASSETS.summit.key).setCrop(1, 1, 62, 62).setDisplaySize(1280, 1280).setDepth(LAYERS.background + 1))
    // Vegetación del terreno inferior: queda atrás al ascender, no tapa al cóndor.
    this.scenery.push(scene.add.image(61.88, 1155.56, SCENE_ASSETS.frailejones.key).setDisplaySize(180, 180).setDepth(LAYERS.background + 2))
    this.scenery.push(scene.add.image(658.13, 1191.11, SCENE_ASSETS.frailejon.key).setDisplaySize(140, 140).setDepth(LAYERS.background + 2))
    this.createClouds()
    this.draw()
  }

  update(elapsedMs: number, delta: number): void {
    const progress = Phaser.Math.Clamp(elapsedMs / COCUY_CONFIG.GAME_DURATION_MS, 0, 1)
    this.speed = Phaser.Math.Linear(COCUY_CONFIG.WORLD_SCROLL_SPEED_START, COCUY_CONFIG.WORLD_SCROLL_SPEED_END, Phaser.Math.SmoothStep(progress, 0, 1))
    // Distancia acumulada, sin reiniciar la montaña cada 220 píxeles.
    this.scroll += this.speed * (delta / 1000)

    for (const cloud of this.clouds) {
      cloud.y += this.speed * 0.22 * (delta / 1000)

      if (cloud.y - cloud.displayHeight / 2 > 1280) {
        cloud.y = -cloud.displayHeight / 2
      }
    }

    // Evitar muestrear el borde del PNG mientras cruza posiciones subpíxel.
    this.scenery[0]!.y = Math.round(747 + this.scroll * 0.12)
    this.scenery[1]!.y = 1155.56 + this.scroll * 0.35
    this.scenery[2]!.y = 1191.11 + this.scroll * 0.35
  }

  getSpeed(): number {
    return this.speed
  }

  destroy(): void {
    this.graphics.destroy()
    for (const image of this.scenery) image.destroy()

    for (const cloud of this.clouds) {
      cloud.destroy()
    }
  }

  private createClouds(): void {
    for (const cloud of [
      { x: 94.5, y: 170.67, width: 150, height: 50 },
      { x: 573.75, y: 323.56, width: 190, height: 58 },
      { x: 185.63, y: 693.33, width: 130, height: 44 },
      { x: 634.5, y: 974.22, width: 160, height: 52 },
    ]) {
      this.clouds.push(this.scene.add.image(cloud.x, cloud.y, SCENE_ASSETS.clouds.key).setDisplaySize(cloud.width, cloud.height).setAlpha(0.45).setDepth(LAYERS.scenery))
    }
  }

  private draw(): void {
    this.graphics.clear()
    this.graphics.fillGradientStyle(COCUY_CONFIG.COLORS.skyTop, COCUY_CONFIG.COLORS.skyTop, COCUY_CONFIG.COLORS.skyBottom, COCUY_CONFIG.COLORS.skyBottom, 1)
    this.graphics.fillRect(0, 0, 720, 1280)



  }

}
