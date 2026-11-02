import Phaser from 'phaser'
import GameplaySession from '../../components/GameplaySession'
import DebugPanel from '../../components/DebugPanel'
import { gameManager } from '../../core/GameManager'
import { LAYERS } from '../../config/layers'
import { TEXTS } from '../../config/texts'
import { TROMPO_ASSETS } from '../../config/assets'
import { TROMPO_CONFIG as C } from './config/trompoConfig'
import TrompoJoystick from './systems/TrompoJoystick'
import TrompoSimulation, { type TopBody } from './systems/TrompoSimulation'

// El arte se mantiene separado de la simulación y del joystick.
export default class TrompoScene extends Phaser.Scene {
  private simulation!: TrompoSimulation
  private joystick!: TrompoJoystick
  private session?: GameplaySession
  private playerArt!: Phaser.GameObjects.Container
  private enemyArt!: Phaser.GameObjects.Container
  private playerShadow!: Phaser.GameObjects.Ellipse
  private enemyShadow!: Phaser.GameObjects.Ellipse
  private playerLabel!: Phaser.GameObjects.Text
  private enemyLabel!: Phaser.GameObjects.Text
  private stick!: Phaser.GameObjects.Arc
  private elapsedMs = 0
  private finished = false

  constructor() { super('TrompoScene') }

  create(): void {
    this.simulation = new TrompoSimulation()
    this.joystick = new TrompoJoystick()
    this.elapsedMs = 0
    this.finished = false
    this.drawArena()
    this.playerShadow = this.add.ellipse(0, 0, 82, 32, 0x142c29, 0.28).setDepth(100)
    this.enemyShadow = this.add.ellipse(0, 0, 82, 32, 0x142c29, 0.28).setDepth(100)
    this.playerArt = this.createTop(TROMPO_ASSETS.player.key)
    this.enemyArt = this.createTop(TROMPO_ASSETS.enemy.key)
    this.playerLabel = this.add.text(0, 0, TEXTS.minigames.trompo.player,
      { fontSize: '24px', fontStyle: 'bold', color: '#7dd3fc', stroke: '#102d32', strokeThickness: 5 }).setOrigin(0.5).setDepth(1050)
    this.enemyLabel = this.add.text(0, 0, TEXTS.minigames.trompo.rival,
      { fontSize: '24px', fontStyle: 'bold', color: '#ffb579', stroke: '#102d32', strokeThickness: 5 }).setOrigin(0.5).setDepth(1050)
    this.drawJoystick()
    this.input.on('pointerdown', this.pointerDown, this)
    this.input.on('pointermove', this.pointerMove, this)
    this.input.on('pointerup', this.pointerUp, this)
    this.input.on('pointerupoutside', this.pointerUp, this)
    this.input.on('gameout', this.cancelInput, this)
    this.session = new GameplaySession(this, {
      remainingMs: () => Math.max(0, C.GAME_DURATION_MS - this.elapsedMs) / gameManager.pace,
      cancelInput: this.cancelInput, debugFinish: won => this.finish(won),
    })
    new DebugPanel(this)
    this.renderBodies(0)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cancelInput()
      this.input.off('pointerdown', this.pointerDown, this)
      this.input.off('pointermove', this.pointerMove, this)
      this.input.off('pointerup', this.pointerUp, this)
      this.input.off('pointerupoutside', this.pointerUp, this)
      this.input.off('gameout', this.cancelInput, this)
    })
  }

  update(_time: number, delta: number): void {
    if (this.finished) return
    // Evitar saltos de simulación al recuperar la pestaña; pausa comparte este reloj.
    const step = Math.min(delta, 100) * gameManager.pace
    this.elapsedMs += step
    const before = this.simulation.collisions
    this.simulation.update(step, this.joystick.direction)
    this.renderBodies(step)
    if (this.simulation.collisions > before) this.showImpact()
    if (this.simulation.winner) this.finish(this.simulation.winner === 'player')
    else if (this.elapsedMs >= C.GAME_DURATION_MS) this.finish(false)
  }

  private pointerDown(pointer: Phaser.Input.Pointer, objects: Phaser.GameObjects.GameObject[] = []): void {
    if (this.finished || objects.length) return
    const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
    this.joystick.start(pointer.id, point.x, point.y)
  }

  private pointerMove(pointer: Phaser.Input.Pointer): void {
    const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
    this.joystick.move(pointer.id, point.x, point.y)
  }

  private pointerUp(pointer: Phaser.Input.Pointer): void { this.joystick.release(pointer.id) }
  private cancelInput = (): void => {
    this.joystick?.cancel()
    this.stick?.setPosition(C.JOYSTICK.x, C.JOYSTICK.y)
  }

  private finish(won: boolean): void {
    if (this.finished) return
    this.finished = true
    this.cancelInput()
    this.session?.complete({ key: 'trompo', won, rawScore: won ? 100 : 0,
      metrics: { collisions: this.simulation.collisions, elapsedMs: this.elapsedMs } })
  }

  private drawArena(): void {
    this.cameras.main.setBackgroundColor('#24483d')
    this.add.image(640, 360, TROMPO_ASSETS.background.key).setDisplaySize(1280, 720).setDepth(LAYERS.background)
    const { x, y, radius } = C.ARENA
    const size = radius * 2 * 64 / 52
    this.add.image(x, y, TROMPO_ASSETS.arena.key).setDisplaySize(size, size).setDepth(0)
    this.add.graphics().setDepth(1).lineStyle(3, 0xffe4a3, 0.7).strokeCircle(x, y, radius)
  }

  private createTop(key: string): Phaser.GameObjects.Container {
    const art = this.add.image(0, 0, key).setDisplaySize(92, 92)
    return this.add.container(0, 0, [art]).setDepth(600)
  }

  private drawJoystick(): void {
    const { x, y, radius } = C.JOYSTICK
    this.add.circle(x, y, radius, 0x102d32, 0.65).setStrokeStyle(4, 0x7dd3fc, 0.8).setDepth(1150)
    const arrows = this.add.graphics().setDepth(1151)
    for (const direction of [-1, 1]) {
      arrows.fillStyle(0x7dd3fc, 0.6)
      arrows.fillTriangle(x + direction * 84, y, x + direction * 64, y - 12, x + direction * 64, y + 12)
      arrows.fillTriangle(x, y + direction * 84, x - 12, y + direction * 64, x + 12, y + direction * 64)
    }
    this.stick = this.add.circle(x, y, 43, 0x38bdf8).setStrokeStyle(4, 0xe0f2fe).setDepth(1152)
  }

  private renderBodies(delta: number): void {
    const render = (body: TopBody, art: Phaser.GameObjects.Container, shadow: Phaser.GameObjects.Ellipse, label: Phaser.GameObjects.Text, spin: number) => {
      art.setPosition(body.x, body.y).setDepth(300 + body.y)
      art.rotation += delta / 1000 * spin
      shadow.setPosition(body.x + 5, body.y + 27)
      label.setPosition(body.x, Math.max(135, body.y - 57))
    }
    render(this.simulation.player, this.playerArt, this.playerShadow, this.playerLabel, 16)
    render(this.simulation.enemy, this.enemyArt, this.enemyShadow, this.enemyLabel, -19)
    const direction = this.joystick.direction
    this.stick.setPosition(C.JOYSTICK.x + direction.x * 62, C.JOYSTICK.y + direction.y * 62)
  }

  private showImpact(): void {
    const { player, enemy } = this.simulation
    const spark = this.add.circle((player.x + enemy.x) / 2, (player.y + enemy.y) / 2, 22, 0xffedb0, 0.8)
      .setStrokeStyle(5, 0xffffff).setDepth(1100)
    this.tweens.add({ targets: spark, scale: 2, alpha: 0, duration: 180, onComplete: () => spark.destroy() })
    gameManager.audioManager.playEffect(this, 'cocuyCollision')
  }
}
