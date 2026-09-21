import { COCUY_CONFIG } from '../config/cocuyConfig'
import Condor from '../entities/Condor'
import CocuyObstacle from '../entities/CocuyObstacle'
import type { CocuyRect } from '../types/CocuyTypes'

interface EffectCallbacks {
  onRockHit: () => void
  onCloud: () => void
  onWind: (force: number) => void
}

export default class ObstacleEffectSystem {
  update(condor: Condor, obstacles: readonly CocuyObstacle[], callbacks: EffectCallbacks): void {
    const condorHitbox = condor.getHitbox()

    for (const obstacle of obstacles) {
      if (!obstacle.isActive() || !this.intersects(condorHitbox, obstacle.getHitbox())) {
        continue
      }

      obstacle.trigger()

      if (obstacle.type === 'ROCK') {
        callbacks.onRockHit()
      }

      if (obstacle.type === 'CLOUD') {
        callbacks.onCloud()
      }

      if (obstacle.type === 'WIND') {
        callbacks.onWind(obstacle.windDirection * COCUY_CONFIG.WIND_FORCE)
      }
    }
  }

  private intersects(a: CocuyRect, b: CocuyRect): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
  }
}
