import { TROMPO_CONFIG } from '../config/trompoConfig'

// Un solo dueño: otro dedo o el botón de pausa nunca cambia el rumbo del trompo.
export default class TrompoJoystick {
  private owner: number | null = null
  private x = 0
  private y = 0

  start(id: number, x: number, y: number): boolean {
    const area = TROMPO_CONFIG.JOYSTICK
    if (this.owner !== null || Math.hypot(x - area.x, y - area.y) > area.radius + 24) return false
    this.owner = id
    this.move(id, x, y)
    return true
  }

  move(id: number, x: number, y: number): void {
    if (id !== this.owner) return
    const area = TROMPO_CONFIG.JOYSTICK
    const dx = (x - area.x) / area.radius, dy = (y - area.y) / area.radius
    const distance = Math.hypot(dx, dy)
    const magnitude = Math.max(0, Math.min(1, (distance - area.deadZone) / (1 - area.deadZone)))
    this.x = distance ? dx / distance * magnitude : 0
    this.y = distance ? dy / distance * magnitude : 0
  }

  release(id: number): void { if (id === this.owner) this.cancel() }
  cancel(): void { this.owner = null; this.x = 0; this.y = 0 }
  get direction() { return { x: this.x, y: this.y } }
}
