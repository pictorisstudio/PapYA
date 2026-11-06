import Phaser from 'phaser'
import { TROMPO_ASSETS } from '../config/assets'
import { MATCH_ARENA, type MatchBody } from '../multiplayer/TrompoMatch'
import TrompoJoystick from '../minigames/trompo/systems/TrompoJoystick'
import { TROMPO_CONFIG } from '../minigames/trompo/config/trompoConfig'
import { gameManager } from '../core/GameManager'
import { requestGameFullscreen } from '../utils/fullscreen'

interface Credentials { code: string; token: string; player: number }
interface Snapshot {
  status: string
  scores: number[]
  bodies: MatchBody[]
  winner: number | null
  round: number
  countdown: number
  wins?: number[]
  matchNumber?: number
  rematch?: boolean[]
}

// Modo independiente: no usa GameManager.completeCurrentMinigame ni guarda rutas.
export default class TrompoMultiplayerScene extends Phaser.Scene {
  private credentials?: Credentials
  private snapshot?: Snapshot
  private panel?: HTMLDivElement
  private message?: HTMLParagraphElement
  private codeInput?: HTMLInputElement
  private interval?: ReturnType<typeof setInterval>
  private disposed = false
  private busy = false
  private polling = false
  private inMatch = false
  private resultShown = false
  private rematchMatch?: number
  private snapshotAt = 0
  private halfRtt = 0
  private joystick = new TrompoJoystick()
  private art: Phaser.GameObjects.Image[] = []
  private stick?: Phaser.GameObjects.Arc
  private scoreText?: Phaser.GameObjects.Text
  private winsText?: Phaser.GameObjects.Text
  private statusText?: Phaser.GameObjects.Text
  constructor() { super('TrompoMultiplayerScene') }

  create(): void {
    this.disposed = false; this.busy = false; this.polling = false; this.inMatch = false
    this.resultShown = false
    this.rematchMatch = undefined
    this.halfRtt = 0
    this.winsText = undefined
    this.statusText = undefined
    this.credentials = undefined; this.snapshot = undefined; this.art = []; this.joystick.cancel()
    this.cameras.main.setBackgroundColor('#142c29')
    this.add.image(640, 360, TROMPO_ASSETS.background.key).setDisplaySize(1280, 720).setDepth(-100)
    gameManager.audioManager.playMusic(this, 'ruanaMusic', 1)
    this.showLobby()
    this.interval = setInterval(() => { void this.poll() }, 80)
    this.input.on('pointerdown', this.down, this)
    this.input.on('pointermove', this.move, this)
    this.input.on('pointerup', this.up, this)
    this.input.on('pointerupoutside', this.up, this)
    window.addEventListener('papya:suspend', this.cancel)
    window.addEventListener('blur', this.cancel)
    window.addEventListener('papya:back', this.back)
    document.addEventListener('visibilitychange', this.cancel)
    this.events.once('shutdown', this.cleanup, this)
  }

  private showLobby(): void {
    this.panel?.remove()
    this.panel = document.createElement('div'); this.panel.className = 'multiplayer-panel'
    const title = document.createElement('h1'); title.textContent = 'Trompos multijugador'
    const rules = document.createElement('p'); rules.textContent = 'Dos jugadores · El primero en sacar 3 veces al rival gana.'
    const create = this.button('Crear sala', () => { void this.connect('create') })
    this.codeInput = document.createElement('input'); this.codeInput.placeholder = 'Código de sala'
    this.codeInput.setAttribute('aria-label', 'Código de sala'); this.codeInput.maxLength = 6
    this.codeInput.autocomplete = 'off'; this.codeInput.spellcheck = false
    const join = this.button('Entrar con código', () => { void this.connect('join') })
    this.message = document.createElement('p'); this.message.setAttribute('role', 'status')
    this.panel.append(title, rules, create, this.codeInput, join, this.message,
      this.button('Volver al menú', () => this.exit()))
    document.getElementById('app')!.append(this.panel)
  }

  private button(text: string, action: () => void): HTMLButtonElement {
    const button = document.createElement('button'); button.textContent = text
    button.addEventListener('click', action); return button
  }

  private async api(action: string, data: object): Promise<any> {
    const server = (import.meta.env.VITE_MULTIPLAYER_SERVER_URL ?? '').replace(/\/$/, '')
    const response = await fetch(`${server}/api/multiplayer/${action}`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: AbortSignal.timeout(5000) })
    const result = await response.json().catch(() => ({ error: 'El servidor de salas no está disponible.' }))
    if (!response.ok) throw new Error(result.error ?? 'No se pudo conectar.')
    return result
  }

  private async connect(action: 'create' | 'join'): Promise<void> {
    if (this.busy || this.credentials) return
    const code = this.codeInput?.value.trim().toUpperCase() ?? ''
    if (action === 'join' && !/^[A-F0-9]{6}$/.test(code)) {
      this.message!.textContent = 'Escribe los 6 caracteres del código.'; return
    }
    this.busy = true; this.message!.textContent = 'Conectando…'
    try {
      const credentials = await this.api(action, { code }) as Credentials
      if (this.disposed) { void this.api('leave', credentials).catch(() => {}); return }
      this.credentials = credentials
      this.message!.textContent = `Sala ${credentials.code} · Esperando al otro jugador…`
      this.message!.className = 'room-code'
      this.panel!.querySelectorAll('button,input').forEach(element => {
        if (element.textContent !== 'Volver al menú') (element as HTMLButtonElement).disabled = true
      })
      void requestGameFullscreen()
      await this.poll()
    } catch (error) {
      if (!this.disposed) this.message!.textContent = error instanceof Error ? error.message : 'No se pudo conectar.'
    } finally { this.busy = false }
  }

  private async poll(): Promise<void> {
    if (!this.credentials || this.disposed || this.polling) return
    this.polling = true
    try {
      const sentAt = performance.now()
      const snapshot = await this.api('state', { ...this.credentials,
        rematchMatch: this.rematchMatch,
        input: document.hidden || window.innerHeight >= window.innerWidth ? { x: 0, y: 0 } : this.joystick.direction }) as Snapshot
      if (this.disposed) return
      const previous = this.snapshot
      this.snapshot = snapshot
      this.snapshotAt = performance.now()
      this.halfRtt = Math.min(80, (this.snapshotAt - sentAt) / 2)
      this.winsText?.setText(this.seriesScore())
      if (snapshot.status === 'playing' && !this.inMatch) this.startMatch()
      if (snapshot.status === 'playing' && this.resultShown) {
        this.panel?.remove()
        this.panel = undefined
        this.message = undefined
        this.resultShown = false
        this.rematchMatch = undefined
      }
      if (snapshot.round !== previous?.round || snapshot.matchNumber !== previous?.matchNumber) {
        this.art.forEach((art, index) => art.setPosition(snapshot.bodies[index]!.x, snapshot.bodies[index]!.y))
      }
      if (snapshot.status === 'abandoned' && previous?.status === 'finished') this.resultShown = false
      if (snapshot.status === 'finished' || snapshot.status === 'abandoned') this.showResult()
      if (snapshot.status === 'finished' && this.rematchMatch !== undefined && this.message) {
        this.message.textContent = snapshot.rematch?.[this.credentials.player]
          ? 'Esperando que tu rival acepte…' : 'Enviando la revancha…'
      }
    } catch (error) {
      if (this.disposed) return
      const text = error instanceof Error ? error.message : 'Conexión interrumpida'
      this.statusText?.setText('Reconectando…')
      if (this.message) this.message.textContent = text
    } finally { this.polling = false }
  }

  private startMatch(): void {
    this.inMatch = true; this.panel?.remove(); this.panel = undefined
    this.message = undefined
    const { x, y, radius } = MATCH_ARENA
    this.add.image(x, y, TROMPO_ASSETS.arena.key).setDisplaySize(radius * 2 * 64 / 52, radius * 2 * 64 / 52)
    this.add.graphics().lineStyle(3, 0xffe4a3, 0.7).strokeCircle(x, y, radius)
    this.art = [TROMPO_ASSETS.player, TROMPO_ASSETS.enemy].map((asset, index) =>
      this.add.image(this.snapshot!.bodies[index]!.x, this.snapshot!.bodies[index]!.y, asset.key).setDisplaySize(92, 92).setDepth(700))
    const style = { fontSize: '34px', color: '#ffffff', stroke: '#142c29', strokeThickness: 5 }
    this.add.text(48, 26, 'Duelo online · Primero a 3', style).setDepth(1200)
    this.scoreText = this.add.text(48, 80, '', style).setDepth(1200)
    this.winsText = this.add.text(48, 128, this.seriesScore(), { ...style, fontSize: '25px' }).setDepth(1200)
    this.statusText = this.add.text(600, 130, '', { ...style, fontSize: '28px' }).setOrigin(0.5).setDepth(1200)
    this.add.text(600, 680, `Tú: ${this.credentials!.player === 0 ? 'trompo multicolor' : 'trompo morado'}`, { ...style, fontSize: '24px' }).setOrigin(0.5).setDepth(1200)
    const stick = TROMPO_CONFIG.JOYSTICK
    this.add.circle(stick.x, stick.y, stick.radius, 0x102d32, 0.7).setStrokeStyle(4, 0x7dd3fc).setDepth(1200)
    this.stick = this.add.circle(stick.x, stick.y, 43, 0x38bdf8).setDepth(1201)
    this.add.text(1215, 40, 'Salir', { ...style, fontSize: '28px' }).setOrigin(1, 0)
      .setDepth(1200).setInteractive().on('pointerdown', () => this.exit())
  }

  update(_time: number, delta: number): void {
    if (!this.inMatch || !this.snapshot || !this.credentials) return
    const state = this.snapshot, player = this.credentials.player
    this.scoreText?.setText(`Tú ${state.scores[player]}/3  ·  Rival ${state.scores[1 - player]}/3`)
    const snapshotAge = performance.now() - this.snapshotAt
    this.statusText?.setText(snapshotAge > 700 ? 'Reconectando…' : state.countdown > 0 ? '¡Prepárate!' : `Ronda ${state.round}`)
    const { x, y } = this.joystick.direction, stick = TROMPO_CONFIG.JOYSTICK
    // Proyección visual breve. El servidor sigue resolviendo choques y puntos.
    const lead = state.status === 'playing' && state.countdown <= 0
      ? Math.min(100, snapshotAge + this.halfRtt) / 1000 : 0
    this.art.forEach((art, index) => {
      const body = state.bodies[index]!
      const localLead = index === player && lead > 0 ? 10 : 0
      const factor = Math.min(1, delta / 35)
      art.setPosition(
        Phaser.Math.Linear(art.x, body.x + body.vx * lead + x * localLead, factor),
        Phaser.Math.Linear(art.y, body.y + body.vy * lead + y * localLead, factor),
      )
      art.rotation += delta * (index === 0 ? 0.016 : -0.019)
    })
    this.stick?.setPosition(stick.x + x * 62, stick.y + y * 62)
  }

  private seriesScore(): string {
    const player = this.credentials!.player
    const wins = this.snapshot?.wins ?? [0, 0]
    return `Partidas · Tú ${wins[player]} – ${wins[1 - player]} Rival`
  }

  private showResult(): void {
    if (this.resultShown) return
    this.resultShown = true
    this.joystick.cancel()
    this.panel?.remove(); this.panel = document.createElement('div'); this.panel.className = 'multiplayer-panel'
    const title = document.createElement('h1'), score = document.createElement('p')
    const state = this.snapshot!, player = this.credentials!.player
    title.textContent = state.status === 'abandoned' ? 'La sala se cerró' : state.winner === player ? '¡Ganaste el duelo!' : '¡Buena partida!'
    score.textContent = `Tú ${state.scores[player]} · Rival ${state.scores[1 - player]}`
    const series = document.createElement('p')
    series.textContent = this.seriesScore()
    this.panel.append(title, score, series)
    this.message = undefined
    if (state.status === 'finished') {
      const prompt = document.createElement('p')
      prompt.textContent = '¿Revancha o miedo?'
      this.message = document.createElement('p')
      this.message.setAttribute('role', 'status')
      const rematch = this.button('Revancha', () => {
        this.rematchMatch = state.matchNumber ?? 1
        rematch.disabled = true
        this.message!.textContent = 'Enviando la revancha…'
        void this.poll()
      })
      this.panel.append(prompt, rematch, this.button('Rendirse e irse', () => this.exit()), this.message)
    } else {
      this.panel.append(this.button('Volver al menú', () => this.exit()))
    }
    document.getElementById('app')!.append(this.panel)
  }
  private down(pointer: Phaser.Input.Pointer, objects: Phaser.GameObjects.GameObject[] = []): void {
    if (!this.inMatch || this.panel || objects.length) return
    const p = this.cameras.main.getWorldPoint(pointer.x, pointer.y); this.joystick.start(pointer.id, p.x, p.y)
    void this.poll()
  }
  private move(pointer: Phaser.Input.Pointer): void {
    const p = this.cameras.main.getWorldPoint(pointer.x, pointer.y); this.joystick.move(pointer.id, p.x, p.y)
  }
  private up(pointer: Phaser.Input.Pointer): void {
    this.joystick.release(pointer.id)
    void this.poll()
  }
  private cancel = (): void => { this.joystick.cancel() }
  private back = (event: Event): void => { event.preventDefault(); this.exit() }
  private exit(): void { this.scene.start('MenuScene') }
  private cleanup(): void {
    this.disposed = true; this.cancel(); clearInterval(this.interval); this.panel?.remove(); this.panel = undefined
    if (this.credentials) void this.api('leave', this.credentials).catch(() => {})
    this.input.off('pointerdown', this.down, this); this.input.off('pointermove', this.move, this)
    this.input.off('pointerup', this.up, this); this.input.off('pointerupoutside', this.up, this)
    window.removeEventListener('papya:suspend', this.cancel); window.removeEventListener('blur', this.cancel)
    window.removeEventListener('papya:back', this.back); document.removeEventListener('visibilitychange', this.cancel)
  }
}
