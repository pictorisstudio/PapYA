
import { COCINA_ASSETS, TEJO_ASSETS, POTATO_ASSETS, ROUTE_CARD_ASSETS } from '../config/assets'
import Phaser from 'phaser'
import { SCENE_ASSETS } from '../config/sceneAssets'
import { AUDIO_CONFIG, type AudioKey } from '../config/audioConfig'
import { gameManager } from '../core/GameManager'
import { TEXTS } from '../config/texts'

export default class PreloaderScene extends Phaser.Scene {

  constructor() {
    super('PreloaderScene')
  }

  preload(): void {
    // La cámara de carga no debe tapar el logo aunque esta escena termine arriba.
    this.cameras.main.setVisible(false)
    const showLoading = () => this.cameras.main.setVisible(true)
    this.game.events.once('brand:complete', showLoading)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.game.events.off('brand:complete', showLoading))
    for (const asset of Object.values(SCENE_ASSETS)) if (!this.textures.exists(asset.key)) this.load.image(asset.key, asset.path)
    this.load.once('filecomplete-audio-menuMusic', () => gameManager.audioManager.playMusic(this, 'menuMusic'))
    gameManager.audioManager.preload(this, Object.keys(AUDIO_CONFIG) as AudioKey[])
    this.cameras.main.setBackgroundColor('#000000')
    if (!this.anims.exists('loading-condor')) this.anims.create({ key: 'loading-condor', frames: [SCENE_ASSETS.condorSide1, SCENE_ASSETS.condorSide2, SCENE_ASSETS.condorSide3, SCENE_ASSETS.condorSide4, SCENE_ASSETS.condorSide5, SCENE_ASSETS.condorSide6].map(asset => ({ key: asset.key })), frameRate: 8, repeat: -1 })
    this.add.sprite(640, 320, SCENE_ASSETS.condorSide1.key).setDisplaySize(240, 240).play('loading-condor')
    this.add.text(640, 454, TEXTS.loading, { fontSize: '38px', color: '#ffffff' }).setOrigin(0.5)
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
