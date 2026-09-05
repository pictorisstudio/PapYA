import Phaser from 'phaser'
import DebugPanel from '../components/DebugPanel'
import { TOTAL_ROUTES } from '../config/constants'
import { gameManager } from '../core/GameManager'

export default class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene')
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#10131a')

    const save = gameManager.progressManager.getSaveData()

    this.add.text(74, 48, 'Mapa de rutas', { fontSize: '44px', fontStyle: '700', color: '#f8fafc' })
    this.add.text(76, 100, `Rutas desbloqueadas: ${save.unlockedRoutes.length}/${TOTAL_ROUTES}`, {
      fontSize: '22px',
      color: '#aab3c5',
    })
    this.add.text(76, 130, `Record: ${save.recordScore} · Mejor: ${save.bestVictories}/5`, {
      fontSize: '20px',
      color: '#aab3c5',
    })

    gameManager.progressManager.routes.forEach((routeId, index) => {
      const state = gameManager.progressManager.getRouteState(routeId)
      const x = 178 + index * 224
      const color = state === 'unlocked' ? 0x34d399 : state === 'next' ? 0xfbbf24 : 0x334155
      const label = state === 'unlocked' ? 'desbloqueada' : state === 'next' ? 'próxima ruta' : 'bloqueada'

      this.add.rectangle(x, 340, 172, 220, color, 0.95).setStrokeStyle(4, 0xf8fafc)
      this.add.text(x, 280, `Ruta ${index + 1}`, { fontSize: '26px', fontStyle: '700', color: '#10131a' }).setOrigin(0.5)
      this.add.text(x, 352, label, { fontSize: '19px', color: '#10131a' }).setOrigin(0.5)
      this.add.circle(x, 410, 26, 0x10131a, 0.28)
    })

    this.addButton(428, 616, 260, 56, '¡A viajar!', () => {
      gameManager.startNewRun()
      this.scene.start('TransitionScene')
    })

    this.addButton(726, 616, 260, 56, 'Explorar Boyacá', () => this.scene.start('ExplorationScene'), !save.explorationUnlocked)
    this.addButton(1024, 616, 210, 42, 'Menu', () => this.scene.start('MenuScene'))

    new DebugPanel(this)
  }

  private addButton(x: number, y: number, width: number, height: number, label: string, action: () => void, disabled = false): void {
    const color = disabled ? 0x475569 : 0xfbbf24
    const button = this.add.rectangle(x, y, width, height, color, 1).setStrokeStyle(2, 0xf8fafc)

    if (!disabled) {
      button.setInteractive({ useHandCursor: true })
      button.on('pointerdown', action)
    }

    this.add
      .text(x, y, label, {
        fontSize: height > 44 ? '25px' : '20px',
        fontStyle: '700',
        color: disabled ? '#cbd5e1' : '#1f2937',
      })
      .setOrigin(0.5)
  }
}
