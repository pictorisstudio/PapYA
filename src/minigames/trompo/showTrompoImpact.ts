import type Phaser from 'phaser'
import { gameManager } from '../../core/GameManager'

export function showTrompoImpact(scene: Phaser.Scene, x: number, y: number): void {
  const spark = scene.add.circle(x, y, 22, 0xffedb0, 0.8)
    .setStrokeStyle(5, 0xffffff).setDepth(1100)
  scene.tweens.add({ targets: spark, scale: 2, alpha: 0, duration: 180, onComplete: () => spark.destroy() })
  gameManager.audioManager.playEffect(scene, 'cocuyCollision')
}
