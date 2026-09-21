import Phaser from 'phaser'
import { TEJO_CONFIG } from '../config/tejoConfig'
import type { TejoAimState, TejoPoint } from '../types/TejoTypes'

export default class TejoAimSystem {
  private readonly preview: Phaser.GameObjects.Graphics
  private readonly origin: TejoPoint = { x: TEJO_CONFIG.THROW_START_X, y: TEJO_CONFIG.THROW_START_Y }
  private currentAim: TejoAimState | null = null

  constructor(private readonly scene: Phaser.Scene) {
    this.preview = scene.add.graphics().setDepth(650)
  }

  update(pointerX: number, pointerY: number): TejoAimState {
    const rawDragX = pointerX - this.origin.x
    const rawDragY = pointerY - this.origin.y
    const rawDistance = Phaser.Math.Distance.Between(0, 0, rawDragX, rawDragY)
    const visualDistance = Math.min(rawDistance, TEJO_CONFIG.MAX_DRAG_DISTANCE)
    const scale = rawDistance > 0 ? visualDistance / rawDistance : 0
    const dragX = rawDragX * scale
    const dragY = rawDragY * scale
    const launch = this.calculateLaunchParameters(rawDragX, rawDragY)
    const horizontalAim = Phaser.Math.Clamp(rawDragX / TEJO_CONFIG.MAX_POWER_DRAG_DISTANCE, -1, 1)
    const targetX = Phaser.Math.Clamp(
      TEJO_CONFIG.BOARD_CENTER_X - horizontalAim * TEJO_CONFIG.HORIZONTAL_AIM_RANGE,
      TEJO_CONFIG.BOARD_CENTER_X - TEJO_CONFIG.BOARD_WIDTH / 2,
      TEJO_CONFIG.BOARD_CENTER_X + TEJO_CONFIG.BOARD_WIDTH / 2,
    )
    const targetY = Phaser.Math.Linear(TEJO_CONFIG.THROW_START_Y - 80, TEJO_CONFIG.BOARD_Y, launch.power)
    const arcHeight = Phaser.Math.Linear(TEJO_CONFIG.ARC_HEIGHT_MIN, TEJO_CONFIG.ARC_HEIGHT_MAX, launch.power)
    const durationMs = Phaser.Math.Linear(TEJO_CONFIG.FLIGHT_DURATION_MIN, TEJO_CONFIG.FLIGHT_DURATION_MAX, launch.power)

    this.currentAim = {
      dragX,
      dragY,
      dragDistance: rawDistance,
      effectiveDragDistance: launch.effectiveDragDistance,
      normalizedPower: launch.normalizedPower,
      power: launch.power,
      target: { x: targetX, y: targetY },
      arcHeight,
      durationMs,
    }

    this.drawPreview(this.currentAim)
    return this.currentAim
  }

  hasValidDrag(): boolean {
    return Boolean(
      this.currentAim &&
        this.currentAim.dragDistance >= TEJO_CONFIG.MIN_DRAG_DISTANCE &&
        this.currentAim.dragY >= TEJO_CONFIG.MIN_BACK_DRAG_Y,
    )
  }

  getCurrentAim(): TejoAimState | null {
    return this.currentAim
  }

  clear(): void {
    this.currentAim = null
    this.preview.clear()
  }

  destroy(): void {
    this.preview.destroy()
  }

  private calculateLaunchParameters(rawDragX: number, rawDragY: number): {
    effectiveDragDistance: number
    normalizedPower: number
    power: number
  } {
    const backwardDragY = Math.max(0, rawDragY)
    const effectiveDragDistance = Phaser.Math.Distance.Between(0, 0, rawDragX, backwardDragY * TEJO_CONFIG.DRAG_POWER_SENSITIVITY)
    const normalizedDrag = Phaser.Math.Clamp(effectiveDragDistance / TEJO_CONFIG.MAX_POWER_DRAG_DISTANCE, 0, 1)
    const normalizedPower = Math.pow(normalizedDrag, TEJO_CONFIG.POWER_CURVE_EXPONENT)
    const power = Phaser.Math.Linear(TEJO_CONFIG.MIN_LAUNCH_POWER, TEJO_CONFIG.MAX_LAUNCH_POWER, normalizedPower)

    return {
      effectiveDragDistance,
      normalizedPower,
      power,
    }
  }

  private drawPreview(aim: TejoAimState): void {
    this.preview.clear()
    this.preview.fillStyle(TEJO_CONFIG.COLORS.preview, 0.74)

    for (let index = 1; index <= TEJO_CONFIG.PREVIEW_DOTS; index += 1) {
      const progress = (index / (TEJO_CONFIG.PREVIEW_DOTS + 2)) * 0.78
      const point = this.getTrajectoryPoint(aim.target, aim.arcHeight * 0.72, progress)
      const radius = Phaser.Math.Linear(7, 3, progress)
      this.preview.fillCircle(point.x, point.y, radius)
    }
  }

  private getTrajectoryPoint(target: TejoPoint, arcHeight: number, progress: number): TejoPoint {
    const baseX = Phaser.Math.Linear(this.origin.x, target.x, progress)
    const baseY = Phaser.Math.Linear(this.origin.y, target.y, progress)
    const arc = Math.sin(progress * Math.PI) * arcHeight

    return {
      x: baseX,
      y: baseY - arc,
    }
  }
}
