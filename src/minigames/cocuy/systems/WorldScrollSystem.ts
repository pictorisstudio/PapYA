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
    this.scenery.push(scene.add.image(640, 420, SCENE_ASSETS.summit.key).setDisplaySize(1280, 1280).setDepth(LAYERS.background + 1))
    // Vegetación del terreno inferior: queda atrás al ascender, no tapa al cóndor.
    this.scenery.push(scene.add.image(110, 650, SCENE_ASSETS.frailejones.key).setDisplaySize(180, 180).setDepth(LAYERS.background + 2))
    this.scenery.push(scene.add.image(1170, 670, SCENE_ASSETS.frailejon.key).setDisplaySize(140, 140).setDepth(LAYERS.background + 2))
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

      if (cloud.y - cloud.displayHeight / 2 > 720) {
        cloud.y = -cloud.displayHeight / 2
      }
    }

    this.scenery[0]!.y = 420 + this.scroll * 0.12
    this.scenery[1]!.y = 650 + this.scroll * 0.35
    this.scenery[2]!.y = 670 + this.scroll * 0.35
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
      { x: 168, y: 96, width: 150, height: 50 },
      { x: 1020, y: 182, width: 190, height: 58 },
      { x: 330, y: 390, width: 130, height: 44 },
      { x: 1128, y: 548, width: 160, height: 52 },
    ]) {
      this.clouds.push(this.scene.add.image(cloud.x, cloud.y, SCENE_ASSETS.clouds.key).setDisplaySize(cloud.width, cloud.height).setAlpha(0.45).setDepth(LAYERS.scenery))
    }
  }

  private draw(): void {
    this.graphics.clear()
    this.graphics.fillGradientStyle(COCUY_CONFIG.COLORS.skyTop, COCUY_CONFIG.COLORS.skyTop, COCUY_CONFIG.COLORS.skyBottom, COCUY_CONFIG.COLORS.skyBottom, 1)
    this.graphics.fillRect(0, 0, 1280, 720)



  }

}
