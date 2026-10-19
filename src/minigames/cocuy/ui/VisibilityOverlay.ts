import Phaser from 'phaser'
import { COCUY_CONFIG } from '../config/cocuyConfig'

export default class VisibilityOverlay {
  private readonly overlay: Phaser.GameObjects.Rectangle
  private activeUntilMs = 0

  constructor(private readonly scene: Phaser.Scene) {
    this.overlay = scene.add.rectangle(360, 640, 720, 1280, 0xe0f2fe, 0).setDepth(860)
  }

  activate(currentTimeMs: number): void {
    this.activeUntilMs = currentTimeMs + COCUY_CONFIG.CLOUD_VISIBILITY_DURATION_MS
    this.overlay.setAlpha(COCUY_CONFIG.CLOUD_OVERLAY_ALPHA)
  }

  update(currentTimeMs: number): void {
    if (currentTimeMs >= this.activeUntilMs) {
      this.overlay.setAlpha(0)
    }
  }

  isActive(currentTimeMs: number): boolean {
    return currentTimeMs < this.activeUntilMs
  }

  destroy(): void {
    this.overlay.destroy()
  }
}
