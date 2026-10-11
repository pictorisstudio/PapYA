import { TEXTS } from '../config/texts'
import { COCINA_ASSETS, TEJO_ASSETS, POTATO_ASSETS, ROUTE_CARD_ASSETS } from '../config/assets'
import Phaser from 'phaser'

export default class PreloaderScene extends Phaser.Scene {

  constructor() {
    super('PreloaderScene')
  }

  preload(): void {
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

  create(): void { this.scene.start('MenuScene') }
}
