import { LAYERS } from '../config/layers'
import Phaser from 'phaser'
import { DEBUG_MODE, LOGICAL_HEIGHT, LOGICAL_WIDTH, SAFE_MARGIN_X, SAFE_MARGIN_Y } from '../config/constants'
import { gameManager } from '../core/GameManager'

type DebugAction = () => void

export default class DebugPanel {
  private readonly text: Phaser.GameObjects.Text
  private readonly viewportOverlay?: Phaser.GameObjects.Graphics
  private controls: (Phaser.GameObjects.GameObject & { visible: boolean; setVisible(value: boolean): unknown })[] = []

  constructor(private readonly scene: Phaser.Scene) {
    if (!DEBUG_MODE) {
      this.text = scene.add.text(-1000, -1000, '')
      return
    }

    scene.add.rectangle(326, 64, 382, 166, 0x05070c, 0.72).setOrigin(0, 0).setDepth(LAYERS.debug)
    this.text = scene.add.text(340, 74, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      color: '#d6e4ff',
      lineSpacing: 0,
    }).setDepth(LAYERS.debug)

    this.addButton(344, 148, 'WIN', () => this.finishMinigame(true))
    this.addButton(406, 148, 'LOSE', () => this.finishMinigame(false))
    this.addButton(474, 148, 'NEXT', () => this.finishMinigame(false))
    this.addButton(542, 148, 'TEST', () => scene.scene.start('DevScene'))
    this.addButton(608, 148, '+RUTA', () => this.changeProgress(() => gameManager.progressManager.unlockNextRoute()))
    this.addButton(344, 176, 'ALL', () => this.changeProgress(() => gameManager.progressManager.unlockAllRoutes()))
    this.addButton(406, 176, 'BORRAR', () => {
      // Este módulo ni siquiera se importa en una compilación de producción.
      if (import.meta.env.DEV) void import('../dev/resetProgress').then(module => {
        if (this.scene.scene.isActive() && gameManager.debugManager.areControlsEnabled()) module.openProgressReset(this.scene)
      })
    })
    this.addButton(474, 176, 'MENU', () => scene.scene.start('MenuScene'))
    this.addButton(542, 176, 'MAPA', () => scene.scene.start('MapScene'))
    this.addButton(608, 176, 'RES', () => { if (!gameManager.roundManager.getState().isRunning) scene.scene.start('ResultsScene') })
    this.addButton(344, 204, 'TOUCH', () => this.toggleTouchAreas(), 72)

    this.viewportOverlay = scene.add.graphics().setDepth(LAYERS.debug - 1)
    this.controls = scene.children.list.filter(object => {
      const depth = (object as Phaser.GameObjects.Rectangle).depth
      return depth >= LAYERS.debug - 1 && depth <= LAYERS.debug + 3
    }) as typeof this.controls
    const toggle = scene.add.rectangle(586, 32, 220, 30, 0x172033)
      .setStrokeStyle(1, 0x64748b).setDepth(LAYERS.debug + 8).setInteractive({ useHandCursor: true })
    const toggleText = scene.add.text(586, 32, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#f8fafc',
    }).setOrigin(0.5).setDepth(LAYERS.debug + 8)
    const updateControls = () => {
      const enabled = gameManager.debugManager.areControlsEnabled()
      for (const object of this.controls) object.setVisible(enabled)
      toggleText.setText(enabled ? 'DEV: ocultar controles' : 'DEV: mostrar controles')
      this.scene.events.emit('debug:touch-areas-changed', gameManager.debugManager.areTouchAreasVisible())
      this.drawViewportOverlay()
    }
    toggle.on('pointerdown', () => { gameManager.debugManager.toggleControls(); updateControls() })
    updateControls()
    this.drawViewportOverlay()

    this.refresh()
    scene.time.addEvent({ delay: 350, loop: true, callback: () => this.refresh() })
  }

  private addButton(x: number, y: number, label: string, action: DebugAction, width = 54): void {
    const button = this.scene.add.rectangle(x, y, width, 22, 0x1f2937, 0.92).setOrigin(0, 0).setDepth(LAYERS.debug)
    button.setStrokeStyle(1, 0x64748b)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerdown', () => { if (gameManager.debugManager.areControlsEnabled()) action() })

    this.scene.add
      .text(x + width / 2, y + 11, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: '#ffffff',
      })
      .setOrigin(0.5).setDepth(LAYERS.debug)
  }

  private changeProgress(action: DebugAction): void {
    action()
    this.scene.game.events.emit('debug:progress-changed')
  }

  private toggleTouchAreas(): void {
    const visible = gameManager.debugManager.toggleTouchAreas()
    this.scene.events.emit('debug:touch-areas-changed', visible)
    this.drawViewportOverlay()
    this.refresh()
  }

  private finishMinigame(won: boolean): void {
    const activeKey = this.scene.scene.key

    const minigameScenes = ['RuanaScene', 'CocinaScene', 'PapaScene', 'TejoScene', 'CocuyScene']

    if (!minigameScenes.includes(activeKey)) {
      return
    }

    this.scene.events.emit('debug:finish', won)
  }

  private refresh(): void {
    const state = gameManager.roundManager.getState()
    const order = state.minigameOrder.length > 0 ? state.minigameOrder.join(', ') : 'sin partida'

    this.text.setText([
      `DEBUG_MODE | Auto: ${gameManager.debugManager.isAutoPlayEnabled() ? 'ON' : 'OFF'}`,
      `Touch areas: ${gameManager.debugManager.areTouchAreasVisible() ? 'ON' : 'OFF'}`,
      `Viewport: ${window.innerWidth}x${window.innerHeight} | AR ${(window.innerWidth / window.innerHeight).toFixed(2)}`,
      `Logical: ${LOGICAL_WIDTH}x${LOGICAL_HEIGHT} | AR ${(LOGICAL_WIDTH / LOGICAL_HEIGHT).toFixed(2)}`,
      `Orden: ${order}`,
      `Reto: ${state.currentIndex + 1}/5 | Victorias: ${state.victories}`,
    ])

    this.drawViewportOverlay()
  }

  private drawViewportOverlay(): void {
    if (!this.viewportOverlay) {
      return
    }

    this.viewportOverlay.clear()

    if (!gameManager.debugManager.areControlsEnabled() || !gameManager.debugManager.areTouchAreasVisible()) {
      return
    }

    this.viewportOverlay.lineStyle(3, 0xff3b30, 0.9)
    this.viewportOverlay.strokeRect(1.5, 1.5, LOGICAL_WIDTH - 3, LOGICAL_HEIGHT - 3)
    this.viewportOverlay.lineStyle(2, 0x6ee7b7, 0.75)
    this.viewportOverlay.strokeRect(
      SAFE_MARGIN_X,
      SAFE_MARGIN_Y,
      LOGICAL_WIDTH - SAFE_MARGIN_X * 2,
      LOGICAL_HEIGHT - SAFE_MARGIN_Y * 2,
    )
  }
}
