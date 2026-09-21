import Phaser from 'phaser'
import { COCUY_CONFIG } from '../config/cocuyConfig'

export default class WorldScrollSystem {
  private readonly graphics: Phaser.GameObjects.Graphics
  private readonly clouds: Phaser.GameObjects.Ellipse[] = []
  private speed: number = COCUY_CONFIG.WORLD_SCROLL_SPEED_START
  private scroll = 0

  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(10)
    this.createClouds()
  }

  update(elapsedMs: number, delta: number): void {
    const progress = Phaser.Math.Clamp(elapsedMs / COCUY_CONFIG.GAME_DURATION_MS, 0, 1)
    this.speed = Phaser.Math.Linear(COCUY_CONFIG.WORLD_SCROLL_SPEED_START, COCUY_CONFIG.WORLD_SCROLL_SPEED_END, Phaser.Math.SmoothStep(progress, 0, 1))
    this.scroll = (this.scroll + this.speed * (delta / 1000)) % 220

    for (const cloud of this.clouds) {
      cloud.y += this.speed * 0.22 * (delta / 1000)

      if (cloud.y > 780) {
        cloud.y = -80
      }
    }

    this.draw()
  }

  getSpeed(): number {
    return this.speed
  }

  destroy(): void {
    this.graphics.destroy()

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
      this.clouds.push(this.scene.add.ellipse(cloud.x, cloud.y, cloud.width, cloud.height, COCUY_CONFIG.COLORS.cloud, 0.24).setDepth(20))
    }
  }

  private draw(): void {
    this.graphics.clear()
    this.graphics.fillGradientStyle(COCUY_CONFIG.COLORS.skyTop, COCUY_CONFIG.COLORS.skyTop, COCUY_CONFIG.COLORS.skyBottom, COCUY_CONFIG.COLORS.skyBottom, 1)
    this.graphics.fillRect(0, 0, 1280, 720)

    this.drawMountainLayer(0, 520 + this.scroll * 0.18, COCUY_CONFIG.COLORS.mountainFar, 0.72)
    this.drawMountainLayer(80, 610 + this.scroll * 0.3, COCUY_CONFIG.COLORS.mountainNear, 0.92)
  }

  private drawMountainLayer(offsetX: number, baseY: number, color: number, alpha: number): void {
    this.graphics.fillStyle(color, alpha)

    for (let index = -1; index < 5; index += 1) {
      const x = offsetX + index * 330
      this.graphics.fillTriangle(x, baseY, x + 166, baseY - 230, x + 332, baseY)
      this.graphics.fillStyle(COCUY_CONFIG.COLORS.snow, alpha * 0.9)
      this.graphics.fillTriangle(x + 126, baseY - 176, x + 166, baseY - 230, x + 210, baseY - 174)
      this.graphics.fillStyle(color, alpha)
    }
  }
}
