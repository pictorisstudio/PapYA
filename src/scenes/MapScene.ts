import { SCENE_ASSETS } from '../config/sceneAssets'
import { requestFullscreenOnPlay } from '../utils/fullscreen'
import { TEXTS } from '../config/texts'
import Phaser from 'phaser'
import DebugPanel from '../components/DebugPanel'
import { TOTAL_ROUTES } from '../config/constants'
import { MAP_POSTCARDS } from '../config/mapPostcards'
import { MENU_UI_ASSETS } from '../config/uiAssets'
import { LAYERS } from '../config/layers'
import type { RouteId } from '../types/SaveData'
import { gameManager } from '../core/GameManager'

export default class MapScene extends Phaser.Scene {
  private routeCard?: Phaser.GameObjects.Container
  constructor() {
    super('MapScene')
  }

  create(): void {
    gameManager.audioManager.playMusic(this, 'menuMusic')
    this.routeCard = undefined
    this.cameras.main.setBackgroundColor('#10131a')

    const save = gameManager.progressManager.getSaveData()
    const mapStages = [SCENE_ASSETS.map0, SCENE_ASSETS.map1, SCENE_ASSETS.map2, SCENE_ASSETS.map3, SCENE_ASSETS.map4, SCENE_ASSETS.map5]
    this.add.image(977.78, 95.63, mapStages[Math.min(5, save.unlockedRoutes.length)]!.key).setDisplaySize(240, 135)

    this.add.text(74.01, 48, TEXTS.mapTitle, { fontSize: '42px', fontStyle: '700', color: '#f8fafc' })
    this.add.text(76, 100, TEXTS.routes(save.unlockedRoutes.length, TOTAL_ROUTES), {
      fontSize: '28px',
      color: '#aab3c5',
    })
    this.add.text(76, 130, TEXTS.record(save.bestVictories, 5, save.recordScore), {
      fontSize: '26px',
      color: '#aab3c5',
    })

    gameManager.progressManager.routes.forEach((routeId, index) => {
      const { state, label, blocked } = this.routeInfo(routeId)
      const x = 200 + index * 220
      const y = 349
      const border = state === 'unlocked' ? 0x34d399 : state === 'next' ? 0xfbbf24 : 0x64748b
      const card = this.add.rectangle(x, y, 200, 300, 0x202d40).setStrokeStyle(3, border)
      if (!blocked) {
        card.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.openRouteCard(routeId, index + 1))
      }
      const route = MAP_POSTCARDS[routeId]
      this.add.text(x, y - 123, this.routeNumber(index + 1), { fontSize: '22px', color: '#f8fafc' }).setOrigin(0.5)
      const icon = this.add.image(x, y - 32, this.routeTexture(routeId, blocked)).setDisplaySize(132, 132)
      if (blocked) {
        icon.setTint(0x8b95a7)
        this.addLock(x, y - 32, 0.48)
      }
      this.add.text(x, y + 76, route.label.toUpperCase(), {
        fontSize: '21px', color: '#f8fafc', align: 'center', wordWrap: { width: 182 },
      }).setOrigin(0.5)
      this.add.text(x, y + 123, label, { fontSize: '18px', color: blocked ? '#cbd5e1' : '#6ee7b7' }).setOrigin(0.5)
    })

    this.addArtButton(432, SCENE_ASSETS.travelButton.key, 290, 105, () => {
      requestFullscreenOnPlay()
      gameManager.startNewRun()
      this.scene.start('TransitionScene')
    })

    this.addArtButton(848, MENU_UI_ASSETS.menu.key, 290, 111, () => this.scene.start('MenuScene'))

    new DebugPanel(this)
    this.game.events.on('debug:progress-changed', this.refreshProgress, this)
    this.input.keyboard?.on('keydown-ESC', this.closeRouteCard, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.closeRouteCard()
      this.game.events.off('debug:progress-changed', this.refreshProgress, this)
      this.input.keyboard?.off('keydown-ESC', this.closeRouteCard, this)
    })
  }

  private refreshProgress(): void { this.scene.restart() }

  private routeInfo(routeId: RouteId) {
    const state = gameManager.progressManager.getRouteState(routeId)
    return { state, blocked: state !== 'unlocked',
      label: state === 'unlocked' ? TEXTS.routeOpen : state === 'next' ? TEXTS.routeNext : TEXTS.routeLocked }
  }

  private openRouteCard(routeId: RouteId, number: number): void {
    if (this.routeCard || this.routeInfo(routeId).blocked) return
    const route = MAP_POSTCARDS[routeId]
    const backdrop = this.add.rectangle(640, 360, 1280, 720, 0x05070c, 0.88)
      .setInteractive()
    const paper = route.paper && this.textures.exists(route.paper.key)
      ? this.add.image(640, 326, route.paper.key).setDisplaySize(1080, 500)
      : this.add.rectangle(640, 326, 1080, 500, 0xffefd0).setStrokeStyle(4, 0xc38c55)
    const stampBorder = this.add.rectangle(314, 326, 256, 256, 0xfff9e9).setStrokeStyle(3, 0xab7550)
    const stamp = this.add.image(314, 326, route.icon.key).setDisplaySize(220, 220)
    const divider = this.add.rectangle(500, 326, 2, 360, 0xab7550, 0.65)
    const caption = this.add.text(548, 145, `${this.routeNumber(number)} · ${route.label.toUpperCase()}`, {
      fontSize: '22px', color: '#70432c',
    })
    const title = this.add.text(548, 195, route.title, { fontSize: '38px', color: '#302016' })
    const fact = this.add.text(548, 270, `Dato curioso: ${route.fact}`, {
      fontSize: '25px', color: '#39291e', lineSpacing: 7, wordWrap: { width: 570 },
    })
    const close = this.add.rectangle(640, 629, 306, 60, 0xfbbf24)
      .setInteractive({ useHandCursor: true }).on('pointerdown', () => this.closeRouteCard())
    const closeLabel = this.add.text(640, 629, TEXTS.closeCard, {
      fontSize: '28px', color: '#1f2937',
    }).setOrigin(0.5)
    this.routeCard = this.add.container(0, 0, [
      backdrop, paper, stampBorder, stamp, divider, caption, title, fact, close, closeLabel,
    ]).setDepth(LAYERS.overlay)
  }

  private routeNumber(number: number): string {
    return `RUTA ${String(number).padStart(2, '0')}`
  }

  private routeTexture(routeId: RouteId, blocked: boolean): string {
    const original = MAP_POSTCARDS[routeId].icon.key
    if (!blocked) return original
    const key = `${original}-blocked`
    if (!this.textures.exists(key)) {
      const source = this.textures.get(original).getSourceImage() as HTMLImageElement
      const texture = this.textures.createCanvas(key, source.width, source.height)
      if (!texture) return original
      const context = texture.context
      context.save()
      // Se calcula una vez por imagen, sin filtros GPU por cuadro.
      context.filter = `blur(${Math.max(source.width, source.height) * 0.018}px)`
      context.drawImage(source, 0, 0)
      context.restore()
      texture.refresh()
    }
    return key
  }

  private addLock(x: number, y: number, scale: number): Phaser.GameObjects.Container {
    const background = this.add.circle(0, 0, 48, 0x10131a, 0.85)
    const icon = this.add.graphics()
    icon.lineStyle(7, 0xfbbf24)
    icon.strokeRoundedRect(-20, -36, 40, 44, 18)
    icon.fillStyle(0xfbbf24)
    icon.fillRoundedRect(-30, -8, 60, 44, 7)
    icon.fillStyle(0x10131a)
    icon.fillCircle(0, 8, 5)
    icon.fillRect(-3, 8, 6, 14)
    return this.add.container(x, y, [background, icon]).setScale(scale)
  }

  closeRouteCard(): boolean {
    if (!this.routeCard) return false
    this.routeCard.destroy(true)
    this.routeCard = undefined
    return true
  }

  private addArtButton(x: number, key: string, width: number, height: number, action: () => void): void {
    this.add.image(x, 613, key, 'button').setDisplaySize(width, height)
      .setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        if (!this.routeCard) action()
      })
  }
}
