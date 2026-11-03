export default class RhythmClock {
  private startTime = 0
  private pausedAt = 0
  private accumulatedPause = 0
  private running = false
  private rate = 1
  private audioTime?: () => number | null
  private pausedAudioMs: number | null = null
  private lastAudioMs: number | null = null
  private visualMs = 0
  private lastFrameAt = 0

  start(rate = 1, audioTime?: () => number | null): void {
    this.audioTime = audioTime
    this.lastAudioMs = null
    this.lastFrameAt = 0
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

    this.pausedAudioMs = this.getCurrentTime()
    this.pausedAt = performance.now()
  }

  resume(): void {
    if (!this.running || this.pausedAt === 0) {
      return
    }

    this.accumulatedPause += performance.now() - this.pausedAt
    this.pausedAt = 0
    this.pausedAudioMs = null
    this.lastAudioMs = null
    this.lastFrameAt = 0
  }

  reset(): void {
    this.audioTime = undefined
    this.pausedAudioMs = null
    this.startTime = 0
    this.pausedAt = 0
    this.accumulatedPause = 0
    this.running = false
    this.lastAudioMs = null
    this.lastFrameAt = 0
  }

  getCurrentTime(): number {
    if (!this.running) {
      return 0
    }

    const now = this.pausedAt > 0 ? this.pausedAt : performance.now()
    if (this.pausedAt > 0 && this.pausedAudioMs !== null) return this.pausedAudioMs
    const audioMs = this.audioTime?.()
    if (audioMs != null && Number.isFinite(audioMs)) {
      if (this.lastAudioMs === null) this.visualMs = audioMs
      else {
        // Interpolar con un reloj fino entre muestras de audio cuantizadas (móvil).
        const predicted = this.visualMs + (now - this.lastFrameAt) * this.rate
        const error = audioMs - predicted
        this.visualMs = audioMs !== this.lastAudioMs
          ? Math.abs(error) > 250 ? audioMs : predicted + error * 0.15
          : predicted
      }
      this.lastAudioMs = audioMs
      this.lastFrameAt = now
      return Math.max(0, this.visualMs)
    }
    return (now - this.startTime - this.accumulatedPause) * this.rate
  }
}
