import Phaser from 'phaser'
import { LAYERS } from '../../../config/layers'
import { SCENE_ASSETS } from '../../../config/sceneAssets'

export default class FieldDisplay {
  constructor(scene: Phaser.Scene) {
    scene.add.image(360, 640, SCENE_ASSETS.papaBackground.key).setDisplaySize(2275.56, 1280).setDepth(LAYERS.background)
    scene.add.image(360, 640, SCENE_ASSETS.papaFloor.key).setDisplaySize(2275.56, 1280).setDepth(LAYERS.scenery)
  }
}