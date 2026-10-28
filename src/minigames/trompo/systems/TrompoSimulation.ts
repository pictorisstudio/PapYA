import { TROMPO_CONFIG as C } from '../config/trompoConfig'

export interface TopBody { x: number; y: number; vx: number; vy: number }
export type TrompoWinner = 'player' | 'enemy' | null

// Física independiente del dibujo. Pasos pequeños evitan atravesar al rival con FPS bajos.
export default class TrompoSimulation {
  readonly player: TopBody = { x: C.ARENA.x - 105, y: C.ARENA.y + 35, vx: 0, vy: 0 }
  readonly enemy: TopBody = { x: C.ARENA.x + 105, y: C.ARENA.y - 35, vx: 0, vy: 0 }
  winner: TrompoWinner = null
  collisions = 0
  private cooldown = 0
  private elapsedMs = 0

  update(deltaMs: number, input: { x: number; y: number }): void {
    let remaining = Math.max(0, Math.min(deltaMs, 200)) / 1000
    while (remaining > 0 && !this.winner) {
      const dt = Math.min(remaining, 1 / 120)
      remaining -= dt
      this.elapsedMs += dt * 1000
      this.cooldown = Math.max(0, this.cooldown - dt)
      const magnitude = Math.max(1, Math.hypot(input.x, input.y))
      this.move(this.player, input.x / magnitude, input.y / magnitude, C.PLAYER_ACCELERATION, C.PLAYER_MAX_SPEED, dt)
      const targetX = this.player.x - this.enemy.x, targetY = this.player.y - this.enemy.y
      const distance = Math.hypot(targetX, targetY) || 1
      const edgeX = this.enemy.x - C.ARENA.x, edgeY = this.enemy.y - C.ARENA.y
      const edgeDistance = Math.hypot(edgeX, edgeY) || 1
      const recovery = Math.max(0, (edgeDistance - (C.ARENA.radius - 65)) / 65) * 0.9
      const ax = targetX / distance - edgeX / edgeDistance * recovery
      const ay = targetY / distance - edgeY / edgeDistance * recovery
      const strength = Math.max(1, Math.hypot(ax, ay))
      const wakeUp = Math.min(1, this.elapsedMs / C.ENEMY_WAKE_UP_MS)
      this.move(this.enemy, ax / strength, ay / strength, C.ENEMY_ACCELERATION * wakeUp, C.ENEMY_MAX_SPEED, dt)
      this.resolveCollision()
      // Si ambos salen en el mismo paso, no se concede una victoria contradictoria.
      if (this.outside(this.player)) this.winner = 'enemy'
      else if (this.outside(this.enemy)) this.winner = 'player'
    }
  }

  private move(body: TopBody, x: number, y: number, acceleration: number, maxSpeed: number, dt: number): void {
    const damping = Math.exp(-C.DRAG * dt)
    body.vx = (body.vx + x * acceleration * dt) * damping
    body.vy = (body.vy + y * acceleration * dt) * damping
    const speed = Math.hypot(body.vx, body.vy)
    if (speed > maxSpeed) { body.vx *= maxSpeed / speed; body.vy *= maxSpeed / speed }
    body.x += body.vx * dt
    body.y += body.vy * dt
  }

  private resolveCollision(): void {
    const p = this.player, e = this.enemy
    const dx = e.x - p.x, dy = e.y - p.y
    const distance = Math.hypot(dx, dy)
    if (distance >= C.TOP_RADIUS * 2) return
    const nx = distance ? dx / distance : 1, ny = distance ? dy / distance : 0
    const separation = (C.TOP_RADIUS * 2 - distance) / 2
    p.x -= nx * separation; p.y -= ny * separation
    e.x += nx * separation; e.y += ny * separation
    const approaching = (e.vx - p.vx) * nx + (e.vy - p.vy) * ny
    if (approaching >= 0) return
    const newImpact = this.cooldown === 0 && approaching < -20
    const impulse = -(1 + C.REBOUND) * approaching / 2 + (newImpact ? C.IMPACT_KICK : 0)
    p.vx -= nx * impulse; p.vy -= ny * impulse
    e.vx += nx * impulse; e.vy += ny * impulse
    if (newImpact) { this.collisions++; this.cooldown = C.IMPACT_COOLDOWN_MS / 1000 }
  }

  private outside(body: TopBody): boolean {
    return Math.hypot(body.x - C.ARENA.x, body.y - C.ARENA.y) > C.ARENA.radius + C.TOP_RADIUS * 0.15
  }
}
