import Phaser from 'phaser'
import { PAPA_CONFIG } from '../config/papaConfig'

export default class FieldDisplay {
  constructor(scene: Phaser.Scene) {
    scene.cameras.main.setBackgroundColor(PAPA_CONFIG.COLORS.skyTop)

    // TODO: reemplazar por fondo pixel art final de Boyacá.
    scene.add.rectangle(640, 180, 1280, 360, PAPA_CONFIG.COLORS.skyTop)
    scene.add.rectangle(640, 430, 1280, 250, PAPA_CONFIG.COLORS.skyBottom, 0.85)
    scene.add.triangle(270, 446, -80, 80, 190, -80, 540, 88, PAPA_CONFIG.COLORS.hills, 0.82)
    scene.add.triangle(770, 454, -120, 96, 230, -110, 620, 100, 0x5f9465, 0.78)
    scene.add.circle(1080, 96, 42, 0xf9d67a, 0.9)

    // TODO: reemplazar por cultivo de papa pixel art final.
    scene.add.rectangle(640, 632, 1280, 176, PAPA_CONFIG.COLORS.field)

    for (let index = 0; index < 9; index += 1) {
      const y = PAPA_CONFIG.FIELD_TOP_Y + index * 17
      scene.add.ellipse(640, y, 1320, 22, PAPA_CONFIG.COLORS.furrow, 0.24)
    }

    scene.add.rectangle(640, PAPA_CONFIG.FIELD_TOP_Y, 1280, 8, 0x2f6f45, 0.9)
  }
}
