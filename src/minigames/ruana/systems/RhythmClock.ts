export default class RhythmClock {
  private startTime = 0
  private pausedAt = 0
  private accumulatedPause = 0
  private running = false
  private rate = 1
  private audioTime?: () => number | null
  private pausedAudioMs: number | null = null

  start(rate = 1, audioTime?: () => number | null): void {
    this.audioTime = audioTime
    this.pausedAudioMs = null
    this.rate = rate
    this.startTime = performance.now()
    this.pausedAt = 0
    this.accumulatedPause = 0
    this.running = true
  }

  pause(): void {
    if (!this.running || this.pausedAt > 0) {
      return
    }

    this.pausedAudioMs = this.audioTime?.() ?? null
    this.pausedAt = performance.now()
  }

  resume(): void {
    if (!this.running || this.pausedAt === 0) {
      return
    }

    this.accumulatedPause += performance.now() - this.pausedAt
    this.pausedAt = 0
    this.pausedAudioMs = null
  }

  reset(): void {
    this.audioTime = undefined
    this.pausedAudioMs = null
    this.startTime = 0
    this.pausedAt = 0
    this.accumulatedPause = 0
    this.running = false
  }

  getCurrentTime(): number {
    if (!this.running) {
      return 0
    }

    const audioMs = this.pausedAt > 0 ? this.pausedAudioMs : this.audioTime?.()
    if (audioMs != null && Number.isFinite(audioMs)) return Math.max(0, audioMs)
    const now = this.pausedAt > 0 ? this.pausedAt : performance.now()
    return (now - this.startTime - this.accumulatedPause) * this.rate
  }
}
