import Phaser from 'phaser'
import DebugPanel from '../components/DebugPanel'
import { gameManager } from '../core/GameManager'

export default class ExplorationScene extends Phaser.Scene {
  constructor() {
    super('ExplorationScene')
  }

  create(): void {
    const save = gameManager.progressManager.getSaveData()

    this.cameras.main.setBackgroundColor('#10131a')
    this.add.text(640, 74, 'Explorar Boyacá', { fontSize: '48px', fontStyle: '700', color: '#f8fafc' }).setOrigin(0.5)

    if (!save.explorationUnlocked) {
      this.add.text(640, 330, 'Completa las cinco rutas para desbloquear esta exploración.', {
        fontSize: '28px',
        color: '#aab3c5',
      }).setOrigin(0.5)
    } else {
      for (let index = 0; index < 5; index += 1) {
        const x = 186 + index * 226
        this.add.rectangle(x, 338, 172, 246, 0x172033).setStrokeStyle(3, 0x6ee7b7)
        this.add.text(x, 306, `Tarjeta ${index + 1}`, { fontSize: '24px', color: '#f8fafc' }).setOrigin(0.5)
        this.add.text(x, 380, 'Placeholder', { fontSize: '18px', color: '#aab3c5' }).setOrigin(0.5)
      }
    }

    this.addButton(640, 626, 220, 48, 'Volver al mapa', () => this.scene.start('MapScene'))
    new DebugPanel(this)
  }

  private addButton(x: number, y: number, width: number, height: number, label: string, action: () => void): void {
    const button = this.add.rectangle(x, y, width, height, 0xfbbf24).setStrokeStyle(2, 0xf8fafc)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerdown', action)
    this.add.text(x, y, label, { fontSize: '22px', fontStyle: '700', color: '#1f2937' }).setOrigin(0.5)
  }
}
