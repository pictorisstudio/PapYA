// Simulación compartida con el servidor Node; no depende de Phaser ni del viaje individual.
export const MATCH_ARENA = { x: 600, y: 405, radius: 240 }
export interface MatchBody { x: number; y: number; vx: number; vy: number }
export interface MatchInput { x: number; y: number }
export class TrompoMatch {
  bodies: MatchBody[] = []
  scores = [0, 0]
  winner: number | null = null
  round = 1
  countdown = 1.2
  collisions = 0
  constructor() { this.resetBodies() }
  resetBodies(): void {
    this.bodies = [-1, 1].map(side => ({ x: MATCH_ARENA.x + side * 105, y: MATCH_ARENA.y, vx: 0, vy: 0 }))
  }
  step(dt: number, inputs: MatchInput[]): void {
    if (this.winner !== null) return
    if (this.countdown > 0) { this.countdown = Math.max(0, this.countdown - dt); return }
    for (let i = 0; i < 2; i++) {
      const b = this.bodies[i]!, input = inputs[i] ?? { x: 0, y: 0 }
      const length = Math.max(1, Math.hypot(input.x, input.y))
      const drag = Math.exp(-1.7 * dt)
      b.vx = (b.vx + input.x / length * 920 * dt) * drag
      b.vy = (b.vy + input.y / length * 920 * dt) * drag
      const speed = Math.hypot(b.vx, b.vy)
      if (speed > 330) { b.vx *= 330 / speed; b.vy *= 330 / speed }
      b.x += b.vx * dt; b.y += b.vy * dt
    }
    const [a, b] = this.bodies as [MatchBody, MatchBody]
    const dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy)
    if (distance < 72) {
      const nx = distance ? dx / distance : 1, ny = distance ? dy / distance : 0
      const overlap = (72 - distance) / 2
      a.x -= nx * overlap; a.y -= ny * overlap; b.x += nx * overlap; b.y += ny * overlap
      const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
      if (relative < 0) {
        const impulse = -0.95 * relative + (relative < -20 ? 90 : 0)
        a.vx -= nx * impulse; a.vy -= ny * impulse; b.vx += nx * impulse; b.vy += ny * impulse
        this.collisions++
      }
    }
    const outside = this.bodies.map(body => Math.hypot(body.x - MATCH_ARENA.x, body.y - MATCH_ARENA.y) > MATCH_ARENA.radius + 5.4)
    if (!outside.some(Boolean)) return
    if (outside[0] !== outside[1]) {
      const scorer = outside[0] ? 1 : 0
      this.scores[scorer]!++
      if (this.scores[scorer]! >= 3) this.winner = scorer
    }
    this.round++; this.countdown = 1.2; this.resetBodies()
  }
}
