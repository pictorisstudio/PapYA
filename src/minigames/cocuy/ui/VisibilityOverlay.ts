import Phaser from 'phaser'
import { COCUY_CONFIG } from '../config/cocuyConfig'
import { SCENE_ASSETS } from '../../../config/sceneAssets'

export default class VisibilityOverlay {
  private readonly overlay: Phaser.GameObjects.Rectangle
  private activeUntilMs = 0
  private startedAtMs = 0
  private timeScale = 1
  private readonly clouds: Phaser.GameObjects.Image[]

  constructor(private readonly scene: Phaser.Scene) {
    // Keep the fill opaque: object alpha alone cannot reveal a transparent fill.
    this.overlay = scene.add.rectangle(640, 360, 1280, 720, 0xe0f2fe, 1).setAlpha(0).setDepth(860)
    this.clouds = Array.from({ length: 9 }, () =>
      scene.add.image(640, 360, SCENE_ASSETS.cloud.key).setAlpha(0).setDepth(861))
  }

  activate(currentTimeMs: number, pace = 1): void {
    this.timeScale = Math.max(1, pace)
    this.startedAtMs = currentTimeMs
    this.activeUntilMs = currentTimeMs + COCUY_CONFIG.CLOUD_VISIBILITY_DURATION_MS * this.timeScale
    this.update(currentTimeMs)
  }

  update(currentTimeMs: number): void {
    const elapsed = (currentTimeMs - this.startedAtMs) / this.timeScale
    const remaining = (this.activeUntilMs - currentTimeMs) / this.timeScale
    const strength = this.isActive(currentTimeMs)
      ? Math.min(1, 0.35 + elapsed / 180, remaining / 450) : 0
    this.overlay.setAlpha(COCUY_CONFIG.CLOUD_OVERLAY_ALPHA * strength)
    const width = this.scene.scale?.gameSize.width ?? 1280
    const height = this.scene.scale?.gameSize.height ?? 720
    this.overlay.setDisplaySize(width, height)
    this.clouds.forEach((cloud, index) => {
      const column = index % 3
      const row = Math.floor(index / 3)
      const drift = Math.sin(elapsed / 900 + index) * 28
      cloud.setPosition(640 + (column - 1) * width * 0.37 + drift,
        360 + (row - 1) * height * 0.38 + Math.cos(elapsed / 1200 + index) * 14)
        .setDisplaySize(width * 0.64, height * 0.78)
        .setAlpha(COCUY_CONFIG.CLOUD_FOG_ALPHA * strength)
    })
  }

  isActive(currentTimeMs: number): boolean {
    return currentTimeMs < this.activeUntilMs
  }

  destroy(): void {
    this.overlay.destroy()
    this.clouds.forEach(cloud => cloud.destroy())
  }
}
