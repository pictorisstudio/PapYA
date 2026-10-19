import Phaser from 'phaser'
import DebugPanel from '../components/DebugPanel'
import TimerDisplay from '../components/TimerDisplay'
import { gameManager } from '../core/GameManager'
import type { MinigameKey } from '../types/Minigame'

export default class BasePlaceholderScene extends Phaser.Scene {
  private timerDisplay?: TimerDisplay
  private startedAt = 0
  private autoFinishTimeoutId: number | null = null

  constructor(sceneKey: string, private readonly minigameKey: MinigameKey) {
    super(sceneKey)
  }

  create(): void {
    const minigame = gameManager.getCurrentMinigame()

    this.startedAt = this.time.now
    this.cameras.main.setBackgroundColor(minigame.backgroundColor)

    // TODO: reemplazar este fondo provisional por arte pixel art del microjuego.
    this.add.rectangle(360, 640, 517.5, 746.67, 0x000000, 0.18).setStrokeStyle(4, 0xffffff, 0.36)
    this.add.circle(229.5, 725.33, 48, 0xfbbf24, 0.9)
    this.add.rectangle(478.13, 693.33, 73.13, 231.11, 0x6ee7b7, 0.9)

    this.add.text(360, 234.67, minigame.name, { fontSize: '46px', fontStyle: '700', color: '#ffffff' }).setOrigin(0.5)
    this.add.text(360, 508.44, 'PLACEHOLDER DE MECÁNICA', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5)
    this.add.text(360, 597.33, `Escena: ${this.minigameKey}`, { fontSize: '22px', color: '#d8dee9' }).setOrigin(0.5)
    this.timerDisplay = new TimerDisplay(this, 640, 474)

    new DebugPanel(this)

    if (gameManager.debugManager.isAutoPlayEnabled()) {
      this.autoFinishTimeoutId = window.setTimeout(() => this.finishAutomatically(), 3000)
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup())
  }

  update(time: number): void {
    const elapsedSeconds = (time - this.startedAt) / 1000
    this.timerDisplay?.setSeconds(3 - elapsedSeconds)
  }

  private finishAutomatically(): void {
    const won = Math.random() >= 0.35
    const nextScene = gameManager.completeCurrentMinigame({ key: this.minigameKey, won, rawScore: 0, metrics: {} })
    this.scene.start(nextScene === 'next' ? 'TransitionScene' : 'ResultsScene')
  }

  private cleanup(): void {
    if (this.autoFinishTimeoutId !== null) {
      window.clearTimeout(this.autoFinishTimeoutId)
      this.autoFinishTimeoutId = null
    }
  }
}
