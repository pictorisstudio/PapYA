import Phaser from 'phaser'

export async function prepareGameFont(): Promise<void> {
  await document.fonts.load('16px "VCR OSD Mono"')
  Phaser.GameObjects.GameObjectFactory.remove('text')
  Phaser.GameObjects.GameObjectFactory.register('text', function (
    this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, text: string | string[],
    style: Phaser.Types.GameObjects.Text.TextStyle = {},
  ) {
    return this.displayList.add(new Phaser.GameObjects.Text(this.scene, x, y, text,
      { ...style, fontFamily: 'VCR OSD Mono' }))
  })
}
