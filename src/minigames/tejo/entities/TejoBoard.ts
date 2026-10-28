import { SCENE_ASSETS } from '../../../config/sceneAssets'
import { LAYERS } from '../../../config/layers'
import { TEJO_ASSETS } from '../../../config/assets'
import Phaser from 'phaser'
import { TEJO_CONFIG } from '../config/tejoConfig'
import type { TejoImpactResult, TejoPoint } from '../types/TejoTypes'

interface MechaZone extends TejoPoint {
  radius: number
  active: boolean
}

export default class TejoBoard {
  private readonly graphics: Phaser.GameObjects.Graphics
  private readonly debugGraphics: Phaser.GameObjects.Graphics
  private readonly impactGraphics: Phaser.GameObjects.Graphics
  private readonly mechas: MechaZone[]
  private readonly mechaArt: Phaser.GameObjects.Image[] = []
  private readonly mechaSprites = new Map<MechaZone, Phaser.GameObjects.Image>()

  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(LAYERS.background)
    this.debugGraphics = scene.add.graphics().setDepth(900)
    this.impactGraphics = scene.add.graphics().setDepth(920)
    this.mechas = this.createMechaZones()
    this.mechaArt.push(scene.add.image(640, TEJO_CONFIG.BOARD_Y - 135, TEJO_ASSETS.cancha.key).setDisplaySize(520, 480).setDepth(LAYERS.scenery - 2))
    this.draw()
    // Anclado al suelo: eleva el blanco pintado hasta la zona real de impacto.
    this.mechaArt.push(scene.add.image(640, 720, SCENE_ASSETS.tejoBackground.key).setOrigin(0.5, 1).setDisplaySize(1280, 720).setDepth(LAYERS.background + 1))
    this.mechaArt.push(scene.add.image(640, TEJO_CONFIG.BOARD_Y, TEJO_ASSETS.bocin.key).setDisplaySize(104, 104).setDepth(LAYERS.scenery - 1))
    for (const mecha of this.mechas) {
      const sprite = scene.add.image(mecha.x, mecha.y, TEJO_ASSETS.mecha.key).setDisplaySize(60, 60).setDepth(LAYERS.scenery)
      this.mechaArt.push(sprite)
      this.mechaSprites.set(mecha, sprite)
    }
  }

  getBocinCenter(): TejoPoint {
    return { x: TEJO_CONFIG.BOARD_CENTER_X, y: TEJO_CONFIG.BOARD_Y }
  }

  getMechaZones(): readonly MechaZone[] {
    return this.mechas.filter(mecha => mecha.active)
  }

  consumeMecha(point: TejoPoint): boolean {
    const mecha = this.getMechaZones().find(zone => Phaser.Math.Distance.Between(point.x, point.y, zone.x, zone.y) <= zone.radius)
    if (!mecha) return false
    mecha.active = false
    this.mechaSprites.get(mecha)?.setVisible(false)
    this.debugGraphics.clear()
    return true
  }

  setDebugVisible(visible: boolean): void {
    this.debugGraphics.clear()

    if (!visible) {
      return
    }

    this.debugGraphics.lineStyle(3, TEJO_CONFIG.COLORS.near, 0.55)
    this.debugGraphics.strokeCircle(TEJO_CONFIG.BOARD_CENTER_X, TEJO_CONFIG.BOARD_Y, TEJO_CONFIG.NEAR_RADIUS)
    this.debugGraphics.lineStyle(2, TEJO_CONFIG.COLORS.touchArea, 0.82)
    this.debugGraphics.strokeCircle(TEJO_CONFIG.BOARD_CENTER_X, TEJO_CONFIG.BOARD_Y, TEJO_CONFIG.BOCIN_RADIUS)

    for (const mecha of this.getMechaZones()) {
      this.debugGraphics.strokeCircle(mecha.x, mecha.y, mecha.radius)
    }
  }

  showImpactPoint(point: TejoPoint, result: TejoImpactResult): void {
    this.impactGraphics.clear()
    const color =
      result === 'MECHA' ? TEJO_CONFIG.COLORS.mecha : result === 'NEAR' ? TEJO_CONFIG.COLORS.near : TEJO_CONFIG.COLORS.impactPoint
    this.impactGraphics.fillStyle(color, 0.95)
    this.impactGraphics.fillCircle(point.x, point.y, 8)
    this.impactGraphics.lineStyle(2, 0xffffff, 0.85)
    this.impactGraphics.strokeCircle(point.x, point.y, 14)
  }

  clearImpactPoint(): void {
    this.impactGraphics.clear()
  }

  flashResult(point: TejoPoint, result: TejoImpactResult): void {
    if (result === 'MECHA') {
      const burst = this.scene.add.image(point.x, point.y - 20, TEJO_ASSETS.explosion.key).setDisplaySize(120, 160).setDepth(940)
      this.scene.tweens.add({ targets: burst, alpha: 0, duration: 450, onComplete: () => burst.destroy() })
    }
  }

  destroy(): void {
    for (const image of this.mechaArt) image.destroy()
    this.graphics.destroy()
    this.debugGraphics.destroy()
    this.impactGraphics.destroy()
  }

  private draw(): void {
    this.graphics.clear()
    this.drawCourt()
    this.drawBoard()
  }

  private drawCourt(): void {
    const topLeft = TEJO_CONFIG.BOARD_CENTER_X - TEJO_CONFIG.COURT_TOP_WIDTH / 2
    const topRight = TEJO_CONFIG.BOARD_CENTER_X + TEJO_CONFIG.COURT_TOP_WIDTH / 2
    const bottomLeft = TEJO_CONFIG.BOARD_CENTER_X - TEJO_CONFIG.COURT_BOTTOM_WIDTH / 2
    const bottomRight = TEJO_CONFIG.BOARD_CENTER_X + TEJO_CONFIG.COURT_BOTTOM_WIDTH / 2

    this.graphics.fillStyle(TEJO_CONFIG.COLORS.background, 1)
    this.graphics.fillRect(0, 0, 1280, 720)
    this.graphics.fillStyle(TEJO_CONFIG.COLORS.court, 1)
    this.graphics.fillPoints(
      [
        new Phaser.Math.Vector2(topLeft, TEJO_CONFIG.COURT_TOP_Y),
        new Phaser.Math.Vector2(topRight, TEJO_CONFIG.COURT_TOP_Y),
        new Phaser.Math.Vector2(bottomRight, TEJO_CONFIG.COURT_BOTTOM_Y),
        new Phaser.Math.Vector2(bottomLeft, TEJO_CONFIG.COURT_BOTTOM_Y),
      ],
      true,
    )
    this.graphics.lineStyle(4, TEJO_CONFIG.COLORS.courtLine, 0.72)
    this.graphics.strokeLineShape(new Phaser.Geom.Line(topLeft, TEJO_CONFIG.COURT_TOP_Y, bottomLeft, TEJO_CONFIG.COURT_BOTTOM_Y))
    this.graphics.strokeLineShape(new Phaser.Geom.Line(topRight, TEJO_CONFIG.COURT_TOP_Y, bottomRight, TEJO_CONFIG.COURT_BOTTOM_Y))

    this.graphics.fillStyle(TEJO_CONFIG.COLORS.launchZone, 0.92)
    this.graphics.fillRoundedRect(470, 584, 340, 90, 18)
  }

  private drawBoard(): void {}

  private createMechaZones(): MechaZone[] {
    return [
      { x: TEJO_CONFIG.BOARD_CENTER_X - 72, y: TEJO_CONFIG.BOARD_Y - 42, radius: TEJO_CONFIG.MECHA_RADIUS, active: true },
      { x: TEJO_CONFIG.BOARD_CENTER_X + 72, y: TEJO_CONFIG.BOARD_Y - 42, radius: TEJO_CONFIG.MECHA_RADIUS, active: true },
      { x: TEJO_CONFIG.BOARD_CENTER_X - 72, y: TEJO_CONFIG.BOARD_Y + 42, radius: TEJO_CONFIG.MECHA_RADIUS, active: true },
      { x: TEJO_CONFIG.BOARD_CENTER_X + 72, y: TEJO_CONFIG.BOARD_Y + 42, radius: TEJO_CONFIG.MECHA_RADIUS, active: true },
    ]
  }
}
