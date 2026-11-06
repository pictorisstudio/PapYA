import Phaser from 'phaser'
import { TROMPO_ASSETS } from '../config/assets'
import { MATCH_ARENA, type MatchBody } from '../multiplayer/TrompoMatch'
import TrompoJoystick from '../minigames/trompo/systems/TrompoJoystick'
import { TROMPO_CONFIG } from '../minigames/trompo/config/trompoConfig'
import { gameManager } from '../core/GameManager'
import { requestGameFullscreen } from '../utils/fullscreen'

interface Credentials { code: string; token: string; player: number; live?: boolean }
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
  private socket?: WebSocket
  private lastSocketAttempt = -Infinity
  private socketTrafficAt = 0
  private lastSentAt = -Infinity
  private lifecycle = 0
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
  private playerRing?: Phaser.GameObjects.Arc
  private playerTag?: Phaser.GameObjects.Text
  constructor() { super('TrompoMultiplayerScene') }

  create(): void {
    this.lifecycle++
    this.disposed = false; this.busy = false; this.polling = false; this.inMatch = false
    this.resultShown = false
    this.rematchMatch = undefined
    this.halfRtt = 0
    this.lastSocketAttempt = -Infinity
    this.lastSentAt = -Infinity
    this.winsText = undefined
    this.statusText = undefined
    this.credentials = undefined; this.snapshot = undefined; this.art = []; this.joystick.cancel()
    this.cameras.main.setBackgroundColor('#142c29')
    this.add.image(640, 360, TROMPO_ASSETS.background.key).setDisplaySize(1280, 720).setDepth(-100)
    gameManager.audioManager.playMusic(this, 'ruanaMusic', 1)
    this.showLobby()
    this.interval = setInterval(() => this.sync(), 1000 / 30)
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
    this.panel = document.createElement('div'); this.panel.className = 'multiplayer-panel multiplayer-lobby'
    const title = document.createElement('h1'); title.textContent = 'Trompos multijugador'
    const rules = document.createElement('p'); rules.textContent = 'Dos jugadores · El primero en sacar 3 veces al rival gana.'
    const create = this.button('Crear sala', () => { void this.connect('create') })
    this.codeInput = document.createElement('input'); this.codeInput.placeholder = 'Código de sala'
    this.codeInput.setAttribute('aria-label', 'Código de sala'); this.codeInput.maxLength = 6
    this.codeInput.autocomplete = 'off'; this.codeInput.spellcheck = false
    const join = this.button('Entrar', () => { void this.connect('join') })
    const actions = document.createElement('div'); actions.className = 'multiplayer-actions'
    const host = document.createElement('section')
    const hostLabel = document.createElement('p'); hostLabel.textContent = 'Invita a un amigo'
    host.append(hostLabel, create)
    const guest = document.createElement('section')
    const guestLabel = document.createElement('p'); guestLabel.textContent = 'Únete a una sala'
    const joinRow = document.createElement('div'); joinRow.className = 'multiplayer-join'
    joinRow.append(this.codeInput, join)
    guest.append(guestLabel, joinRow)
    actions.append(host, guest)
    this.message = document.createElement('p'); this.message.setAttribute('role', 'status')
    const back = this.button('Volver al menú', () => this.exit())
    back.className = 'multiplayer-secondary'
    this.panel.append(title, rules, actions, this.message, back)
    document.getElementById('app')!.append(this.panel)
  }

  private button(text: string, action: () => void): HTMLButtonElement {
    const button = document.createElement('button'); button.textContent = text
    button.addEventListener('click', action); return button
  }

  private endpoint(action: string): string {
    const server = (import.meta.env.VITE_MULTIPLAYER_SERVER_URL ?? '').replace(/\/$/, '')
    return `${server}/api/multiplayer/${action}`
  }

  private async api(action: string, data: object): Promise<any> {
    const response = await fetch(this.endpoint(action), { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: AbortSignal.timeout(action === 'state' ? 2000 : 5000) })
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
    const lifecycle = this.lifecycle
    try {
      const credentials = await this.api(action, { code }) as Credentials
      if (this.disposed || lifecycle !== this.lifecycle) { void this.api('leave', credentials).catch(() => {}); return }
      this.credentials = credentials
      this.message!.textContent = `Sala ${credentials.code} · Esperando al otro jugador…`
      this.message!.className = 'room-code'
      this.panel!.querySelector('.multiplayer-actions')?.remove()
      void requestGameFullscreen()
      this.sync()
    } catch (error) {
      if (!this.disposed && lifecycle === this.lifecycle && this.message) {
        this.message.textContent = error instanceof Error ? error.message : 'No se pudo conectar.'
      }
    } finally { if (lifecycle === this.lifecycle) this.busy = false }
  }

  private controls() {
    return {
      ...this.credentials!,
      matchNumber: this.snapshot?.matchNumber,
      rematchMatch: this.rematchMatch,
      input: document.hidden || window.innerHeight >= window.innerWidth ? { x: 0, y: 0 } : this.joystick.direction,
    }
  }

  private sync(immediate = false): void {
    if (!this.credentials || this.disposed || this.snapshot?.status === 'abandoned') return
    const now = performance.now()
    if (this.socket && now - this.socketTrafficAt > 1600) {
      this.socket.close()
      this.socket = undefined
    }
    if (this.credentials.live && !this.socket && now - this.lastSocketAttempt >= 4000) {
      this.lastSocketAttempt = now
      const url = new URL(this.endpoint('live'), window.location.href)
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
      url.searchParams.set('code', this.credentials.code)
      const socket = new WebSocket(url)
      this.socket = socket
      this.socketTrafficAt = now
      socket.addEventListener('open', () => {
        if (socket === this.socket) this.sync(true)
      })
      socket.addEventListener('message', event => {
        if (socket !== this.socket || this.disposed) return
        this.socketTrafficAt = performance.now()
        this.receiveSnapshot(JSON.parse(event.data) as Snapshot, 0)
      })
      socket.addEventListener('close', () => {
        if (socket !== this.socket) return
        this.socket = undefined
        this.sync(true)
      })
    }
    const playing = this.snapshot?.status === 'playing'
    const interval = playing ? (this.socket ? 30 : 80) : 200
    if (!immediate && now - this.lastSentAt < interval) return
    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN && this.socket.bufferedAmount < 1024) {
        this.lastSentAt = now
        this.socket.send(JSON.stringify(this.controls()))
      }
    } else if (!this.polling) {
      this.lastSentAt = now
      void this.poll()
    }
  }

  private async poll(): Promise<void> {
    if (!this.credentials || this.disposed || this.polling) return
    this.polling = true
    const credentials = this.credentials
    try {
      const sentAt = performance.now()
      const snapshot = await this.api('state', this.controls()) as Snapshot
      if (this.disposed || this.credentials !== credentials || this.socket?.readyState === WebSocket.OPEN) return
      this.receiveSnapshot(snapshot, Math.min(80, (performance.now() - sentAt) / 2))
    } catch (error) {
      if (this.disposed || this.credentials !== credentials) return
      const text = error instanceof Error ? error.message : 'Conexión interrumpida'
      if (this.message) this.message.textContent = text
    } finally { if (this.credentials === credentials) this.polling = false }
  }

  private receiveSnapshot(snapshot: Snapshot, halfRtt: number): void {
    const previous = this.snapshot
    this.snapshot = snapshot
    this.snapshotAt = performance.now()
    this.halfRtt = halfRtt
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
    if (snapshot.status === 'finished' && this.message && snapshot.rematch) {
      const player = this.credentials!.player
      this.message.textContent = snapshot.rematch[player] ? 'Revancha confirmada. Esperando al rival…'
        : snapshot.rematch[1 - player] ? 'Tu rival pidió la revancha.'
        : this.rematchMatch !== undefined ? 'Enviando la revancha…' : ''
    }
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
    const own = this.art[this.credentials!.player]!
    this.playerRing = this.add.circle(own.x, own.y, 50, 0x102d32, 0.48)
      .setStrokeStyle(5, 0x7fffe1).setDepth(699)
    this.playerTag = this.add.text(own.x, own.y - 59, '▼ TÚ', { ...style, fontSize: '23px', color: '#bafff0' })
      .setOrigin(0.5, 1).setDepth(701)
    this.add.text(48, 26, 'Duelo online · Primero a 3', style).setDepth(1200)
    this.scoreText = this.add.text(48, 80, '', style).setDepth(1200)
    this.winsText = this.add.text(48, 128, this.seriesScore(), { ...style, fontSize: '25px' }).setDepth(1200)
    this.statusText = this.add.text(600, 130, '', { ...style, fontSize: '28px' }).setOrigin(0.5).setDepth(1200)
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
    const own = this.art[player]!
    this.playerRing?.setPosition(own.x, own.y)
    this.playerTag?.setPosition(own.x, own.y - 59)
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
    this.panel?.remove(); this.panel = document.createElement('div'); this.panel.className = 'multiplayer-panel multiplayer-result'
    const title = document.createElement('h1'), score = document.createElement('p')
    const state = this.snapshot!, player = this.credentials!.player
    title.textContent = state.status === 'abandoned' ? 'La sala se cerró' : state.winner === player ? '¡Ganaste el duelo!' : '¡Buena partida!'
    score.className = 'multiplayer-duel-score'
    score.textContent = `${state.scores[player]} – ${state.scores[1 - player]}`
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
        this.sync(true)
      })
      if (!state.rematch) {
        rematch.disabled = true
        this.message.textContent = 'El servidor de salas necesita una actualización para jugar la revancha.'
      }
      const leave = this.button('Rendirse e irse', () => this.exit())
      leave.className = 'multiplayer-secondary'
      const actions = document.createElement('div'); actions.className = 'multiplayer-result-actions'
      actions.append(rematch, leave)
      this.panel.append(prompt, actions, this.message)
    } else {
      this.panel.append(this.button('Volver al menú', () => this.exit()))
    }
    document.getElementById('app')!.append(this.panel)
  }
  private down(pointer: Phaser.Input.Pointer, objects: Phaser.GameObjects.GameObject[] = []): void {
    if (!this.inMatch || this.panel || objects.length) return
    const p = this.cameras.main.getWorldPoint(pointer.x, pointer.y); this.joystick.start(pointer.id, p.x, p.y)
    this.sync(true)
  }
  private move(pointer: Phaser.Input.Pointer): void {
    const p = this.cameras.main.getWorldPoint(pointer.x, pointer.y); this.joystick.move(pointer.id, p.x, p.y)
  }
  private up(pointer: Phaser.Input.Pointer): void {
    this.joystick.release(pointer.id)
    this.sync(true)
  }
  private cancel = (): void => {
    this.joystick.cancel()
    this.sync(true)
  }
  private back = (event: Event): void => { event.preventDefault(); this.exit() }
  private exit(): void { this.scene.start('MenuScene') }
  private cleanup(): void {
    this.disposed = true; this.cancel(); clearInterval(this.interval); this.panel?.remove(); this.panel = undefined
    const socket = this.socket
    this.socket = undefined
    socket?.close()
    if (this.credentials) void this.api('leave', this.credentials).catch(() => {})
    this.input.off('pointerdown', this.down, this); this.input.off('pointermove', this.move, this)
    this.input.off('pointerup', this.up, this); this.input.off('pointerupoutside', this.up, this)
    window.removeEventListener('papya:suspend', this.cancel); window.removeEventListener('blur', this.cancel)
    window.removeEventListener('papya:back', this.back); document.removeEventListener('visibilitychange', this.cancel)
  }
}
