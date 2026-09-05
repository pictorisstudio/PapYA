import Phaser from 'phaser'
import { PAPA_CONFIG } from '../config/papaConfig'
import type { PotatoSpawnOptions, PotatoState, PotatoType } from '../types/PapaTypes'

export default class Potato {
  readonly id: string
  readonly type: PotatoType
  private readonly container: Phaser.GameObjects.Container
  private readonly hitbox: Phaser.GameObjects.Rectangle
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

    const bodyColor = options.type === 'GOOD' ? PAPA_CONFIG.COLORS.goodPotato : PAPA_CONFIG.COLORS.badPotato
    const markColor = options.type === 'GOOD' ? PAPA_CONFIG.COLORS.goodPotatoMark : PAPA_CONFIG.COLORS.badPotatoMark

    // TODO: reemplazar posteriormente por sprites pixel art de papa buena y papa dañada.
    const body = scene.add.ellipse(0, 0, 52, 42, bodyColor, 1).setStrokeStyle(3, 0x3f2a1c, 0.65)
    const eye = scene.add.circle(-10, -6, 4, markColor, 1)
    const mark =
      options.type === 'GOOD'
        ? scene.add.circle(12, 7, 6, markColor, 0.95)
        : scene.add.rectangle(12, 4, 22, 6, markColor, 1).setRotation(0.75)

    this.hitbox = scene.add.rectangle(0, 0, 64, 56, PAPA_CONFIG.COLORS.hitbox, 0)
    this.hitbox.setStrokeStyle(2, PAPA_CONFIG.COLORS.hitbox, 0.9)

    this.container = scene.add.container(options.x, options.y, [body, eye, mark, this.hitbox])
    this.container.setScale(options.scale)
    this.container.setDepth(options.y)
    this.setHitboxVisible(false)
  }

  update(delta: number): void {
    if (this.state !== 'ACTIVE') {
      return
    }

    const seconds = delta / 1000
    this.velocityY += PAPA_CONFIG.GRAVITY * seconds
    this.container.x += this.velocityX * seconds
    this.container.y += this.velocityY * seconds
    this.container.rotation += this.rotationSpeed * seconds
    this.container.setDepth(Math.round(this.container.y))

    if (this.container.y >= PAPA_CONFIG.FIELD_BASE_Y + 32 || this.container.x < -80 || this.container.x > 1360) {
      this.state = 'MISSED'
    }
  }

  contains(x: number, y: number): boolean {
    if (this.state !== 'ACTIVE') {
      return false
    }

    const bounds = this.hitbox.getBounds()
    return bounds.contains(x, y)
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

  get velocityLabel(): string {
    return `${Math.round(this.velocityX)}, ${Math.round(this.velocityY)}`
  }
}
