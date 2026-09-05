export default class RhythmClock {
  private startTime = 0
  private pausedAt = 0
  private accumulatedPause = 0
  private running = false

  start(): void {
    this.startTime = performance.now()
    this.pausedAt = 0
    this.accumulatedPause = 0
    this.running = true
  }

  pause(): void {
    if (!this.running || this.pausedAt > 0) {
      return
    }

    this.pausedAt = performance.now()
  }

  resume(): void {
    if (!this.running || this.pausedAt === 0) {
      return
    }

    this.accumulatedPause += performance.now() - this.pausedAt
    this.pausedAt = 0
  }

  reset(): void {
    this.startTime = 0
    this.pausedAt = 0
    this.accumulatedPause = 0
    this.running = false
  }

  getCurrentTime(): number {
    if (!this.running) {
      return 0
    }

    const now = this.pausedAt > 0 ? this.pausedAt : performance.now()
    return now - this.startTime - this.accumulatedPause
  }
}
