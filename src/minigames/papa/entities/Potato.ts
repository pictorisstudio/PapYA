import Phaser from 'phaser'
import { POTATO_ASSETS } from '../../../config/assets'
import { PAPA_CONFIG } from '../config/papaConfig'
import type { PotatoSpawnOptions, PotatoState, PotatoType } from '../types/PapaTypes'

export default class Potato {
  readonly id: string
  readonly type: PotatoType
  private readonly container: Phaser.GameObjects.Container
  private readonly sprite: Phaser.GameObjects.Image
  private readonly hitbox: Phaser.GameObjects.Arc
  private velocityX: number
  private velocityY: number
  private rotationSpeed: number
  private state: PotatoState = 'ACTIVE'

  constructor(private readonly scene: Phaser.Scene, options: PotatoSpawnOptions) {
    this.id = options.id
    this.type = options.type
    this.velocityX = options.velocityX
    this.velocityY = options.velocityY
    this.rotationSpeed = options.rotationSpeed

    const variants = POTATO_ASSETS[options.type]
    const asset = variants[Phaser.Math.Between(0, variants.length - 1)]
    this.sprite = scene.add.image(0, 0, asset.key)
      .setDisplaySize(PAPA_CONFIG.POTATO_VISUAL_WIDTH, PAPA_CONFIG.POTATO_VISUAL_HEIGHT)
    this.hitbox = scene.add.circle(0, 0, PAPA_CONFIG.POTATO_TOUCH_RADIUS, PAPA_CONFIG.COLORS.hitbox, 0)
    this.hitbox.setStrokeStyle(2, PAPA_CONFIG.COLORS.hitbox, 0.9)

    this.container = scene.add.container(options.x, options.y, [this.sprite, this.hitbox])
    this.container.setScale(options.scale)
    this.container.setDepth(options.y)
    this.setHitboxVisible(false)
  }

  update(delta: number): void {
    if (this.state !== 'ACTIVE') {
      return
    }

    const seconds = delta / 1000
    this.velocityY += PAPA_CONFIG.GRAVITY_Y * seconds
    this.container.x += this.velocityX * seconds
    this.container.y += this.velocityY * seconds
    this.sprite.rotation += this.rotationSpeed * seconds
    this.container.setDepth(Math.round(this.container.y))

    if (this.container.y >= PAPA_CONFIG.POTATO_MISS_Y || this.container.x < -80 || this.container.x > 1360) {
      this.state = 'MISSED'
    }
  }

  contains(x: number, y: number): boolean {
    if (this.state !== 'ACTIVE') {
      return false
    }

    const radius = PAPA_CONFIG.POTATO_TOUCH_RADIUS * this.container.scaleX
    return this.getDistanceSqTo(x, y) <= radius * radius
  }

  hit(): void {
    if (this.state !== 'ACTIVE') {
      return
    }

    this.state = 'HIT'
    this.scene.tweens.add({
      targets: this.container,
      scaleX: this.container.scaleX * 1.28,
      scaleY: this.container.scaleY * 1.28,
      alpha: 0,
      duration: 160,
      ease: 'Back.easeOut',
      onComplete: () => this.destroy(),
    })
  }

  setHitboxVisible(visible: boolean): void {
    this.hitbox.setFillStyle(PAPA_CONFIG.COLORS.hitbox, visible ? 0.12 : 0)
    this.hitbox.setStrokeStyle(2, PAPA_CONFIG.COLORS.hitbox, visible ? 0.9 : 0)
  }

  isActive(): boolean {
    return this.state === 'ACTIVE'
  }

  isInactive(): boolean {
    return this.state === 'MISSED' || this.state === 'DESTROYED'
  }

  destroy(): void {
    if (this.state === 'DESTROYED') {
      return
    }

    this.state = 'DESTROYED'
    this.container.destroy(true)
  }

  get x(): number {
    return this.container.x
  }

  get y(): number {
    return this.container.y
  }

  get depth(): number {
    return this.container.depth
  }

  getDistanceSqTo(x: number, y: number): number {
    return Phaser.Math.Distance.Squared(this.container.x, this.container.y, x, y)
  }

  get velocityLabel(): string {
    return `${Math.round(this.velocityX)}, ${Math.round(this.velocityY)}`
  }
}
