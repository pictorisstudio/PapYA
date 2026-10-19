import Phaser from 'phaser'
import { TEXTS } from '../config/texts'
import { gameManager } from '../core/GameManager'
import { ROUTE_CARD_ASSETS } from '../config/assets'
import { REQUIRED_VICTORIES } from '../config/constants'

// Breve cierre del viaje; el siguiente comienza automáticamente.
export const ROUTE_MESSAGE_DURATION_MS = 5000

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
    const message = allUnlocked && state.victories >= REQUIRED_VICTORIES ? TEXTS.runEnd.allRoutes
      : gameManager.lastUnlockedRoute ? TEXTS.runEnd.routeUnlocked : TEXTS.runEnd.routePending
    this.cameras.main.setBackgroundColor('#10131a')
    const route = gameManager.lastUnlockedRoute
    if (route) {
      const art = this.add.image(640, 382, ROUTE_CARD_ASSETS[route].key)
      art.setScale(Math.min(800 / art.width, 350 / art.height))
      this.add.text(640, 610, TEXTS.routeName(Number(route.replace('route', ''))), {
        fontFamily: 'Arial, sans-serif', fontSize: '40px', color: '#fbbf24',
      }).setOrigin(0.5)
    }
    this.add.text(640, route ? 120 : 360, message, {
      fontFamily: 'Arial, sans-serif', fontSize: '44px', color: '#6ee7b7',
      align: 'center', wordWrap: { width: 1000 },
    }).setOrigin(0.5)
    this.time.delayedCall(ROUTE_MESSAGE_DURATION_MS, () => {
      gameManager.startNewRun(undefined, false, true)
      this.scene.start('TransitionScene')
    })
  }
}
