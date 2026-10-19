import Phaser from 'phaser'
import { gameManager } from '../core/GameManager'
import { SCENE_ASSETS } from '../config/sceneAssets'

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene') }
  preload(): void {
    this.load.image('brand-gobernacion', 'assets/branding/logo-gobernacion-horizontal.png')
    for (const asset of [SCENE_ASSETS.condorSide1, SCENE_ASSETS.condorSide2, SCENE_ASSETS.condorSide3, SCENE_ASSETS.condorSide4, SCENE_ASSETS.condorSide5, SCENE_ASSETS.condorSide6]) this.load.image(asset.key, asset.path)
  }
  create(): void {
    gameManager.initialize()
    this.registry.set('brandComplete', false)
    this.add.rectangle(640, 360, 1280, 720, 0x000000)
    // El archivo blanco tiene márgenes transparentes amplios; usar su contenido real.
    this.textures.get('brand-gobernacion').add('mark', 0, 240, 376, 1441, 328)
    const logo = this.add.image(640, 360, 'brand-gobernacion', 'mark').setAlpha(0).setScale(0.65)
    this.scene.launch('PreloaderScene')
    this.scene.bringToTop()
    this.tweens.add({ targets: logo, alpha: 1, duration: 900, hold: 1200, yoyo: true,
      onComplete: () => {
        this.registry.set('brandComplete', true)
        this.game.events.emit('brand:complete')
        this.scene.stop()
      },
    })
  }
}
