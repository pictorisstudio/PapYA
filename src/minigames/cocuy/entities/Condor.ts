import { SCENE_ASSETS } from '../../../config/sceneAssets'
import Phaser from 'phaser'
import { COCUY_CONFIG } from '../config/cocuyConfig'
import type { CocuyRect } from '../types/CocuyTypes'

export default class Condor {
  private readonly container: Phaser.GameObjects.Container
  private readonly hitboxGuide: Phaser.GameObjects.Rectangle
  private readonly body: Phaser.GameObjects.Sprite
  private bobTime = 0
  private hitRemainingMs = 0
  private drop = 0

  constructor(private readonly scene: Phaser.Scene) {
    this.body = scene.add.sprite(0, 0, SCENE_ASSETS.condorFlight1.key).setDisplaySize(210, 210).play('condor-flight')
    this.hitboxGuide = scene.add.rectangle(0, 0, COCUY_CONFIG.CONDOR_HITBOX_WIDTH, COCUY_CONFIG.CONDOR_HITBOX_HEIGHT, COCUY_CONFIG.COLORS.hitbox, 0)
    this.hitboxGuide.setStrokeStyle(2, COCUY_CONFIG.COLORS.hitbox, 0)

    this.container = scene.add.container(640, COCUY_CONFIG.PLAYER_Y, [this.body, this.hitboxGuide]).setDepth(700)
  }

  update(delta: number, velocity = 0, wind = 0): void {
    this.bobTime += delta / 1000
    this.drop *= Math.exp(-6 * delta / 1000)
    this.container.y = COCUY_CONFIG.PLAYER_Y + Math.sin(this.bobTime * 5.2) * 5 + this.drop
    this.body.rotation = Phaser.Math.Linear(this.body.rotation, Phaser.Math.Clamp((velocity + wind) / 1800, -0.28, 0.28), Math.min(1, delta / 100))
    this.hitRemainingMs = Math.max(0, this.hitRemainingMs - delta)
    this.body.setAlpha(this.hitRemainingMs > 0 && Math.floor(this.hitRemainingMs / 90) % 2 === 0 ? 0.35 : 1)
    if (this.hitRemainingMs > 600) this.body.setTint(0xffb3a7)
    else this.body.clearTint()
  }

  setX(x: number): void {
    this.container.x = x
  }

  flashHit(): void {
    this.hitRemainingMs = COCUY_CONFIG.ROCK_PROTECTION_MS
    this.drop = COCUY_CONFIG.ROCK_VISUAL_DROP
    this.body.setTint(0xffb3a7)
    this.container.y = COCUY_CONFIG.PLAYER_Y + this.drop
  }

  setHitboxVisible(visible: boolean): void {
    this.hitboxGuide.setFillStyle(COCUY_CONFIG.COLORS.hitbox, visible ? 0.12 : 0)
    this.hitboxGuide.setStrokeStyle(2, COCUY_CONFIG.COLORS.hitbox, visible ? 0.9 : 0)
  }

  getHitbox(): CocuyRect {
    return {
      x: this.container.x - COCUY_CONFIG.CONDOR_HITBOX_WIDTH / 2,
      y: this.container.y - COCUY_CONFIG.CONDOR_HITBOX_HEIGHT / 2,
      width: COCUY_CONFIG.CONDOR_HITBOX_WIDTH,
      height: COCUY_CONFIG.CONDOR_HITBOX_HEIGHT,
    }
  }

  destroy(): void {
    this.container.destroy(true)
  }
}
