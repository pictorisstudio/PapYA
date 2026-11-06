import { SCENE_ASSETS } from '../config/sceneAssets'
import { requestFullscreenOnPlay } from '../utils/fullscreen'
import { TEXTS } from '../config/texts'
import { DEBUG_MODE, LOGICAL_HEIGHT, LOGICAL_WIDTH, TOTAL_ROUTES } from '../config/constants'
import { LAYERS } from '../config/layers'
import Phaser from 'phaser'
import DebugPanel from '../components/DebugPanel'
import { gameManager } from '../core/GameManager'
import PapaGuide from '../components/PapaGuide'
import { MENU_BUTTON_SIZE, MENU_UI_ASSETS } from '../config/uiAssets'

export default class MenuScene extends Phaser.Scene {
  private guide?: PapaGuide
  private resetDialog?: Phaser.GameObjects.Container
  constructor() {
    super('MenuScene')
  }

  create(): void {
    gameManager.audioManager.playMusic(this, 'menuMusic')
    this.cameras.main.setBackgroundColor('#10131a')

    this.add.image(640, 360, SCENE_ASSETS.menuBackground.key).setDisplaySize(1280, 720).setDepth(LAYERS.background)
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.35).setDepth(LAYERS.background + 1)
    this.add.image(400, 120, SCENE_ASSETS.logo.key).setDisplaySize(380, 380)
    const count = Phaser.Math.Clamp(gameManager.progressManager.getSaveData().unlockedRoutes.length, 0, TOTAL_ROUTES)
    const maps = [SCENE_ASSETS.map0, SCENE_ASSETS.map1, SCENE_ASSETS.map2, SCENE_ASSETS.map3, SCENE_ASSETS.map4, SCENE_ASSETS.map5]
    this.add.image(950, 270, maps[count]!.key).setDisplaySize(650, 365.625)
    const artButton = (x: number, y: number, key: string, action: () => void) => {
      this.add.image(x, y, key, 'button').setDisplaySize(MENU_BUTTON_SIZE.width, MENU_BUTTON_SIZE.height)
        .setInteractive({ useHandCursor: true }).on('pointerdown', action)
    }
    artButton(200, 600, SCENE_ASSETS.travelButton.key, () => {
      requestFullscreenOnPlay()
      gameManager.startNewRun()
      this.scene.start('TransitionScene')
    })
    artButton(1080, 600, SCENE_ASSETS.mapButton.key, () => this.scene.start('MapScene'))
    this.guide = new PapaGuide(this, 300, 320, 600, 640, 280)
    this.add.image(640, 460, MENU_UI_ASSETS.multiplayer.key, 'button').setDisplaySize(270, 121)
      .setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('TrompoMultiplayerScene'))
    if (count === TOTAL_ROUTES) {
      this.addButton(950, 491, 288, 48, 'Reiniciar progreso', () => this.openResetDialog(), true)
    }
    if (DEBUG_MODE) {
      const first = this.children.list.length
      this.addButton(1100, 700, 300, 30, TEXTS.dev, () => this.scene.start('DevScene'))
      for (const object of this.children.list.slice(first)) (object as Phaser.GameObjects.Rectangle).setDepth(LAYERS.debug)
    }
    new DebugPanel(this)
    this.input.keyboard?.on('keydown-ESC', this.closeResetDialog, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.closeResetDialog()
      this.input.keyboard?.off('keydown-ESC', this.closeResetDialog, this)
    })
  }

  closeOverlay(): boolean { return this.closeResetDialog() || (this.guide?.close() ?? false) }

  private openResetDialog(): void {
    if (this.resetDialog || gameManager.progressManager.getNextRoute() !== null) return
    const width = this.scale.gameSize.width
    const height = this.scale.gameSize.height
    const shade = this.add.rectangle(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2, width, height, 0x05070c, 0.88).setInteractive()
    const panel = this.add.rectangle(640, 360, 780, 300, 0x172033).setStrokeStyle(3, 0xfbbf24)
    const title = this.add.text(640, 254, '¿Reiniciar progreso?', { fontSize: '38px', color: '#fff4ce' }).setOrigin(0.5)
    const message = this.add.text(640, 342, 'Se borrarán las rutas desbloqueadas y los récords de este dispositivo.', {
      fontSize: '26px', color: '#f8fafc', align: 'center', wordWrap: { width: 660 },
    }).setOrigin(0.5)
    const cancel = this.addButton(490, 445, 246, 54, 'Cancelar', () => this.closeResetDialog(), true)
    const confirm = this.addButton(790, 445, 246, 54, 'Reiniciar', () => {
      const previous = gameManager.progressManager.getSaveData()
      gameManager.progressManager.reset()
      if (!gameManager.saveManager.storageAvailable) {
        gameManager.saveManager.save(previous)
        message.setText('No se pudo guardar el reinicio en este dispositivo.')
        return
      }
      this.closeResetDialog()
      this.scene.restart()
    })
    this.resetDialog = this.add.container(0, 0, [shade, panel, title, message, ...cancel, ...confirm]).setDepth(LAYERS.overlay)
  }

  private closeResetDialog(): boolean {
    if (!this.resetDialog) return false
    this.resetDialog.destroy(true)
    this.resetDialog = undefined
    return true
  }

  private addButton(x: number, y: number, width: number, height: number, label: string, action: () => void, secondary = false) {
    const button = this.add.rectangle(x, y, width, height, secondary ? 0x223349 : 0xfbbf24)
      .setStrokeStyle(3, secondary ? 0x94a3b8 : 0xfff7cc)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerdown', action)

    const text = this.add
      .text(x, y, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: height > 40 ? '24px' : '18px',
        fontStyle: '700',
        color: secondary ? '#f8fafc' : '#1f2937',
      })
      .setOrigin(0.5)
    return [button, text] as const
  }
}
