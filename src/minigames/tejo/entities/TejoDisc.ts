import Phaser from 'phaser'
import { TEJO_CONFIG } from '../config/tejoConfig'
import type { TejoPoint } from '../types/TejoTypes'

export default class TejoDisc {
  private readonly container: Phaser.GameObjects.Container
  private readonly body: Phaser.GameObjects.Arc
  private readonly touchArea: Phaser.GameObjects.Arc

  constructor(private readonly scene: Phaser.Scene) {
    this.touchArea = scene.add.circle(0, 0, TEJO_CONFIG.DISC_VISUAL_RADIUS + TEJO_CONFIG.TOUCH_PADDING, TEJO_CONFIG.COLORS.touchArea, 0)
    this.touchArea.setStrokeStyle(2, TEJO_CONFIG.COLORS.touchArea, 0)

    this.body = scene.add.circle(0, 0, TEJO_CONFIG.DISC_VISUAL_RADIUS, TEJO_CONFIG.COLORS.disc, 1)
    this.body.setStrokeStyle(4, TEJO_CONFIG.COLORS.discStroke, 0.85)

    const shine = scene.add.circle(-10, -10, 7, 0xffffff, 0.42)
    const groove = scene.add.circle(0, 0, 20, 0x000000, 0)
    groove.setStrokeStyle(2, 0x6b7280, 0.65)

    this.container = scene.add.container(TEJO_CONFIG.THROW_START_X, TEJO_CONFIG.THROW_START_Y, [this.touchArea, this.body, shine, groove])
    this.container.setDepth(700)
  }

  reset(): void {
    this.container.setPosition(TEJO_CONFIG.THROW_START_X, TEJO_CONFIG.THROW_START_Y)
    this.container.setScale(TEJO_CONFIG.START_SCALE)
    this.container.setAlpha(1)
    this.container.setRotation(0)
    this.setHighlighted(false)
  }

  setPosition(point: TejoPoint): void {
    this.container.setPosition(point.x, point.y)
    this.container.setDepth(Math.round(point.y) + 300)
  }

  setScale(scale: number): void {
    this.container.setScale(scale)
  }

  setRotation(rotation: number): void {
    this.container.setRotation(rotation)
  }

  setHighlighted(highlighted: boolean): void {
    this.body.setStrokeStyle(highlighted ? 6 : 4, highlighted ? 0xfbbf24 : TEJO_CONFIG.COLORS.discStroke, highlighted ? 1 : 0.85)
  }

  setTouchAreaVisible(visible: boolean): void {
    this.touchArea.setFillStyle(TEJO_CONFIG.COLORS.touchArea, visible ? 0.12 : 0)
    this.touchArea.setStrokeStyle(2, TEJO_CONFIG.COLORS.touchArea, visible ? 0.9 : 0)
  }

  contains(x: number, y: number): boolean {
    const radius = (TEJO_CONFIG.DISC_VISUAL_RADIUS + TEJO_CONFIG.TOUCH_PADDING) * this.container.scaleX
    return Phaser.Math.Distance.Between(this.container.x, this.container.y, x, y) <= radius
  }

  getPosition(): TejoPoint {
    return {
      x: this.container.x,
      y: this.container.y,
    }
  }

  destroy(): void {
    this.container.destroy(true)
  }
}
