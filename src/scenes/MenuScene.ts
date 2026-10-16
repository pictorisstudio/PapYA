import { SCENE_ASSETS } from '../config/sceneAssets'
import { TEXTS } from '../config/texts'
import { DEBUG_MODE } from '../config/constants'
import { LAYERS } from '../config/layers'
import Phaser from 'phaser'
import DebugPanel from '../components/DebugPanel'
import { gameManager } from '../core/GameManager'

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  create(): void {
    gameManager.audioManager.playMusic(this, 'menuMusic')
    this.cameras.main.setBackgroundColor('#10131a')

    this.add.image(640, 360, SCENE_ASSETS.menuBackground.key).setDisplaySize(1280, 720).setDepth(LAYERS.background)
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.35).setDepth(LAYERS.background + 1)
    this.add.image(640, 112, SCENE_ASSETS.logo.key).setDisplaySize(320, 320)
    this.add.sprite(320, 350, SCENE_ASSETS.condorSide1.key).setDisplaySize(190, 190).play('condor-side')
    const count = Phaser.Math.Clamp(gameManager.progressManager.getSaveData().unlockedRoutes.length, 0, 5)
    const maps = [SCENE_ASSETS.map0, SCENE_ASSETS.map1, SCENE_ASSETS.map2, SCENE_ASSETS.map3, SCENE_ASSETS.map4, SCENE_ASSETS.map5]
    this.add.image(820, 300, maps[count]!.key).setDisplaySize(520, 292.5)
    const artButton = (y: number, key: string, action: () => void) => {
      this.add.image(640, y, key).setDisplaySize(360, 202.5)
      this.add.rectangle(640, y, 340, 68, 0, 0).setInteractive({ useHandCursor: true }).on('pointerdown', action)
    }
    artButton(505, SCENE_ASSETS.travelButton.key, () => {
      gameManager.startNewRun()
      this.scene.start('TransitionScene')
    })
    artButton(615, SCENE_ASSETS.mapButton.key, () => this.scene.start('MapScene'))
    if (DEBUG_MODE) {
      const first = this.children.list.length
      this.addButton(1100, 654, 300, 34, TEXTS.dev, () => this.scene.start('DevScene'))
      for (const object of this.children.list.slice(first)) (object as Phaser.GameObjects.Rectangle).setDepth(LAYERS.debug)
    }
    new DebugPanel(this)
  }

  private addButton(x: number, y: number, width: number, height: number, label: string, action: () => void): void {
    const button = this.add.rectangle(x, y, width, height, 0xfbbf24, 1).setStrokeStyle(3, 0xfff7cc)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerdown', action)

    this.add
      .text(x, y, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: height > 40 ? '30px' : '18px',
        fontStyle: '700',
        color: '#1f2937',
      })
      .setOrigin(0.5)
  }
}
