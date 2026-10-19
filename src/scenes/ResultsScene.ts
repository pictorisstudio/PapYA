import Phaser from 'phaser'
import { TEXTS } from '../config/texts'
import { gameManager } from '../core/GameManager'

// Breve cierre del viaje; el siguiente comienza automáticamente.
export const ROUTE_MESSAGE_DURATION_MS = 1800

export default class ResultsScene extends Phaser.Scene {
  constructor() { super('ResultsScene') }
  create(): void {
    const state = gameManager.roundManager.getState()
    if (state.isRunning || !state.results.length || gameManager.isPractice) {
      this.scene.start('MenuScene')
      return
    }
    gameManager.finishRun()
    const allUnlocked = gameManager.progressManager.getNextRoute() === null
    if (allUnlocked && gameManager.lastUnlockedRoute) gameManager.audioManager.playEffect(this, 'mapComplete')
    const message = allUnlocked ? TEXTS.runEnd.allRoutes
      : gameManager.lastUnlockedRoute ? TEXTS.runEnd.routeUnlocked : TEXTS.runEnd.routePending
    this.cameras.main.setBackgroundColor('#10131a')
    this.add.text(360, 640, message, {
      fontFamily: 'Arial, sans-serif', fontSize: '34px', color: '#6ee7b7',
      align: 'center', wordWrap: { width: 620 },
    }).setOrigin(0.5)
    this.time.delayedCall(ROUTE_MESSAGE_DURATION_MS, () => {
      gameManager.startNewRun(undefined, false, true)
      this.scene.start('TransitionScene')
    })
  }
}
