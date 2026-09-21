import Phaser from 'phaser'
import { COCUY_CONFIG } from '../config/cocuyConfig'
import type { AscentSnapshot, EnvironmentZone } from '../types/CocuyTypes'

export default class AscentSystem {
  private altitude = 0
  private rate: number = COCUY_CONFIG.ASCENT_RATE_START

  update(elapsedMs: number, delta: number): AscentSnapshot {
    this.rate = this.getRateForTime(elapsedMs)
    this.altitude = Math.min(COCUY_CONFIG.TARGET_ALTITUDE, this.altitude + this.rate * (delta / 1000))
    return this.getSnapshot()
  }

  applyRockPenalty(): void {
    this.altitude = Math.max(0, this.altitude - COCUY_CONFIG.ROCK_ALTITUDE_PENALTY)
  }

  setAltitude(altitude: number): void {
    this.altitude = Phaser.Math.Clamp(altitude, 0, COCUY_CONFIG.TARGET_ALTITUDE)
  }

  getSnapshot(): AscentSnapshot {
    return {
      altitude: this.altitude,
      rate: this.rate,
      environmentZone: this.getEnvironmentZone(this.altitude),
      victory: this.altitude >= COCUY_CONFIG.TARGET_ALTITUDE,
    }
  }

  getRateForTime(elapsedMs: number): number {
    const progress = Phaser.Math.Clamp(elapsedMs / COCUY_CONFIG.GAME_DURATION_MS, 0, 1)

    if (progress <= 0.5) {
      return Phaser.Math.Linear(COCUY_CONFIG.ASCENT_RATE_START, COCUY_CONFIG.ASCENT_RATE_MID, Phaser.Math.SmoothStep(progress / 0.5, 0, 1))
    }

    return Phaser.Math.Linear(COCUY_CONFIG.ASCENT_RATE_MID, COCUY_CONFIG.ASCENT_RATE_END, Phaser.Math.SmoothStep((progress - 0.5) / 0.5, 0, 1))
  }

  private getEnvironmentZone(altitude: number): EnvironmentZone {
    if (altitude < 150) {
      return 'VEGETATION'
    }

    if (altitude < 300) {
      return 'PARAMO'
    }

    if (altitude < 450) {
      return 'ROCK'
    }

    return 'SNOW'
  }
}
