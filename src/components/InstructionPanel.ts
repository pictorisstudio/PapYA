import Phaser from 'phaser'

export default class InstructionPanel {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
    scene.add.rectangle(x, y, 760, 86, 0x111827, 0.88).setStrokeStyle(2, 0x2f405f)
    scene.add
      .text(x, y, text, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#d8dee9',
        align: 'center',
        wordWrap: { width: 680 },
      })
      .setOrigin(0.5)
  }
}
