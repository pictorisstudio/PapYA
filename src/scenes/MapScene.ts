import { SCENE_ASSETS } from '../config/sceneAssets'
import { TEXTS } from '../config/texts'
import Phaser from 'phaser'
import DebugPanel from '../components/DebugPanel'
import { TOTAL_ROUTES } from '../config/constants'
import { ROUTE_CARD_ASSETS } from '../config/assets'
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
    this.add.image(550, 170, mapStages[Math.min(5, save.unlockedRoutes.length)]!.key).setDisplaySize(240, 135)

    this.add.text(41.63, 85.33, TEXTS.mapTitle, { fontSize: '34px', fontStyle: '700', color: '#f8fafc' })
    this.add.text(42.75, 177.78, TEXTS.routes(save.unlockedRoutes.length, TOTAL_ROUTES), {
      fontSize: '22px',
      color: '#aab3c5',
    })
    this.add.text(42.75, 231.11, TEXTS.record(save.bestVictories, 5, save.recordScore), {
      fontSize: '20px',
      color: '#aab3c5',
    })

    gameManager.progressManager.routes.forEach((routeId, index) => {
      const { state, label, blocked } = this.routeInfo(routeId)
      const x = index === 4 ? 360 : 190 + (index % 2) * 340
      const y = 390 + Math.floor(index / 2) * 270
      const color = state === 'unlocked' ? 0x34d399 : state === 'next' ? 0xfbbf24 : 0x334155

      this.add.rectangle(x, y, 280, 230, color, 0.95).setStrokeStyle(4, 0xf8fafc)
        .setInteractive({ useHandCursor: true }).on('pointerdown', () => this.openRouteCard(routeId, index + 1))
      const textColor = state === 'locked' ? '#f8fafc' : '#10131a'
      this.add.text(x, y - 70, TEXTS.routeName(index + 1), { fontSize: '26px', fontStyle: '700', color: textColor }).setOrigin(0.5)
      this.add.text(x, y - 15, label, { fontSize: '17px', color: textColor }).setOrigin(0.5)
      const asset = ROUTE_CARD_ASSETS[routeId]
      if (this.textures.exists(asset.key)) {
        const preview = this.add.image(x, y + 65, this.routeTexture(routeId, blocked))
        preview.setScale(Math.min(136 / preview.width, 60 / preview.height))
        if (blocked) preview.setTint(0x8b95a7)
      }
      if (blocked) this.addLock(x, y + 65, 0.42)
    })

    this.addButton(190, 1140, 280, 68, TEXTS.travel, () => {
      gameManager.startNewRun()
      this.scene.start('TransitionScene')
    })

    this.addButton(530, 1140, 280, 68, TEXTS.explore, () => this.scene.start('ExplorationScene'), !save.explorationUnlocked)
    this.addButton(360, 1230, 280, 60, TEXTS.menu, () => this.scene.start('MenuScene'))

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
    if (this.routeCard) return
    const { label, blocked } = this.routeInfo(routeId)
    const backdrop = this.add.rectangle(360, 640, 720, 1280, 0x05070c, 0.88)
      .setInteractive().on('pointerdown', () => this.closeRouteCard())
    const panel = this.add.rectangle(360, 640, 607.5, 1137.78, 0x172033)
      .setStrokeStyle(3, 0xcbd5e1).setInteractive()
    const title = this.add.text(360, 156.44, `${TEXTS.routeName(number)} · ${label}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '30px', color: '#f8fafc',
    }).setOrigin(0.5)
    const asset = ROUTE_CARD_ASSETS[routeId]
    const art = this.textures.exists(asset.key)
      ? this.add.image(360, 625.78, this.routeTexture(routeId, blocked))
      : this.add.text(360, 625.78, TEXTS.routeName(number), { fontSize: '48px', color: '#6ee7b7' }).setOrigin(0.5)
    if (art instanceof Phaser.GameObjects.Image) {
      art.setScale(Math.min(560 / art.width, 660 / art.height))
      if (blocked) art.setTint(0x8b95a7)
    }
    const close = this.add.rectangle(360, 1098.67, 151.88, 99.56, 0xfbbf24)
      .setInteractive({ useHandCursor: true }).on('pointerdown', () => this.closeRouteCard())
    const closeLabel = this.add.text(360, 1098.67, TEXTS.closeCard, {
      fontFamily: 'Arial, sans-serif', fontSize: '25px', color: '#1f2937',
    }).setOrigin(0.5)
    const contents: Phaser.GameObjects.GameObject[] = [backdrop, panel, title, art]
    if (blocked) contents.push(this.addLock(360, 625.78, 1.6))
    contents.push(close, closeLabel)
    this.routeCard = this.add.container(0, 0, contents).setDepth(LAYERS.overlay)
  }

  private routeTexture(routeId: RouteId, blocked: boolean): string {
    const original = ROUTE_CARD_ASSETS[routeId].key
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

  private addButton(x: number, y: number, width: number, height: number, label: string, action: () => void, disabled = false): void {
    const color = disabled ? 0x475569 : 0xfbbf24
    const button = this.add.rectangle(x, y, width, height, color, 1).setStrokeStyle(2, 0xf8fafc)

    if (!disabled) {
      button.setInteractive({ useHandCursor: true })
      button.on('pointerdown', action)
    }

    this.add
      .text(x, y, label, {
        fontFamily: 'Arial, sans-serif', fontSize: '25px',
        fontStyle: '700',
        color: disabled ? '#cbd5e1' : '#1f2937',
      })
      .setOrigin(0.5)
  }
}
