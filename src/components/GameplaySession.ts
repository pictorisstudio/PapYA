import Phaser from 'phaser'
import { WIN_MESSAGE_DURATION_MS } from '../config/constants'
import { LAYERS } from '../config/layers'
import { TEXTS } from '../config/texts'
import { gameManager } from '../core/GameManager'
import type { MinigameResult } from '../types/Minigame'

export interface SessionHooks {
  cancelInput?: () => void
  pause?: () => void
  resume?: () => void
  debugFinish?: (won: boolean) => void
}

// Ciclo compartido: suspensión segura, regreso voluntario y resultado único.
export default class GameplaySession {
  private finished = false
  private disposed = false
  private pauseRequested = false
  private resumeAudio = false
  private keyHandler?: (event: KeyboardEvent) => void

  constructor(private readonly scene: Phaser.Scene, private readonly hooks: SessionHooks = {}) {
    // Animaciones y temporizadores siguen el mismo ritmo que la simulación.
    if (scene.time) scene.time.timeScale = gameManager.pace
    if (scene.tweens) scene.tweens.timeScale = gameManager.pace
    const button = scene.add.rectangle(812, 66, 122, 46, 0x1f2937).setDepth(LAYERS.hud)
    button.setStrokeStyle(2, 0xcbd5e1).setInteractive({ useHandCursor: true })
    button.on('pointerdown', () => this.requestPause())
    scene.add.text(812, 66, TEXTS.pause, { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5).setDepth(LAYERS.hud)
    scene.game.events.on(Phaser.Core.Events.BLUR, this.requestPause, this)
    scene.events.on(Phaser.Scenes.Events.PAUSE, this.onPause, this)
    scene.events.on(Phaser.Scenes.Events.RESUME, this.onResume, this)
    scene.events.on('debug:finish', this.debugFinish, this)
    document.addEventListener('visibilitychange', this.visibilityChanged)
    window.addEventListener('papya:back', this.requestPause)
    window.addEventListener('papya:suspend', this.requestPause)
    this.keyHandler = event => { if (event.key === 'Escape') this.requestPause() }
    window.addEventListener('keydown', this.keyHandler)
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this)
  }

  requestPause = (event?: Event): void => {
    if (this.disposed || !this.scene.scene.isActive()) return
    event?.preventDefault?.()
    if (this.pauseRequested || this.scene.scene.isActive('PauseScene')) return
    this.pauseRequested = true
    this.scene.scene.launch('PauseScene', { owner: this.scene.scene.key })
    this.scene.scene.pause()
  }

  private visibilityChanged = (): void => {
    if (document.hidden) this.requestPause()
  }

  private onPause(): void {
    this.hooks.cancelInput?.()
    this.hooks.pause?.()
    this.resumeAudio = !this.scene.sound.mute
    this.scene.sound.pauseAll()
  }

  private onResume(): void {
    this.pauseRequested = false
    this.hooks.resume?.()
    if (this.resumeAudio) this.scene.sound.resumeAll()
  }

  private debugFinish(won: boolean): void {
    if (!this.finished) this.hooks.debugFinish?.(won)
  }

  complete(result: MinigameResult): void {
    if (this.finished || this.disposed) return
    this.finished = true
    this.hooks.cancelInput?.()
    const advance = () => {
      const destination = gameManager.completeCurrentMinigame(result)
      this.scene.scene.start(destination === 'next' ? 'TransitionScene' : destination === 'practice' ? 'DevScene' : 'ResultsScene')
    }
    if (!result.won) {
      advance()
      return
    }
    this.scene.add.rectangle(640, 340, 420, 112, 0x102132, 0.95).setDepth(LAYERS.overlay)
    this.scene.add.text(640, 340, TEXTS.won, { fontSize: '54px', fontStyle: '700', color: '#6ee7b7' })
      .setOrigin(0.5).setDepth(LAYERS.overlay + 1)
    this.scene.time.delayedCall(WIN_MESSAGE_DURATION_MS, advance)
  }

  private destroy(): void {
    this.disposed = true
    this.scene.game.events.off(Phaser.Core.Events.BLUR, this.requestPause, this)
    this.scene.events.off(Phaser.Scenes.Events.PAUSE, this.onPause, this)
    this.scene.events.off(Phaser.Scenes.Events.RESUME, this.onResume, this)
    this.scene.events.off('debug:finish', this.debugFinish, this)
    document.removeEventListener('visibilitychange', this.visibilityChanged)
    window.removeEventListener('papya:back', this.requestPause)
    window.removeEventListener('papya:suspend', this.requestPause)
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler)
  }
}
