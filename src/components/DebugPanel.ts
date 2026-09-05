import Phaser from 'phaser'
import { DEBUG_MODE } from '../config/constants'
import { gameManager } from '../core/GameManager'

type DebugAction = () => void

export default class DebugPanel {
  private readonly text: Phaser.GameObjects.Text

  constructor(private readonly scene: Phaser.Scene) {
    if (!DEBUG_MODE) {
      this.text = scene.add.text(-1000, -1000, '')
      return
    }

    scene.add.rectangle(886, 12, 382, 132, 0x05070c, 0.72).setOrigin(0, 0)
    this.text = scene.add.text(900, 22, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#d6e4ff',
      lineSpacing: 3,
    })

    this.addButton(904, 96, 'WIN', () => this.finishMinigame(true))
    this.addButton(966, 96, 'LOSE', () => this.finishMinigame(false))
    this.addButton(1034, 96, 'NEXT', () => this.finishMinigame(false))
    this.addButton(1102, 96, 'AUTO', () => gameManager.debugManager.toggleAutoPlaceholders())
    this.addButton(1168, 96, '+RUTA', () => gameManager.progressManager.unlockNextRoute())
    this.addButton(904, 124, 'ALL', () => gameManager.progressManager.unlockAllRoutes())
    this.addButton(966, 124, 'RESET', () => gameManager.progressManager.reset())
    this.addButton(1034, 124, 'MENU', () => scene.scene.start('MenuScene'))
    this.addButton(1102, 124, 'MAPA', () => scene.scene.start('MapScene'))
    this.addButton(1168, 124, 'RES', () => scene.scene.start('ResultsScene'))

    this.refresh()
    scene.time.addEvent({ delay: 350, loop: true, callback: () => this.refresh() })
  }

  private addButton(x: number, y: number, label: string, action: DebugAction): void {
    const button = this.scene.add.rectangle(x, y, 54, 22, 0x1f2937, 0.92).setOrigin(0, 0)
    button.setStrokeStyle(1, 0x64748b)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerdown', action)

    this.scene.add
      .text(x + 27, y + 11, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
  }

  private finishMinigame(won: boolean): void {
    const activeKey = this.scene.scene.key

    const minigameScenes = ['RuanaScene', 'CocinaScene', 'PapaScene', 'TejoScene', 'CocuyScene']

    if (!minigameScenes.includes(activeKey)) {
      return
    }

    const nextScene = gameManager.completeCurrentMinigame(won)
    this.scene.scene.start(nextScene === 'next' ? 'TransitionScene' : 'ResultsScene')
  }

  private refresh(): void {
    const state = gameManager.roundManager.getState()
    const order = state.minigameOrder.length > 0 ? state.minigameOrder.join(', ') : 'sin partida'

    this.text.setText([
      `DEBUG_MODE | Auto: ${gameManager.debugManager.isAutoPlayEnabled() ? 'ON' : 'OFF'}`,
      `Orden: ${order}`,
      `Reto: ${state.currentIndex + 1}/5 | Victorias: ${state.victories}`,
    ])
  }
}
