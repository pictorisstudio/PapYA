import Phaser from 'phaser'
import { COCUY_CONFIG } from '../config/cocuyConfig'
import type { CocuyRect } from '../types/CocuyTypes'

export default class Condor {
  private readonly container: Phaser.GameObjects.Container
  private readonly hitboxGuide: Phaser.GameObjects.Rectangle
  private readonly body: Phaser.GameObjects.Ellipse
  private bobTime = 0

  constructor(private readonly scene: Phaser.Scene) {
    const leftWing = scene.add.triangle(-28, 0, 0, 8, -66, -16, -18, 26, COCUY_CONFIG.COLORS.condorWing, 1)
    const rightWing = scene.add.triangle(28, 0, 0, 8, 66, -16, 18, 26, COCUY_CONFIG.COLORS.condorWing, 1)
    this.body = scene.add.ellipse(0, 0, 32, 46, COCUY_CONFIG.COLORS.condor, 1).setStrokeStyle(3, 0xf8fafc, 0.8)
    const head = scene.add.circle(0, -28, 10, 0xf8fafc, 1)
    const beak = scene.add.triangle(0, -30, -5, 0, 5, 0, 0, -12, 0xfbbf24, 1).setRotation(Math.PI)
    this.hitboxGuide = scene.add.rectangle(0, 0, COCUY_CONFIG.CONDOR_HITBOX_WIDTH, COCUY_CONFIG.CONDOR_HITBOX_HEIGHT, COCUY_CONFIG.COLORS.hitbox, 0)
    this.hitboxGuide.setStrokeStyle(2, COCUY_CONFIG.COLORS.hitbox, 0)

    this.container = scene.add.container(640, COCUY_CONFIG.PLAYER_Y, [leftWing, rightWing, this.body, head, beak, this.hitboxGuide]).setDepth(700)
  }

  update(delta: number): void {
    this.bobTime += delta / 1000
    this.container.y = COCUY_CONFIG.PLAYER_Y + Math.sin(this.bobTime * 5.2) * 5
  }

  setX(x: number): void {
    this.container.x = x
  }

  flashHit(): void {
    this.scene.tweens.add({
      targets: this.body,
      alpha: { from: 0.35, to: 1 },
      duration: 260,
      ease: 'Sine.easeOut',
    })
  }

  setHitboxVisible(visible: boolean): void {
    this.hitboxGuide.setFillStyle(COCUY_CONFIG.COLORS.hitbox, visible ? 0.12 : 0)
    this.hitboxGuide.setStrokeStyle(2, COCUY_CONFIG.COLORS.hitbox, visible ? 0.9 : 0)
  }

  getHitbox(): CocuyRect {
    return {
      x: this.container.x - COCUY_CONFIG.CONDOR_HITBOX_WIDTH / 2,
      y: COCUY_CONFIG.PLAYER_Y - COCUY_CONFIG.CONDOR_HITBOX_HEIGHT / 2,
      width: COCUY_CONFIG.CONDOR_HITBOX_WIDTH,
      height: COCUY_CONFIG.CONDOR_HITBOX_HEIGHT,
    }
  }

  destroy(): void {
    this.container.destroy(true)
  }
}
