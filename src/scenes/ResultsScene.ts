import Phaser from 'phaser'
import DebugPanel from '../components/DebugPanel'
import { REQUIRED_VICTORIES } from '../config/constants'
import { MINIGAMES_CONFIG } from '../config/minigamesConfig'
import { TEXTS } from '../config/texts'
import { gameManager } from '../core/GameManager'

export default class ResultsScene extends Phaser.Scene {
  constructor() { super('ResultsScene') }
  create(): void {
    const state = gameManager.roundManager.getState()
    if (state.isRunning || !state.results.length || gameManager.isPractice) {
      this.scene.start('MenuScene')
      return
    }
    gameManager.finishRun()
    const save = gameManager.progressManager.getSaveData()
    const route = gameManager.lastUnlockedRoute
    const routeMessage = route
      ? TEXTS.routeUnlocked(gameManager.progressManager.routes.indexOf(route) + 1, gameManager.lastRoutePerfect)
      : save.explorationUnlocked ? TEXTS.allRoutes : TEXTS.routePending
    this.cameras.main.setBackgroundColor('#10131a')
    const text = (y: number, label: string, size: number, color = '#d8dee9') => {
      this.add.text(640, y, label, { fontSize: `${size}px`, color, align: 'center', wordWrap: { width: 1080 } }).setOrigin(0.5)
    }
    text(82, TEXTS.results, 48, '#f8fafc')
    text(150, TEXTS.travelPoints(state.score), 30)
    text(197, TEXTS.victories(state.victories, state.minigameOrder.length), 30, '#6ee7b7')
    text(243, TEXTS.goal(REQUIRED_VICTORIES), 22)
    text(292, routeMessage, 26, '#fbbf24')
    text(338, TEXTS.pointsRule, 20)
    state.results.forEach((result, index) => {
      text(383 + index * 31, TEXTS.rawScore(MINIGAMES_CONFIG[result.key].name, result.rawScore), 20)
    })
    text(551, TEXTS.record(save.bestVictories, state.minigameOrder.length, save.recordScore), 20)
    this.button(484, TEXTS.backToMap, () => this.scene.start('MapScene'))
    this.button(796, TEXTS.again, () => {
      gameManager.startNewRun()
      this.scene.start('TransitionScene')
    })
    new DebugPanel(this)
  }
  private button(x: number, label: string, action: () => void): void {
    this.add.rectangle(x, 620, 282, 58, 0xfbbf24).setInteractive({ useHandCursor: true }).on('pointerdown', action)
    this.add.text(x, 620, label, { fontSize: '24px', color: '#1f2937' }).setOrigin(0.5)
  }
}
