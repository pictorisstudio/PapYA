import Phaser from 'phaser'
import { TEJO_CONFIG } from '../config/tejoConfig'
import type { TejoAimState, TejoPoint } from '../types/TejoTypes'

export default class TejoAimSystem {
  private readonly preview: Phaser.GameObjects.Graphics
  private readonly powerMeter: Phaser.GameObjects.Graphics
  private readonly origin: TejoPoint = { x: TEJO_CONFIG.THROW_START_X, y: TEJO_CONFIG.THROW_START_Y }
  private currentAim: TejoAimState | null = null

  constructor(private readonly scene: Phaser.Scene) {
    this.preview = scene.add.graphics().setDepth(650)
    this.powerMeter = scene.add.graphics().setDepth(1150)
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
    const targetY = Phaser.Math.Linear(TEJO_CONFIG.THROW_START_Y - 80, TEJO_CONFIG.BOARD_Y - TEJO_CONFIG.BOARD_HEIGHT / 2, launch.power)
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
    this.drawPowerMeter(this.currentAim)
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
    this.powerMeter.clear()
  }

  destroy(): void {
    this.preview.destroy()
    this.powerMeter.destroy()
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
    // Indica dirección y fuerza, sin revelar el punto exacto de impacto.
    const dx = aim.target.x - this.origin.x
    const dy = aim.target.y - this.origin.y
    const distance = Math.hypot(dx, dy) || 1
    const length = 72 + aim.power * 68
    const nx = dx / distance, ny = dy / distance
    const end = { x: this.origin.x + nx * length, y: this.origin.y + ny * length }
    for (const [width, color] of [[10, 0x172033], [5, 0xfff7cc]] as const) {
      this.preview.lineStyle(width, color, 1)
      this.preview.strokeLineShape(new Phaser.Geom.Line(this.origin.x, this.origin.y, end.x, end.y))
      for (const side of [-1, 1]) this.preview.strokeLineShape(new Phaser.Geom.Line(
        end.x, end.y, end.x - nx * 20 + ny * side * 13, end.y - ny * 20 - nx * side * 13))
    }
  }

  private drawPowerMeter(aim: TejoAimState): void {
    const discX = this.origin.x + aim.dragX, discY = this.origin.y + aim.dragY
    const width = 24, height = 136
    const x = Phaser.Math.Clamp(discX + 84, 16, 1280 - width - 16)
    // Anclar por la base para acompañar el arrastre hacia abajo sin salir del canvas.
    const y = Phaser.Math.Clamp(discY - height + 12, 140, 720 - height - 8)
    this.powerMeter.clear()
    this.powerMeter.fillStyle(0xfff7cc, 1)
    this.powerMeter.fillRoundedRect(x, y, width, height, 5)
    this.powerMeter.fillStyle(0x172033, 1)
    this.powerMeter.fillRect(x + 3, y + 3, width - 6, height - 6)
    const filled = (height - 10) * aim.power
    this.powerMeter.fillStyle(aim.power > 0.8 ? 0xfb923c : 0xfbbf24, 1)
    this.powerMeter.fillRect(x + 5, y + height - 5 - filled, width - 10, filled)
  }
}
