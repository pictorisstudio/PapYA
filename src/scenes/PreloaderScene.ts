import { TEXTS } from '../config/texts'
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
    for (const asset of Object.values(SCENE_ASSETS)) this.load.image(asset.key, asset.path)
    gameManager.audioManager.preload(this, Object.keys(AUDIO_CONFIG) as AudioKey[])
    this.cameras.main.setBackgroundColor('#10131a')
    this.add.rectangle(640, 360, 420, 18, 0x2d3748)
    const bar = this.add.rectangle(430, 360, 0, 18, 0x6ee7b7).setOrigin(0, 0.5)

    this.load.on('progress', (progress: number) => bar.width = 420 * progress)
    for (const asset of [...POTATO_ASSETS.GOOD, ...POTATO_ASSETS.BAD, ...Object.values(ROUTE_CARD_ASSETS), ...Object.values(COCINA_ASSETS), ...Object.values(TEJO_ASSETS)]) {
      this.load.image(asset.key, asset.path)
    }

    this.add
      .text(640, 320, TEXTS.loading, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#f4f7fb',
      })
      .setOrigin(0.5)

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
    this.scene.start('MenuScene')
  }
}
