
import { COCINA_ASSETS, TEJO_ASSETS, POTATO_ASSETS, ROUTE_CARD_ASSETS } from '../config/assets'
import Phaser from 'phaser'
import { SCENE_ASSETS } from '../config/sceneAssets'
import { AUDIO_CONFIG, type AudioKey } from '../config/audioConfig'
import { gameManager } from '../core/GameManager'

export default class PreloaderScene extends Phaser.Scene {

  constructor() {
    super('PreloaderScene')
  }

  preload(): void {
    for (const asset of Object.values(SCENE_ASSETS)) if (!this.textures.exists(asset.key)) this.load.image(asset.key, asset.path)
    gameManager.audioManager.preload(this, Object.keys(AUDIO_CONFIG) as AudioKey[])
    this.cameras.main.setBackgroundColor('#000000')
    if (!this.anims.exists('loading-condor')) this.anims.create({ key: 'loading-condor', frames: [SCENE_ASSETS.condorSide1, SCENE_ASSETS.condorSide2, SCENE_ASSETS.condorSide3, SCENE_ASSETS.condorSide4, SCENE_ASSETS.condorSide5, SCENE_ASSETS.condorSide6].map(asset => ({ key: asset.key })), frameRate: 8, repeat: -1 })
    this.add.sprite(360, 640, SCENE_ASSETS.condorSide1.key).setDisplaySize(160, 160).play('loading-condor')
    for (const asset of [...POTATO_ASSETS.GOOD, ...POTATO_ASSETS.BAD, ...Object.values(ROUTE_CARD_ASSETS), ...Object.values(COCINA_ASSETS), ...Object.values(TEJO_ASSETS)]) {
      this.load.image(asset.key, asset.path)
    }

  }

  create(): void {
    for (const [key, frames] of [
      ['condor-flight', [SCENE_ASSETS.condorFlight1, SCENE_ASSETS.condorFlight2]],
      ['condor-side', [SCENE_ASSETS.condorSide1, SCENE_ASSETS.condorSide2, SCENE_ASSETS.condorSide3, SCENE_ASSETS.condorSide4, SCENE_ASSETS.condorSide5, SCENE_ASSETS.condorSide6]],
    ] as const) {
      if (!this.anims.exists(key)) this.anims.create({ key, frames: frames.map(asset => ({ key: asset.key })), frameRate: key === 'condor-side' ? 8 : 5, repeat: -1 })
    }
    if (!this.anims.exists('cocina-fire')) this.anims.create({
      key: 'cocina-fire', frames: [COCINA_ASSETS.fuego1, COCINA_ASSETS.fuego2, COCINA_ASSETS.fuego3].map(asset => ({ key: asset.key })),
      frameRate: 9, repeat: -1,
    })
    if (this.registry.get('brandComplete')) this.scene.start('MenuScene')
    else this.game.events.once('brand:complete', () => this.scene.start('MenuScene'))
  }
}
