import Phaser from 'phaser'
import { LAYERS } from '../../../config/layers'
import { SCENE_ASSETS } from '../../../config/sceneAssets'

export default class FieldDisplay {
  constructor(scene: Phaser.Scene) {
    scene.add.image(640, 360, SCENE_ASSETS.papaBackground.key).setDisplaySize(1280, 720).setDepth(LAYERS.background)
    scene.add.image(640, 360, SCENE_ASSETS.papaFloor.key).setDisplaySize(1280, 720).setDepth(LAYERS.scenery)
  }
}