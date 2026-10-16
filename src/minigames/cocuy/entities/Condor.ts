import { SCENE_ASSETS } from '../../../config/sceneAssets'
import Phaser from 'phaser'
import { COCUY_CONFIG } from '../config/cocuyConfig'
import type { CocuyRect } from '../types/CocuyTypes'

export default class Condor {
  private readonly container: Phaser.GameObjects.Container
  private readonly hitboxGuide: Phaser.GameObjects.Rectangle
  private readonly body: Phaser.GameObjects.Sprite
  private bobTime = 0

  constructor(private readonly scene: Phaser.Scene) {
    this.body = scene.add.sprite(0, 0, SCENE_ASSETS.condorFlight1.key).setDisplaySize(150, 150).play('condor-flight')
    this.hitboxGuide = scene.add.rectangle(0, 0, COCUY_CONFIG.CONDOR_HITBOX_WIDTH, COCUY_CONFIG.CONDOR_HITBOX_HEIGHT, COCUY_CONFIG.COLORS.hitbox, 0)
    this.hitboxGuide.setStrokeStyle(2, COCUY_CONFIG.COLORS.hitbox, 0)

    this.container = scene.add.container(640, COCUY_CONFIG.PLAYER_Y, [this.body, this.hitboxGuide]).setDepth(700)
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
