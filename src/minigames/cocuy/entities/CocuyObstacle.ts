import { SCENE_ASSETS } from '../../../config/sceneAssets'
import Phaser from 'phaser'
import { COCUY_CONFIG } from '../config/cocuyConfig'
import type { CocuyRect, ObstacleSpawnOptions, ObstacleState, ObstacleType } from '../types/CocuyTypes'

export default class CocuyObstacle {
  readonly id: string
  readonly type: ObstacleType
  readonly windDirection: -1 | 1
  private readonly container: Phaser.GameObjects.Container
  private readonly hitboxGuide: Phaser.GameObjects.Rectangle
  private readonly radius: number
  private readonly speed: number
  private state: ObstacleState = 'ACTIVE'

  constructor(scene: Phaser.Scene, options: ObstacleSpawnOptions) {
    this.id = options.id
    this.type = options.type
    this.speed = options.speed
    this.radius = options.radius ?? COCUY_CONFIG.ROCK_VISUAL_RADIUS_MIN
    this.windDirection = options.windDirection ?? 1

    const visuals = this.createVisuals(scene)
    const hitbox = this.getLocalHitboxSize()
    this.hitboxGuide = scene.add.rectangle(0, 0, hitbox.width, hitbox.height, COCUY_CONFIG.COLORS.hitbox, 0)
    this.hitboxGuide.setStrokeStyle(2, COCUY_CONFIG.COLORS.hitbox, 0)
    this.container = scene.add.container(options.x, options.y, [...visuals, this.hitboxGuide]).setDepth(520)
  }

  update(delta: number, worldSpeed: number): void {
    if (this.state === 'DESTROYED') {
      return
    }

    this.container.y += (this.speed + worldSpeed) * (delta / 1000)
    this.container.setDepth(Math.round(this.container.y))

    if (this.container.y > 1400) {
      this.state = 'DESTROYED'
    }
  }

  trigger(): void {
    if (this.state !== 'ACTIVE') {
      return
    }

    this.state = 'TRIGGERED'
    this.container.setAlpha(0.42)
  }

  setHitboxVisible(visible: boolean): void {
    this.hitboxGuide.setFillStyle(COCUY_CONFIG.COLORS.hitbox, visible ? 0.1 : 0)
    this.hitboxGuide.setStrokeStyle(2, COCUY_CONFIG.COLORS.hitbox, visible ? 0.86 : 0)
  }

  isActive(): boolean {
    return this.state === 'ACTIVE'
  }

  isDestroyed(): boolean {
    return this.state === 'DESTROYED'
  }

  getHitbox(): CocuyRect {
    const size = this.getLocalHitboxSize()
    return {
      x: this.container.x - size.width / 2,
      y: this.container.y - size.height / 2,
      width: size.width,
      height: size.height,
    }
  }

  destroy(): void {
    this.state = 'DESTROYED'
    this.container.destroy(true)
  }

  private createVisuals(scene: Phaser.Scene): Phaser.GameObjects.GameObject[] {
    if (this.type === 'ROCK') {
      return [scene.add.image(0, 0, SCENE_ASSETS.rock.key).setDisplaySize(this.radius * 2, this.radius * 2)]
    }
    if (this.type === 'CLOUD') {
      return [scene.add.image(0, 0, SCENE_ASSETS.cloud.key).setDisplaySize(COCUY_CONFIG.CLOUD_WIDTH, COCUY_CONFIG.CLOUD_HEIGHT).setAlpha(0.8)]
    }
    const arrowColor = this.windDirection > 0 ? 0x93c5fd : COCUY_CONFIG.COLORS.wind
    return [
      scene.add.rectangle(0, 0, COCUY_CONFIG.WIND_WIDTH, COCUY_CONFIG.WIND_HEIGHT, COCUY_CONFIG.COLORS.wind, 0.16),
      scene.add.line(0, 0, -82, -22, 82, -22, arrowColor, 0.82).setLineWidth(5),
      scene.add.line(0, 0, -70, 2, 70, 2, arrowColor, 0.72).setLineWidth(4),
      scene.add.triangle(this.windDirection > 0 ? 88 : -88, -22, 0, 0, 22 * this.windDirection, 10, 22 * this.windDirection, -10, arrowColor, 0.86),
    ]
  }

  private getLocalHitboxSize(): { width: number; height: number } {
    if (this.type === 'ROCK') {
      const diameter = this.radius * 2 * COCUY_CONFIG.ROCK_HITBOX_SCALE
      return { width: diameter, height: diameter }
    }

    if (this.type === 'CLOUD') {
      return { width: COCUY_CONFIG.CLOUD_WIDTH * 0.72, height: COCUY_CONFIG.CLOUD_HEIGHT * 0.72 }
    }

    return { width: COCUY_CONFIG.WIND_WIDTH * 0.86, height: COCUY_CONFIG.WIND_HEIGHT * 0.72 }
  }
}
