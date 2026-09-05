import Phaser from 'phaser'
import DebugPanel from '../components/DebugPanel'
import { REQUIRED_VICTORIES } from '../config/constants'
import { gameManager } from '../core/GameManager'

export default class ResultsScene extends Phaser.Scene {
  constructor() {
    super('ResultsScene')
  }

  create(): void {
    gameManager.finishRun()
    const state = gameManager.roundManager.getState()
    const save = gameManager.progressManager.getSaveData()
    const routeResult =
      gameManager.lastUnlockedRoute === null
        ? 'Ruta no desbloqueada'
        : gameManager.lastRoutePerfect
          ? `Ruta desbloqueada: ${gameManager.lastUnlockedRoute} · Ruta perfecta`
          : `Ruta desbloqueada: ${gameManager.lastUnlockedRoute}`

    this.cameras.main.setBackgroundColor('#10131a')
    this.add.text(640, 92, 'Resultados', { fontSize: '56px', fontStyle: '700', color: '#f8fafc' }).setOrigin(0.5)
    this.add.text(640, 176, `Puntaje provisional: ${state.score}`, { fontSize: '30px', color: '#d8dee9' }).setOrigin(0.5)
    this.add.text(640, 226, `Victorias: ${state.victories}/5`, { fontSize: '34px', color: '#6ee7b7' }).setOrigin(0.5)
    this.add.text(640, 274, `Meta: ${REQUIRED_VICTORIES}`, { fontSize: '24px', color: '#aab3c5' }).setOrigin(0.5)
    this.add.text(640, 330, routeResult, { fontSize: '26px', color: '#fbbf24' }).setOrigin(0.5)
    this.add.text(640, 386, `Mejor resultado: ${save.bestVictories}/5 · Record: ${save.recordScore}`, {
      fontSize: '24px',
      color: '#d8dee9',
    }).setOrigin(0.5)

    this.addButton(500, 560, 250, 56, 'Volver al mapa', () => this.scene.start('MapScene'))
    this.addButton(780, 560, 250, 56, 'Jugar otra vez', () => {
      gameManager.startNewRun()
      this.scene.start('TransitionScene')
    })

    new DebugPanel(this)
  }

  private addButton(x: number, y: number, width: number, height: number, label: string, action: () => void): void {
    const button = this.add.rectangle(x, y, width, height, 0xfbbf24).setStrokeStyle(2, 0xf8fafc)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerdown', action)
    this.add.text(x, y, label, { fontSize: '24px', fontStyle: '700', color: '#1f2937' }).setOrigin(0.5)
  }
}
