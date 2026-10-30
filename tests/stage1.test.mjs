import { requestGameFullscreen, requestFullscreenOnPlay } from '../src/utils/fullscreen.ts'
import CookingDisplay from '../src/minigames/cocina/ui/CookingDisplay.ts'
import { installMobileViewport } from '../src/utils/mobileViewport.ts'
import RhythmNote from '../src/minigames/ruana/entities/RhythmNote.ts'
import HitZone from '../src/minigames/ruana/ui/HitZone.ts'
import { LOGICAL_WIDTH, LOGICAL_HEIGHT } from '../src/config/constants.ts'
import { RUANA_CONFIG } from '../src/minigames/ruana/config/ruanaConfig.ts'
import { COCUY_CONFIG } from '../src/minigames/cocuy/config/cocuyConfig.ts'
import { applyHudLayers } from '../src/config/layers.ts'
import WorldScrollSystem from '../src/minigames/cocuy/systems/WorldScrollSystem.ts'
import { SCENE_ASSETS } from '../src/config/sceneAssets.ts'
import AudioManager from '../src/core/AudioManager.ts'
import { AUDIO_CONFIG, audioPath } from '../src/config/audioConfig.ts'
import RecipeManager from '../src/minigames/cocina/systems/RecipeManager.ts'
import { COCINA_CONFIG } from '../src/minigames/cocina/config/cocinaConfig.ts'
import { COCINA_ASSETS } from '../src/config/assets.ts'
import HeatControls from '../src/minigames/cocina/ui/HeatControls.ts'
import ResultsScene, { ROUTE_MESSAGE_DURATION_MS } from '../src/scenes/ResultsScene.ts'
import test from 'node:test'
import assert from 'node:assert/strict'
import EventEmitter from '../node_modules/phaser/src/events/EventEmitter.js'
import SaveManager from '../src/core/SaveManager.ts'
import RoundManager from '../src/core/RoundManager.ts'
import GameManager, { gameManager } from '../src/core/GameManager.ts'
import { MINIGAME_ORDER } from '../src/config/minigamesConfig.ts'
import TejoAimSystem from '../src/minigames/tejo/systems/TejoAimSystem.ts'
import TejoBoard from '../src/minigames/tejo/entities/TejoBoard.ts'
import TejoImpactSystem from '../src/minigames/tejo/systems/TejoImpactSystem.ts'
import TejoThrowSystem from '../src/minigames/tejo/systems/TejoThrowSystem.ts'
import TejoScoreManager from '../src/minigames/tejo/systems/TejoScoreManager.ts'
import TejoScene from '../src/minigames/tejo/TejoScene.ts'
import { TEJO_CONFIG } from '../src/minigames/tejo/config/tejoConfig.ts'
import IngredientManager from '../src/minigames/cocina/systems/IngredientManager.ts'
import CocinaScene from '../src/minigames/cocina/CocinaScene.ts'
import CocuyScene from '../src/minigames/cocuy/CocuyScene.ts'
import AscentSystem from '../src/minigames/cocuy/systems/AscentSystem.ts'
import RhythmClock from '../src/minigames/ruana/systems/RhythmClock.ts'
import GameplaySession from '../src/components/GameplaySession.ts'
import { TEXTS } from '../src/config/texts.ts'
import Potato from '../src/minigames/papa/entities/Potato.ts'
import PotatoSpawnManager from '../src/minigames/papa/systems/PotatoSpawnManager.ts'
import { PAPA_CONFIG } from '../src/minigames/papa/config/papaConfig.ts'
import { TEJO_ASSETS, POTATO_ASSETS } from '../src/config/assets.ts'
import { existsSync } from 'node:fs'
import CookingSystem from '../src/minigames/cocina/systems/CookingSystem.ts'
import MapScene from '../src/scenes/MapScene.ts'
import TransitionScene from '../src/scenes/TransitionScene.ts'
import DebugManager from '../src/core/DebugManager.ts'
import { openProgressReset } from '../src/dev/resetProgress.ts'
import PapaScene from '../src/minigames/papa/PapaScene.ts'
import PotatoScoreManager from '../src/minigames/papa/systems/PotatoScoreManager.ts'
import CocuyObstacle from '../src/minigames/cocuy/entities/CocuyObstacle.ts'
import ObstacleEffectSystem from '../src/minigames/cocuy/systems/ObstacleEffectSystem.ts'
import CondorMovementSystem from '../src/minigames/cocuy/systems/CondorMovementSystem.ts'
import BootScene from '../src/scenes/BootScene.ts'
import PreloaderScene from '../src/scenes/PreloaderScene.ts'
import CookingPot from '../src/minigames/cocina/entities/CookingPot.ts'
import Ingredient from '../src/minigames/cocina/entities/Ingredient.ts'
import TrompoScene from '../src/minigames/trompo/TrompoScene.ts'
import TrompoJoystick from '../src/minigames/trompo/systems/TrompoJoystick.ts'
import TrompoSimulation from '../src/minigames/trompo/systems/TrompoSimulation.ts'
import { TROMPO_CONFIG } from '../src/minigames/trompo/config/trompoConfig.ts'
import { MINIGAMES_CONFIG, USE_TROMPO_PROTOTYPE } from '../src/config/minigamesConfig.ts'
import { buildRuanaBeatmap, ruanaDuration } from '../src/minigames/ruana/config/ruanaDifficulty.ts'
import RuanaScoreManager from '../src/minigames/ruana/systems/RuanaScoreManager.ts'
import RuanaScene from '../src/minigames/ruana/RuanaScene.ts'
import NoteManager from '../src/minigames/ruana/systems/NoteManager.ts'
import LaneProjector from '../src/minigames/ruana/systems/LaneProjector.ts'
import HitJudge from '../src/minigames/ruana/systems/HitJudge.ts'
import PapaGuide from '../src/components/PapaGuide.ts'
import { PAPA_GUIDE_ASSET, guidePages } from '../src/config/guideConfig.ts'
import { SACK_ASSETS } from '../src/config/uiAssets.ts'
import { RUANA_MUSIC_TIMING } from '../src/minigames/ruana/config/beatmapPrototype.ts'

test('Ruana sigue el tiempo real de la canción y conserva velocidad uno en dificultades altas', () => {
  browser()
  gameManager.initialize()
  const clock = new RhythmClock()
  let audioMs = 2300
  clock.start(1, () => audioMs)
  assert.equal(clock.getCurrentTime(), 2300)
  clock.pause(); audioMs = 4000
  assert.equal(clock.getCurrentTime(), 2300)
  clock.resume()
  assert.equal(clock.getCurrentTime(), 4000)
  clock.reset()
  assert.equal(clock.getCurrentTime(), 0)
  const level = gameManager.paceLevel
  const playMusic = gameManager.audioManager.playMusic
  let rate
  try {
    gameManager.paceLevel = 4
    gameManager.audioManager.playMusic = (_scene, _key, value) => { rate = value; return true }
    const view = scene()
    view.scene.key = 'RuanaScene'
    new GameplaySession(view)
    assert.equal(rate, 1)
    assert.equal(view.time.timeScale, 1)
    assert.equal(view.tweens.timeScale, 1)
    view.events.emit('shutdown')
  } finally { gameManager.paceLevel = level; gameManager.audioManager.playMusic = playMusic }
  for (let level = 0; level < 5; level++) {
    for (const note of buildRuanaBeatmap(level)) {
      const beat = (note.hitTime - RUANA_MUSIC_TIMING.beatOffsetMs) / (60000 / RUANA_MUSIC_TIMING.bpm)
      assert.ok(Math.abs(beat * 2 - Math.round(beat * 2)) < 1e-8)
    }
  }
})
import ObstacleSpawnManager from '../src/minigames/cocuy/systems/ObstacleSpawnManager.ts'
import Condor from '../src/minigames/cocuy/entities/Condor.ts'
import VisibilityOverlay from '../src/minigames/cocuy/ui/VisibilityOverlay.ts'
import CondorControls from '../src/minigames/cocuy/ui/CondorControls.ts'
import HarvestBasket from '../src/minigames/papa/ui/HarvestBasket.ts'
import { installLandscapeOnly } from '../src/utils/landscapeOnly.ts'
import { requestLandscapeOrientation } from '../src/utils/landscapeLock.ts'

test('vertical bloquea entrada y simulación; volver a horizontal conserva la pausa del jugador', () => {
  browser()
  const app = {}, notice = {}, button = new EventTarget()
  document.getElementById = id => ({ app, 'orientation-guard': notice, 'orientation-fullscreen': button })[id]
  window.innerWidth = 390; window.innerHeight = 844
  window.screen = { orientation: new EventTarget() }
  let suspensions = 0, resumes = 0
  let rhythmPaused = false
  let soundPaused = 0, soundResumed = 0
  const sound = { isPaused: false, pause() { this.isPaused = true; soundPaused++ },
    resume() { this.isPaused = false; soundResumed++ } }
  window.addEventListener('papya:suspend', () => suspensions++)
  const game = { events: new EventEmitter(), input: { enabled: true }, isPaused: false,
    scene: { getScenes: () => [{ scene: { key: 'RuanaScene' } }],
      pause(key) { assert.equal(key, 'RuanaScene'); rhythmPaused = true } },
    sound: { getAllPlaying: () => [sound] },
    pause() { assert.equal(rhythmPaused, true); this.isPaused = true }, resume() { this.isPaused = false; resumes++ } }
  installLandscapeOnly(game)
  assert.equal(notice.hidden, false)
  assert.equal(app.inert, true)
  assert.equal(game.input.enabled, false)
  assert.equal(game.isPaused, true)
  assert.equal(suspensions, 1)
  assert.equal(soundPaused, 1)
  game.events.emit('ready')
  window.dispatchEvent(new Event('resize'))
  assert.equal(suspensions, 1, 'no repite la pausa mientras continúa en vertical')
  window.innerWidth = 844; window.innerHeight = 390
  window.dispatchEvent(new Event('resize'))
  assert.equal(notice.hidden, true)
  assert.equal(app.inert, false)
  assert.equal(game.input.enabled, true)
  assert.equal(game.isPaused, false)
  assert.equal(resumes, 1)
  assert.equal(soundResumed, 1)
  // Una suspensión ajena al bloqueo no debe reanudarse al girar.
  game.isPaused = true
  window.innerWidth = 390; window.innerHeight = 844
  window.dispatchEvent(new Event('orientationchange'))
  window.innerWidth = 844; window.innerHeight = 390
  window.dispatchEvent(new Event('resize'))
  assert.equal(game.isPaused, true)
  assert.equal(resumes, 1)
  game.events.emit('destroy')
  window.innerWidth = 390; window.innerHeight = 844
  window.dispatchEvent(new Event('resize'))
  assert.equal(notice.hidden, true, 'se liberan los listeners al destruir el juego')
})

test('bloqueo de orientación solicita horizontal y tolera navegadores que lo rechazan', async () => {
  browser()
  assert.equal(await requestLandscapeOrientation(), false)
  const calls = []
  window.screen = { orientation: { lock: async direction => calls.push(direction) } }
  assert.equal(await requestLandscapeOrientation(), true)
  assert.deepEqual(calls, ['landscape'])
  document.documentElement = { requestFullscreen: async () => calls.push('fullscreen') }
  await requestGameFullscreen()
  assert.deepEqual(calls.slice(-2), ['fullscreen', 'landscape'])
  window.screen.orientation.lock = async () => { throw new Error('no permitido') }
  assert.equal(await requestLandscapeOrientation(), false)
  assert.equal(await requestGameFullscreen(), true, 'el aviso de giro sirve como respaldo')
})

test('botones del cóndor mantienen dirección, admiten dos dedos y liberan al salir o pausar', () => {
  const view = scene()
  const movement = new CondorMovementSystem()
  const controls = new CondorControls(view,
    (id, direction) => movement.pointerDown(id, direction < 0 ? 0 : 1280),
    id => movement.pointerUp(id))
  const [left, right] = controls.buttons
  left.emit('pointerdown', { id: 1 })
  assert.equal(movement.getSnapshot().inputDirection, -1)
  assert.ok(movement.update(200).x < 640)
  right.emit('pointerdown', { id: 2 })
  assert.equal(movement.getSnapshot().inputDirection, 1)
  right.emit('pointerup', { id: 2 })
  assert.equal(movement.getSnapshot().inputDirection, -1)
  left.emit('pointerout', { id: 1 })
  assert.equal(movement.getSnapshot().inputDirection, 0)
  right.emit('pointerdown', { id: 3 })
  const page = new CocuyScene()
  Object.assign(page, { movementSystem: movement, controls })
  page.clearInput()
  assert.equal(movement.getSnapshot().inputDirection, 0)
  let destroyed = 0
  for (const object of [...controls.buttons, ...controls.labels]) object.destroy = () => destroyed++
  controls.destroy()
  assert.equal(destroyed, 4)
})

test('costal cuenta solo papas buenas y cambia entre vacío, medio lleno y lleno', () => {
  const view = scene()
  const image = view.add.image
  view.add.image = (...args) => {
    const object = image(...args)
    object.setVisible = value => { object.visible = value; return object }
    return object
  }
  const basket = new HarvestBasket(view)
  const counts = [], remaining = []
  basket.countText.setText = text => counts.push(text)
  basket.remainingText.setText = text => remaining.push(text)
  const score = new PotatoScoreManager()
  basket.update(score.getSnapshot())
  assert.equal(counts.at(-1), '0 / 20')
  assert.equal(remaining.at(-1), 'Faltan 20')
  score.collect('GOOD'); score.collect('GOOD')
  basket.update(score.getSnapshot())
  assert.equal(counts.at(-1), '2 / 20')
  assert.equal(remaining.at(-1), 'Faltan 18')
  assert.equal(basket.sack.texture.key, SACK_ASSETS[0].key)
  score.collect('BAD')
  basket.update(score.getSnapshot())
  assert.equal(counts.at(-1), '2 / 20')
  assert.ok(basket.container.depth < 0, 'la canasta no tapa papas que se puedan tocar')
  basket.update({ ...score.getSnapshot(), goodPotatoesCollected: 7 })
  assert.equal(basket.sack.texture.key, SACK_ASSETS[1].key)
  basket.update({ ...score.getSnapshot(), goodPotatoesCollected: 14 })
  assert.equal(basket.sack.texture.key, SACK_ASSETS[2].key)
  basket.update({ ...score.getSnapshot(), goodPotatoesCollected: 20 })
  assert.equal(remaining.at(-1), 'Faltan 0')
  basket.destroy()
})

test('niebla visible dura tres segundos reales, se desvanece y cubre pantallas anchas', () => {
  const view = scene()
  view.scale = { gameSize: { width: 1600, height: 720 } }
  let fillAlpha
  view.add.rectangle = (x, y, width, height, color, alpha) => {
    fillAlpha = alpha
    return drawable(x, y)
  }
  const fog = new VisibilityOverlay(view)
  assert.equal(fillAlpha, 1, 'el relleno debe poder verse al subir la opacidad')
  assert.equal(fog.overlay.alpha, 0)
  assert.ok(fog.clouds.every(cloud => cloud.alpha === 0))
  fog.activate(1000, 1.5)
  fog.update(1750)
  assert.equal(fog.overlay.alpha, COCUY_CONFIG.CLOUD_OVERLAY_ALPHA)
  assert.equal(fog.overlay.width, 1600)
  assert.equal(fog.clouds.length, 9)
  assert.ok(fog.clouds.every(cloud => cloud.alpha > 0 && cloud.alpha < 0.5 && cloud.depth > 700 && cloud.depth < 1200))
  fog.update(5200)
  assert.ok(fog.overlay.alpha > 0 && fog.overlay.alpha < COCUY_CONFIG.CLOUD_OVERLAY_ALPHA)
  assert.equal(fog.isActive(5499), true)
  fog.update(5500)
  assert.equal(fog.isActive(5500), false)
  assert.equal(fog.overlay.alpha, 0)
  assert.ok(fog.clouds.every(cloud => cloud.alpha === 0))
  fog.activate(5600)
  fog.update(6100)
  assert.equal(fog.overlay.alpha, COCUY_CONFIG.CLOUD_OVERLAY_ALPHA)
  let destroyed = 0
  for (const object of [fog.overlay, ...fog.clouds]) object.destroy = () => destroyed++
  fog.destroy()
  assert.equal(destroyed, 10)
})

function storage(raw = null) {
  return { raw, writes: 0, read() { return this.raw }, has() { return this.raw !== null },
    write(_key, value) { this.writes++; this.raw = value } }
}
function browser() {
  const local = storage()
  globalThis.window = Object.assign(new EventTarget(), {
    localStorage: { getItem: () => local.raw, setItem: (_key, value) => local.write(_key, value) },
  })
  globalThis.document = Object.assign(new EventTarget(), { hidden: false })
  return local
}
function drawable(x = 0, y = 0) {
  const object = Object.assign(new EventEmitter(), { x, y, depth: 0, alpha: 1, rotation: 0, scaleX: 1, scaleY: 1 })
  for (const method of ['setCrop', 'setText', 'setVisible', 'setStrokeStyle', 'setOrigin', 'setInteractive', 'setScale', 'setFillStyle', 'setAlpha',
    'setRotation', 'fillStyle', 'fillRect', 'fillPoints', 'lineStyle', 'strokeLineShape', 'fillRoundedRect',
    'fillEllipse', 'strokeEllipse', 'strokeCircle', 'clear', 'fillCircle']) object[method] = () => object
  object.setDepth = value => { object.depth = value; return object }
  object.setScale = value => { object.scaleX = value; object.scaleY = value; return object }
  object.setDisplaySize = (width, height) => { object.width = width; object.height = height; return object }
  object.setPosition = (x, y) => { object.x = x; object.y = y; return object }
  object.setTint = value => { object.tint = value; return object }
  object.setTexture = key => { object.texture = { key }; return object }
  object.clearTint = () => { delete object.tint; return object }
  object.setAlpha = value => { object.alpha = value; return object }
  object.destroy = () => {}
  return object
}
function scene() {
  const timers = [], texts = [], starts = []
  let active = true, paused = false
  const events = new EventEmitter()
  return {
    timers, texts, starts, events, game: { events: new EventEmitter() },
    add: {
      rectangle: (x, y) => drawable(x, y), circle: (x, y) => drawable(x, y),
      triangle: (x, y) => drawable(x, y),
      image: (x, y, key) => Object.assign(drawable(x, y), { texture: { key } }),
      sprite: (x, y, key) => Object.assign(drawable(x, y), { texture: { key }, play() { return this } }),
      text: (x, y, text) => { texts.push(text); return drawable(x, y) },
      container: (x, y, list) => Object.assign(drawable(x, y), { list }), graphics: () => drawable(),
    },
    tweens: { killTweensOf() {}, add(config) { Object.assign(config.targets, { x: config.x, y: config.y }); return {} } },
    time: { delayedCall(delay, callback) { timers.push({ delay, callback }); return {} } },
    sound: { mute: false, pauseAll() {}, resumeAll() {} },
    scene: {
      key: 'PapaScene', isActive: key => key === 'PauseScene' ? paused : active,
      launch() { paused = true }, pause() { active = false; events.emit('pause') },
      resume() { paused = false; active = true; events.emit('resume') },
      start(destination) { starts.push(destination); events.emit('shutdown') },
    },
  }
}
const outcome = (key, won = true) => ({ key, won, rawScore: 237, metrics: { collected: 12 } })

test('tarjeta usa el estado actual para título y candado tras cambiar progreso', () => {
  browser(); gameManager.initialize()
  const page = new MapScene(), view = scene()
  page.add = view.add
  page.textures = { exists: () => false }
  let locks = 0
  page.addLock = () => { locks++; return drawable() }
  gameManager.progressManager.unlockNextRoute()
  gameManager.progressManager.unlockNextRoute()
  page.openRouteCard('route2', 2)
  assert.ok(view.texts.includes('Ruta 2 · abierta'))
  assert.equal(locks, 0)
  page.closeRouteCard()
  gameManager.progressManager.reset()
  page.openRouteCard('route2', 2)
  assert.ok(view.texts.includes('Ruta 2 · por descubrir'))
  assert.equal(locks, 1)
  page.closeRouteCard()
})

test('controles dev comienzan apagados y al ocultar desactivan las guías', () => {
  const debug = new DebugManager()
  debug.toggleTouchAreas(); debug.togglePapaHitboxes()
  assert.equal(debug.areControlsEnabled(), false)
  assert.equal(debug.arePapaHitboxesVisible(), false)
  debug.toggleControls()
  assert.equal(debug.areTouchAreasVisible(), true)
  debug.toggleControls()
  assert.equal(debug.areTouchAreasVisible(), false)
  assert.equal(debug.areRuanaGuidesVisible(), false)
})

test('borrado de desarrollo no toca DOM ni progreso con modo producción', () => {
  browser(); gameManager.initialize()
  gameManager.progressManager.unlockNextRoute()
  gameManager.debugManager.toggleControls()
  // El loader usa DEV=false; document no tiene API DOM, fallaría si entrara.
  openProgressReset(scene())
  assert.deepEqual(gameManager.progressManager.getSaveData().unlockedRoutes, ['route1'])
})

test('Cocina sube por sí sola, invierte dirección y nunca salta de temperatura al tocar', () => {
  const cooking = new CookingSystem()
  const initial = cooking.getSnapshot().temperature
  cooking.update(1000, false)
  assert.ok(cooking.getSnapshot().temperature > initial)
  assert.equal(cooking.getSnapshot().cookingProgress, 0)
  assert.equal(cooking.getSnapshot().burnProgress, 0)
  const warm = cooking.update(1000, true).temperature
  assert.ok(warm > initial)
  cooking.decreaseHeat()
  assert.equal(cooking.getSnapshot().temperature, warm)
  const cool = cooking.update(1000, true).temperature
  assert.ok(cool < warm)
  cooking.increaseHeat()
  assert.equal(cooking.getSnapshot().temperature, cool)
  assert.ok(cooking.update(1000, true).temperature > cool)
})

test('Cocina calienta y puede quemarse durante preparación, sin cocinar antes de la receta', () => {
  const cooking = new CookingSystem()
  cooking.update(3000, false)
  assert.ok(cooking.getSnapshot().temperature > 0.6)
  assert.equal(cooking.getSnapshot().cookingProgress, 0)
  cooking.decreaseHeat()
  cooking.update(1000, false)
  assert.ok(cooking.getSnapshot().temperature < 0.6)
  cooking.update(500, true)
  assert.ok(cooking.getSnapshot().cookingProgress > 0)
  const idle = new CookingSystem()
  idle.update(30000, false)
  assert.equal(idle.getSnapshot().burned, true)
  assert.equal(idle.getSnapshot().victory, false)
})
test('Cocina no se completa sin regular y sí se completa alternando en zona ideal', () => {
  const idle = new CookingSystem()
  for (let ms = 0; ms < 30000; ms += 100) idle.update(100, true)
  assert.equal(idle.getSnapshot().victory, false)
  assert.equal(idle.getSnapshot().burned, true)
  const controlled = new CookingSystem()
  for (let ms = 0; ms < 20000 && !controlled.getSnapshot().victory; ms += 50) {
    if (controlled.getSnapshot().temperature >= 0.65) controlled.decreaseHeat()
    if (controlled.getSnapshot().temperature <= 0.45) controlled.increaseHeat()
    controlled.update(50, true)
  }
  assert.equal(controlled.getSnapshot().victory, true)
  assert.equal(controlled.getSnapshot().burnProgress, 0)
  const low = new CookingSystem()
  low.decreaseHeat()
  low.update(30000, true)
  assert.equal(low.getSnapshot().victory, false)
  assert.equal(low.getSnapshot().temperature, 0)
})

test('papas cargan seis archivos y el toque circular no crece al rotar el sprite', () => {
  const assets = [...POTATO_ASSETS.GOOD, ...POTATO_ASSETS.BAD]
  assert.equal(new Set(assets.map(asset => asset.key)).size, 6)
  for (const asset of assets) assert.ok(existsSync(new URL(`../public/${asset.path}`, import.meta.url)))
  const page = scene()
  const potato = new Potato(page, { id: 'touch-test', type: 'GOOD', x: 640, y: 360,
    scale: 1, velocityX: 0, velocityY: 0, rotationSpeed: Math.PI })
  assert.ok(POTATO_ASSETS.GOOD.some(asset => asset.key === potato.sprite.texture.key))
  assert.equal(potato.contains(640 + PAPA_CONFIG.POTATO_TOUCH_RADIUS, 360), true)
  assert.equal(potato.contains(640 + PAPA_CONFIG.POTATO_TOUCH_RADIUS, 360 + PAPA_CONFIG.POTATO_TOUCH_RADIUS), false)
  potato.update(250)
  assert.equal(potato.sprite.rotation, Math.PI / 4)
  assert.equal(potato.container.rotation ?? 0, 0)
  assert.equal(potato.contains(potato.x + PAPA_CONFIG.POTATO_TOUCH_RADIUS, potato.y + PAPA_CONFIG.POTATO_TOUCH_RADIUS), false)
  potato.container.setScale(0.86)
  assert.equal(potato.contains(potato.x + PAPA_CONFIG.POTATO_TOUCH_RADIUS * 0.86 + 1, potato.y), false)
  potato.hit()
  assert.equal(potato.contains(potato.x, potato.y), false)
})

test('papas superpuestas seleccionan solo la que se dibuja delante', () => {
  const manager = new PotatoSpawnManager(scene())
  const behind = { depth: 200, contains: () => true }
  const front = { depth: 240, contains: () => true }
  manager.potatoes.push(behind, front)
  assert.equal(manager.getPotatoAt(640, 360), front)
  behind.depth = 241
  assert.equal(manager.getPotatoAt(640, 360), behind)
  behind.depth = front.depth
  assert.equal(manager.getPotatoAt(640, 360), front)
  front.contains = () => false
  assert.equal(manager.getPotatoAt(640, 360), behind)
})

test('papas mantienen altura y dan más tiempo cerca de la cima a distintos FPS', () => {
  const peaks = []
  for (const fps of [30, 60, 120]) {
    const potato = new Potato(scene(), { id: `arc-${fps}`, type: 'GOOD', x: 640, y: PAPA_CONFIG.POTATO_SPAWN_Y,
      scale: 1, velocityX: 0, velocityY: -PAPA_CONFIG.MIN_VERTICAL_SPEED, rotationSpeed: 0 })
    const positions = []
    for (let elapsed = 0; elapsed < 5000 && potato.isActive(); elapsed += 1000 / fps) {
      potato.update(1000 / fps)
      positions.push(potato.y)
    }
    const peak = Math.min(...positions)
    peaks.push(peak)
    const oldPeak = PAPA_CONFIG.POTATO_SPAWN_Y - 760 ** 2 / (2 * 900)
    assert.ok(Math.abs(peak - oldPeak) < 4)
    const timeNearPeak = positions.filter(y => y <= peak + 60).length / fps
    const oldTimeNearPeak = 2 * Math.sqrt(2 * 60 / 900)
    assert.ok(timeNearPeak > oldTimeNearPeak * 1.25, 'hay al menos un 25 % más de tiempo cerca de la cima')
    const peakIndex = positions.indexOf(peak)
    assert.ok(positions[peakIndex - 1] > peak && positions[peakIndex + 1] > peak)
    assert.ok(positions[peakIndex + 1] - peak < 1, 'comienza a descender suavemente')
  }
  assert.ok(Math.max(...peaks) - Math.min(...peaks) < 1)
})

test('dos dedos recogen dos papas con coordenadas actuales de cámara, sin duplicar aciertos', () => {
  browser(); gameManager.initialize()
  const page = new PapaScene(), view = scene()
  page.spawnManager = new PotatoSpawnManager(view)
  page.scoreManager = new PotatoScoreManager()
  page.hud = { update() {}, showFloatingFeedback() {} }
  page.refreshHud = () => {}
  page.cameras = { main: { getWorldPoint: (x, y) => ({ x: x - 160, y: y + 20 }) } }
  for (const [id, x] of [['left', 400], ['right', 800]]) {
    page.spawnManager.potatoes.push(new Potato(view, { id, type: 'GOOD', x, y: 360,
      scale: 1, velocityX: 0, velocityY: 0, rotationSpeed: 0 }))
  }
  page.handlePointerDown({ id: 1, x: 560, y: 340, worldX: -999, worldY: -999 })
  page.handlePointerDown({ id: 2, x: 960, y: 340, worldX: -999, worldY: -999 })
  page.handlePointerDown({ id: 1, x: 560, y: 340, worldX: -999, worldY: -999 })
  assert.equal(page.scoreManager.getSnapshot().goodPotatoesCollected, 2)
})

test('viento apunta y empuja en la misma dirección con desplazamiento perceptible', () => {
  for (const direction of [-1, 1]) {
    const view = scene(), triangles = []
    view.add.line = () => Object.assign(drawable(), { setLineWidth() { return this } })
    view.add.triangle = (...args) => { triangles.push(args); return drawable() }
    const obstacle = new CocuyObstacle(view, { id: 'wind', type: 'WIND', x: 640, y: 512,
      speed: 0, windDirection: direction })
    const [, , baseX, , tipX] = triangles[0]
    assert.equal(Math.sign(tipX - baseX), direction)
    const movement = new CondorMovementSystem()
    const effect = new ObstacleEffectSystem()
    const callbacks = { onRockHit() {}, onCloud() {}, onWind: force => movement.applyWind(force) }
    effect.update({ getHitbox: () => ({ x: 620, y: 490, width: 40, height: 40 }) }, [obstacle], callbacks)
    for (let i = 0; i < 30; i++) movement.update(1000 / 60)
    const distance = movement.getSnapshot().x - 640
    assert.equal(Math.sign(distance), direction)
    assert.ok(Math.abs(distance) > 250)
    assert.equal(obstacle.isActive(), false)
  }
})

test('papa guía abre ayuda solo al tocar, recorre los cinco retos y cierra sin cambiar progreso', () => {
  browser(); gameManager.initialize()
  const view = scene()
  view.input = { keyboard: new EventEmitter() }
  const before = gameManager.progressManager.getSaveData()
  const guide = new PapaGuide(view)
  assert.equal(guide.modal, undefined)
  assert.ok(existsSync(new URL(`../public/${PAPA_GUIDE_ASSET.path}`, import.meta.url)))
  assert.equal(guidePages().length, 6)
  assert.deepEqual(guidePages().slice(1).map(page => page.title), MINIGAME_ORDER.map(key => MINIGAMES_CONFIG[key].name))
  guide.fairy.emit('pointerdown')
  assert.ok(guide.modal)
  assert.equal(guide.page, 0)
  for (let i = 0; i < 5; i++) guide.next()
  assert.equal(guide.page, 5)
  guide.previous()
  assert.equal(guide.page, 4)
  guide.next(); guide.next()
  assert.equal(guide.modal, undefined)
  guide.open()
  view.input.keyboard.emit('keydown-ESC')
  assert.equal(guide.modal, undefined)
  assert.equal(guide.close(), false)
  assert.deepEqual(view.starts, [])
  assert.deepEqual(gameManager.progressManager.getSaveData(), before)
  view.events.emit('shutdown')
  assert.equal(view.input.keyboard.listenerCount('keydown-ESC'), 0)
})

test('corrientes animadas se distinguen de las nubes y desplazan las flechas según su sentido', () => {
  for (const direction of [-1, 1]) {
    const view = scene()
    const wind = new CocuyObstacle(view, { id: 'flow', type: 'WIND', x: 640, y: 300, speed: 0, windDirection: direction })
    assert.equal(wind.windArrows.length, 3)
    wind.update(100, 126)
    const x = wind.windArrows[0].x
    wind.update(100, 126)
    assert.equal(Math.sign(wind.windArrows[0].x - x), direction)
    assert.ok(wind.windArrows[0].alpha < 1)
    const cloud = wind.container.list[0]
    assert.equal(cloud.texture.key, SCENE_ASSETS.cloud.key)
    assert.equal(cloud.tint, 0x7dd3fc)
  }
})

test('ayuda cubre el viewport ampliado y conserva la página al cambiar de tamaño', () => {
  const view = scene(), rectangles = []
  view.input = { keyboard: new EventEmitter() }
  view.scale = Object.assign(new EventEmitter(), { gameSize: { width: 1600, height: 720 } })
  const rectangle = view.add.rectangle
  view.add.rectangle = (x, y, width, height, ...rest) => {
    const result = Object.assign(rectangle(x, y, ...rest), { width, height })
    rectangles.push(result)
    return result
  }
  const guide = new PapaGuide(view)
  guide.open(); guide.next()
  assert.equal(guide.modal.list[0].width, 1600)
  view.scale.gameSize = { width: 1280, height: 1600 }
  view.scale.emit('resize')
  assert.equal(guide.page, 1)
  assert.equal(guide.modal.list[0].height, 1600)
  view.events.emit('shutdown')
  assert.equal(view.scale.listenerCount('resize'), 0)
})

test('Cocuy dirige con la cámara actual y no confunde botones del HUD con controles de vuelo', () => {
  const page = new CocuyScene()
  page.state = 'PLAYING'
  page.movementSystem = new CondorMovementSystem()
  page.cameras = { main: { getWorldPoint: (x, y) => ({ x: x - 160, y }) } }
  page.handlePointerDown({ id: 1, x: 700, y: 500, worldX: 999 })
  assert.equal(page.movementSystem.getSnapshot().inputDirection, -1)
  page.handlePointerDown({ id: 2, x: 1100, y: 60 }, [{}])
  assert.equal(page.movementSystem.getSnapshot().inputDirection, -1)
  page.handlePointerMove({ id: 1, x: 1000, y: 500 })
  assert.equal(page.movementSystem.getSnapshot().inputDirection, 1)
  page.handlePointerUp({ id: 1 })
  assert.equal(page.movementSystem.getSnapshot().inputDirection, 0)
})

test('patrones de viento ponen una roca del lado del empuje con margen real al acelerar', () => {
  for (const direction of [-1, 1]) for (const pace of [1, 30 / 18]) {
    const manager = new ObstacleSpawnManager(scene())
    assert.equal(manager.spawnWindPattern(direction, direction === 1 ? 1150 : 130, 70, pace), true)
    const [wind, rock] = manager.getActiveObstacles()
    const center = item => { const box = item.getHitbox(); return { x: box.x + box.width / 2, y: box.y + box.height / 2 } }
    const w = center(wind), r = center(rock)
    assert.equal(rock.type, 'ROCK')
    assert.equal(Math.sign(r.x - w.x), direction)
    assert.ok(r.x >= 130 && r.x <= 1150)
    const delay = (w.y - r.y) / (COCUY_CONFIG.WORLD_SCROLL_SPEED_END + 70) / pace
    assert.ok(delay >= COCUY_CONFIG.WIND_ROCK_REACTION_SECONDS - 0.001)
    assert.ok(Math.abs(r.x - w.x) > wind.getHitbox().width / 2 + rock.getHitbox().width / 2)
    manager.spawnWindPattern(direction, 640, 70, pace)
    manager.spawnWindPattern(direction, 640, 70, pace)
    assert.equal(manager.getActiveObstacles().length, COCUY_CONFIG.MAX_ACTIVE_OBSTACLES)
    assert.equal(manager.spawnWindPattern(direction, 640), false)
  }
})

test('un golpe de roca baja altura y retrocede; la protección evita golpes encadenados', () => {
  browser(); gameManager.initialize()
  const page = new CocuyScene(), cues = []
  page.state = 'PLAYING'
  page.ascentSystem = new AscentSystem()
  page.ascentSystem.setAltitude(200)
  page.movementSystem = new CondorMovementSystem()
  let flashes = 0
  page.condor = { flashHit() { flashes++ } }
  page.feedback = { rock: (...args) => cues.push(args) }
  page.cameras = { main: { shake() {} } }
  page.applyRockHit(700)
  page.applyRockHit(700)
  assert.equal(page.ascentSystem.getSnapshot().altitude, 175)
  assert.equal(flashes, 1)
  assert.equal(cues.length, 1)
  assert.ok(page.movementSystem.update(100).x < 640)
  page.elapsedMs = COCUY_CONFIG.ROCK_PROTECTION_MS - 1
  page.applyRockHit(700)
  assert.equal(page.rockHits, 1)
  page.elapsedMs++
  page.applyRockHit(700)
  assert.equal(page.rockHits, 2)
  assert.equal(page.ascentSystem.getSnapshot().altitude, 150)
})

test('corregir contra el viento evita la roca del patrón sin exigir un choque inevitable', () => {
  for (const direction of [-1, 1]) for (const pace of [1, 30 / 18]) {
    const hits = []
    for (const steer of [false, true]) {
      const manager = new ObstacleSpawnManager(scene())
      manager.spawnWindPattern(direction, 640, 70, pace)
      const obstacles = manager.getActiveObstacles()
      const offset = COCUY_CONFIG.PLAYER_Y - obstacles[0].container.y
      obstacles.forEach(obstacle => { obstacle.container.y += offset })
      const movement = new CondorMovementSystem(), effects = new ObstacleEffectSystem()
      let collisions = 0
      const condor = { getHitbox: () => ({ x: movement.getSnapshot().x - 28, y: COCUY_CONFIG.PLAYER_Y - 19, width: 56, height: 38 }) }
      const callbacks = { onRockHit() { collisions++ }, onCloud() {}, onWind: force => movement.applyWind(force) }
      effects.update(condor, obstacles, callbacks)
      if (steer) movement.pointerDown(1, direction === 1 ? 0 : 1280)
      for (let elapsed = 0; elapsed < 2500; elapsed += 1000 / 60) {
        movement.update(1000 / 60 * pace)
        obstacles.forEach(obstacle => obstacle.update(1000 / 60 * pace, COCUY_CONFIG.WORLD_SCROLL_SPEED_END))
        effects.update(condor, obstacles, callbacks)
      }
      hits.push(collisions)
    }
    assert.equal(hits[0], 1, 'sin corregir, la corriente conduce hacia la roca')
    assert.equal(hits[1], 0, 'contradirigir permite esquivarla')
  }
})

test('cóndor muestra descenso, inclinación y parpadeo con hitbox alineada al cuerpo', () => {
  const view = scene()
  view.add.sprite = (x, y) => Object.assign(drawable(x, y), { play() { return this } })
  const condor = new Condor(view)
  condor.flashHit()
  assert.ok(condor.container.y > COCUY_CONFIG.PLAYER_Y + 50)
  condor.update(100, 200, 900)
  assert.ok(condor.body.rotation > 0)
  const box = condor.getHitbox()
  assert.equal(box.y + box.height / 2, condor.container.y)
  assert.ok(condor.body.tint)
  condor.update(1000, 0, 0)
  assert.equal(condor.body.alpha, 1)
  assert.equal(condor.body.tint, undefined)
  assert.ok(Math.abs(condor.container.y - COCUY_CONFIG.PLAYER_Y) < 6)
})

for (const fastLoad of [true, false]) {
  test(`logo termina antes de mostrar carga o menú (carga ${fastLoad ? 'rápida' : 'lenta'})`, () => {
    browser()
    const view = scene(), boot = new BootScene(), loader = new PreloaderScene()
    let brandComplete = false, visible = true, tween
    const registry = { set(_key, value) { brandComplete = value }, get() { return brandComplete } }
    const camera = { setBackgroundColor() {}, setVisible(value) { visible = value } }
    const anims = { exists: () => true }
    view.add.sprite = (x, y) => Object.assign(drawable(x, y), { play() { return this } })
    Object.assign(boot, { registry, add: view.add, game: view.game, cameras: { main: camera },
      textures: { get: () => ({ add() {} }) }, tweens: { add(config) { tween = config } },
      scene: { launch() {}, bringToTop() {}, stop() {} } })
    Object.assign(loader, { registry, add: view.add, game: view.game, events: view.events,
      cameras: { main: camera }, anims, scene: view.scene,
      textures: { exists: () => true, get: () => ({ has: () => false, add() {} }) }, cache: { audio: { exists: () => true } },
      load: Object.assign(new EventEmitter(), { image() {} }) })
    boot.create()
    loader.preload()
    assert.equal(brandComplete, false)
    assert.equal(visible, false)
    assert.ok(view.texts.includes(TEXTS.loading))
    if (fastLoad) loader.create()
    assert.deepEqual(view.starts, [])
    assert.equal(tween.duration * 2 + tween.hold, 3000)
    tween.onComplete()
    assert.equal(visible, true)
    if (!fastLoad) loader.create()
    assert.deepEqual(view.starts, ['MenuScene'])
  })
}

test('audio intenta autoplay y conserva el desbloqueo por toque si se bloquea', async () => {
  for (const allowed of [true, false]) {
    const audio = new AudioManager(), sounds = []
    const sound = Object.assign(new EventEmitter(), { locked: true, unlocked: false,
      context: { state: 'suspended', async resume() { if (allowed) this.state = 'running'; else throw Error('blocked') } },
      add(key) { const music = { key, play(config) { this.rate = config.rate }, destroy() {} }; sounds.push(music); return music },
    })
    const view = { cache: { audio: { exists: () => true } }, sound, events: new EventEmitter(), scene: { isActive: () => true } }
    audio.playMusic(view, 'ruanaMusic', 1.5)
    await Promise.resolve(); await Promise.resolve()
    assert.equal(sound.unlocked, allowed)
    assert.equal(sounds.length, 0)
    // Simula el update de Phaser o el primer gesto permitido por el navegador.
    sound.locked = false
    sound.emit('unlocked')
    assert.equal(sounds.length, 1)
    assert.equal(sounds[0].rate, 1.5)
    assert.equal(sound.listenerCount('unlocked'), 0)
  }
})

test('guardado recupera JSON roto, arrays inválidos y tipos incorrectos', () => {
  for (const raw of ['{', 'null', '[]', '{"unlockedRoutes":null}']) {
    const manager = new SaveManager(storage(raw))
    assert.deepEqual(manager.load().unlockedRoutes, [])
  }
  const manager = new SaveManager(storage(JSON.stringify({ version: 2,
    unlockedRoutes: ['route2', 'route2', 'inventada'], perfectRoutes: ['route1', 'route2'],
    bestVictories: 99, totalRuns: -1, recordScore: Infinity, bestScores: { papa: -2 }, explorationUnlocked: true })))
  const saved = manager.load()
  assert.deepEqual(saved.unlockedRoutes, ['route2'])
  assert.deepEqual(saved.perfectRoutes, ['route2'])
  assert.equal(saved.bestVictories, 5)
  assert.equal(saved.totalRuns, 0)
  assert.equal(saved.explorationUnlocked, false)
})

test('migración v1 conserva rutas y convierte el récord a puntos de viaje', () => {
  const old = storage(JSON.stringify({ version: 1, unlockedRoutes: ['route1'], bestVictories: 3, recordScore: 340 }))
  const saved = new SaveManager(old).load()
  assert.equal(saved.version, 2)
  assert.equal(saved.recordScore, 300)
  assert.deepEqual(saved.unlockedRoutes, ['route1'])
  assert.equal(saved.bestScores.papa, 0)
})

test('no sobrescribe una versión futura y soporta almacenamiento inaccesible', () => {
  const future = storage('{"version":99,"unlockedRoutes":["route1"]}')
  const manager = new SaveManager(future)
  manager.load(); manager.save()
  assert.equal(future.writes, 0)
  const unavailable = new SaveManager({ read() { throw Error('denied') }, write() { throw Error('full') }, has() { throw Error('denied') } })
  unavailable.load()
  const state = unavailable.getData(); state.unlockedRoutes.push('route1'); unavailable.save(state)
  assert.deepEqual(unavailable.getData().unlockedRoutes, ['route1'])
  assert.equal(unavailable.storageAvailable, false)
  assert.equal(unavailable.hasSave(), false)
})

test('ronda conserva métricas, evita duplicados y copia su estado', () => {
  const round = new RoundManager()
  round.start(['papa', 'tejo'])
  round.recordResult(outcome('tejo'))
  assert.equal(round.getState().results.length, 0)
  round.recordResult(outcome('papa', false))
  round.recordResult(outcome('papa', false))
  assert.equal(round.getState().results.length, 1)
  const state = round.recordResult(outcome('tejo'))
  assert.equal(state.score, 100)
  assert.equal(state.defeats, 1)
  assert.equal(state.results[0].rawScore, 237)
  state.results[0].metrics.collected = 999
  assert.equal(round.getState().results[0].metrics.collected, 12)
  assert.equal(round.recordResult(outcome('tejo')).results.length, 2)
  assert.throws(() => round.start(['papa', 'papa']))
})

test('solo una ronda terminada de viaje registra progreso una vez', () => {
  browser()
  const manager = new GameManager(); manager.initialize()
  manager.startNewRun([...MINIGAME_ORDER])
  manager.finishRun()
  assert.equal(manager.progressManager.getSaveData().totalRuns, 0)
  MINIGAME_ORDER.forEach((key, index) => manager.completeCurrentMinigame(outcome(key, index < 3)))
  manager.finishRun(); manager.finishRun()
  const saved = manager.progressManager.getSaveData()
  assert.equal(saved.totalRuns, 1)
  assert.equal(saved.recordScore, 300)
  assert.deepEqual(saved.unlockedRoutes, ['route1'])
  assert.equal(saved.bestScores.papa, 237)
  manager.startNewRun(['papa'], true)
  assert.equal(manager.completeCurrentMinigame(outcome('papa')), 'practice')
  manager.finishRun()
  assert.equal(manager.progressManager.getSaveData().totalRuns, 1)
})

test('las cuatro mechas son alcanzables con arrastre dentro del canvas', () => {
  const board = new TejoBoard(scene())
  const impact = new TejoImpactSystem(board)
  const aim = new TejoAimSystem(scene())
  for (const mecha of board.getMechaZones()) {
    const dx = TEJO_CONFIG.BOARD_CENTER_X - mecha.x
    const minY = TEJO_CONFIG.BOARD_Y - TEJO_CONFIG.BOARD_HEIGHT / 2
    const power = (TEJO_CONFIG.THROW_START_Y - 80 - mecha.y) / (TEJO_CONFIG.THROW_START_Y - 80 - minY)
    const distance = Math.pow(power, 1 / TEJO_CONFIG.POWER_CURVE_EXPONENT) * TEJO_CONFIG.MAX_POWER_DRAG_DISTANCE
    const dy = Math.sqrt(distance * distance - dx * dx) / TEJO_CONFIG.DRAG_POWER_SENSITIVITY
    assert.ok(TEJO_CONFIG.THROW_START_Y + dy <= 720)
    const shot = aim.update(TEJO_CONFIG.THROW_START_X + dx, TEJO_CONFIG.THROW_START_Y + dy)
    assert.ok(aim.hasValidDrag())
    assert.equal(impact.evaluate(shot.target), 'MECHA')
  }
})

test('guía corta de Tejo muestra dirección y fuerza sin revelar el destino', () => {
  const page = scene(), dots = []
  page.add.graphics = () => Object.assign(drawable(), { strokeLineShape(line) { dots.push({ x: line.x2, y: line.y2 }); return this } })
  const aim = new TejoAimSystem(page)
  const shot = aim.update(690, 690)
  assert.equal(dots.length, 6)
  assert.ok(Math.hypot(dots[0].x - TEJO_CONFIG.THROW_START_X, dots[0].y - TEJO_CONFIG.THROW_START_Y) <= 140)
  assert.ok(dots.every(point => Math.hypot(point.x - shot.target.x, point.y - shot.target.y) > 100))
  aim.clear()
  assert.equal(aim.getCurrentAim(), null)
  const flight = new TejoThrowSystem()
  let position
  flight.start(shot, () => {})
  flight.update(shot.durationMs, { setPosition(point) { position = point }, setScale() {}, setRotation() {} })
  assert.deepEqual(position, shot.target)
  const score = new TejoScoreManager()
  assert.equal(score.registerImpact('MECHA').victory, false)
  assert.equal(score.registerImpact('MECHA').victory, false)
  assert.equal(score.registerImpact('BOCIN').victory, true)
})

test('barra de fuerza vertical sigue al disco a su derecha y se borra al soltar', () => {
  const view = scene(), drawings = []
  view.add.graphics = () => {
    const graphics = drawable()
    graphics.rects = []
    graphics.frames = []
    graphics.clear = () => { graphics.rects = []; graphics.frames = []; return graphics }
    graphics.fillRoundedRect = (x, y, width, height) => { graphics.frames.push({ x, y, width, height }); return graphics }
    graphics.fillRect = (x, y, width, height) => { graphics.rects.push({ x, y, width, height }); return graphics }
    drawings.push(graphics)
    return graphics
  }
  const aim = new TejoAimSystem(view), meter = drawings[1]
  const frames = []
  for (const point of [{ x: 650, y: 650 }, { x: 720, y: 700 }, { x: 1000, y: 950 }]) {
    const shot = aim.update(point.x, point.y)
    const frame = meter.frames[0]
    frames.push(frame)
    const discX = TEJO_CONFIG.THROW_START_X + shot.dragX
    assert.ok(frame.height > frame.width * 4)
    assert.ok(frame.x > discX + 62, 'no se superpone con el sprite del disco')
    assert.ok(frame.y >= 140 && frame.y + frame.height <= 720)
    assert.ok(meter.depth > TEJO_CONFIG.THROW_START_Y + shot.dragY + 300)
    assert.ok(Math.abs(meter.rects[1].height / (frame.height - 10) - shot.power) < 1e-9)
  }
  assert.equal(frames[1].x - frames[0].x, 70)
  assert.equal(frames[1].y - frames[0].y, 50)
  aim.clear()
  assert.equal(meter.frames.length, 0)
  assert.equal(meter.rects.length, 0)
})

test('Ruana aumenta densidad y agrega notas dobles solo en niveles avanzados', () => {
  const counts = [64, 79, 95, 110, 126]
  for (let level = 0; level < counts.length; level++) {
    const beatmap = buildRuanaBeatmap(level)
    assert.equal(beatmap.length, counts[level])
    assert.equal(new Set(beatmap.map(note => note.id)).size, beatmap.length)
    const groups = new Map()
    for (let i = 0; i < beatmap.length; i++) {
      const note = beatmap[i]
      assert.ok([0, 1, 2, 3].includes(note.lane))
      if (i) assert.ok(note.hitTime >= beatmap[i - 1].hitTime)
      const group = groups.get(note.hitTime) ?? []
      group.push(note.lane); groups.set(note.hitTime, group)
    }
    assert.equal([...groups.values()].some(group => group.length === 2), level >= 3)
    assert.ok([...groups.values()].every(group => group.length <= 2 && new Set(group).size === group.length))
    assert.equal(ruanaDuration(beatmap), beatmap.at(-1).hitTime + RUANA_CONFIG.NOTE_FINISH_DELAY_MS)
  }
  assert.deepEqual(buildRuanaBeatmap(100), buildRuanaBeatmap(4))
  assert.deepEqual(buildRuanaBeatmap(-1), buildRuanaBeatmap(0))
})

test('Ruana cuenta Bien para ganar y reserva la precisión para puntuar', () => {
  const good = new RuanaScoreManager(20), perfect = new RuanaScoreManager(20), insufficient = new RuanaScoreManager(20)
  for (let i = 0; i < 20; i++) {
    good.register(i < 17 ? 'GOOD' : 'MISS')
    perfect.register(i < 17 ? 'PERFECT' : 'MISS')
    insufficient.register(i < 16 ? 'PERFECT' : 'MISS')
  }
  assert.equal(good.isVictory(), true)
  assert.equal(perfect.isVictory(), true)
  assert.equal(insufficient.isVictory(), false)
  assert.ok(good.getAccuracy() < 85)
  assert.ok(perfect.getSnapshot().score > good.getSnapshot().score)
  assert.equal(new RuanaScoreManager(0).isVictory(), false)
})

test('dos dedos resuelven un acorde de Ruana con cámara desplazada sin contar dos veces', () => {
  browser(); gameManager.initialize()
  const page = new RuanaScene(), view = scene(), projector = new LaneProjector()
  const fullBeatmap = buildRuanaBeatmap(3)
  const time = fullBeatmap.find((note, i) => fullBeatmap[i + 1]?.hitTime === note.hitTime).hitTime
  const chord = fullBeatmap.filter(note => note.hitTime === time)
  const zones = new HitZone(view, projector)
  page.phase = 'playing'
  page.clock = { getCurrentTime: () => time }
  page.noteManager = new NoteManager(view, chord, projector)
  page.noteManager.update(time)
  page.judge = new HitJudge()
  page.hitZone = { getLaneAt: (x, y) => zones.getLaneAt(x, y), pulse() {} }
  page.hud = { showFeedback() {} }
  page.scoreManager = new RuanaScoreManager(2)
  page.refreshHud = () => {}
  page.cameras = { main: { getWorldPoint: (x, y) => ({ x: x - 160, y }) } }
  chord.forEach((note, index) => page.handleTap({ id: index + 1, x: RUANA_CONFIG.LANE_END_POSITIONS[note.lane] + 160,
    y: RUANA_CONFIG.LANE_END_Y, worldX: -999, worldY: -999 }))
  page.handleTap({ id: 1, x: RUANA_CONFIG.LANE_END_POSITIONS[chord[0].lane] + 160, y: RUANA_CONFIG.LANE_END_Y })
  assert.equal(page.scoreManager.getSnapshot().perfect, 2)
  page.noteManager.update(time + RUANA_CONFIG.NOTE_FINISH_DELAY_MS)
  assert.equal(page.noteManager.isFinished(), true)
})

test('Tejo consume y oculta una mecha una sola vez y gana al llegar a diez puntos', () => {
  browser(); gameManager.initialize()
  const view = scene(), page = new TejoScene(), images = []
  const image = view.add.image
  view.add.image = (...args) => {
    const item = image(...args)
    item.visible = true
    item.setVisible = value => { item.visible = value; return item }
    images.push(item)
    return item
  }
  page.board = new TejoBoard(view)
  page.scoreManager = new TejoScoreManager()
  page.impactSystem = new TejoImpactSystem(page.board)
  page.hud = { showImpact() {} }
  page.aimSystem = { clear() {} }
  page.time = view.time
  page.refreshHud = () => {}
  const finishes = []
  page.finish = won => finishes.push(won)
  const [first, second] = page.board.getMechaZones()
  page.resolveImpact(first)
  assert.equal(page.scoreManager.getSnapshot().mechas, 1)
  assert.equal(page.board.getMechaZones().length, 3)
  assert.equal(images.find(item => item.texture.key === TEJO_ASSETS.mecha.key && item.x === first.x && item.y === first.y).visible, false)
  page.resolveImpact(first)
  assert.equal(page.scoreManager.getSnapshot().mechas, 1)
  assert.deepEqual(finishes, [])
  page.resolveImpact(second)
  assert.equal(page.scoreManager.getSnapshot().mechas, 2)
  assert.deepEqual(finishes, [])
  page.resolveImpact(page.board.getBocinCenter())
  assert.deepEqual(finishes, [true])
  assert.equal(page.board.consumeMecha(first), false)
  assert.equal(new TejoBoard(scene()).getMechaZones().length, 4)
})

test('Tejo distingue bocín y moñona por el centro del disco y su contacto con una mecha activa', () => {
  const board = new TejoBoard(scene()), impacts = new TejoImpactSystem(board)
  const center = board.getBocinCenter()
  assert.equal(impacts.evaluate(center), 'BOCIN')
  const edge = { x: center.x + 27, y: center.y - 15 }
  assert.equal(impacts.evaluate(edge), 'MONONA')
  assert.equal(board.consumeMecha(edge, TEJO_CONFIG.IMPACT_DISC_RADIUS), true)
  assert.equal(impacts.evaluate(edge), 'BOCIN')
  const score = new TejoScoreManager()
  assert.equal(score.registerImpact('MONONA').score, 9)
  assert.equal(score.registerImpact('NEAR').victory, true)
  const bocinScore = new TejoScoreManager()
  assert.equal(bocinScore.registerImpact('BOCIN').score, 6)
  assert.equal(new TejoScoreManager().registerImpact('MECHA').score, 3)
})

test('Trompo reemplaza solo el puesto de Cocina y conserva guardados anteriores', () => {
  assert.equal(USE_TROMPO_PROTOTYPE, true)
  assert.equal(MINIGAME_ORDER.length, 5)
  assert.ok(MINIGAME_ORDER.includes('trompo'))
  assert.ok(!MINIGAME_ORDER.includes('cocina'))
  assert.equal(MINIGAMES_CONFIG.cocina.sceneKey, 'CocinaScene')
  const manager = new SaveManager(storage(JSON.stringify({ version: 2, unlockedRoutes: ['route1'],
    perfectRoutes: ['route1'], totalRuns: 8, bestScores: { cocina: 471 }, bestVictories: 5, recordScore: 500 })))
  const saved = manager.load()
  assert.equal(saved.bestScores.cocina, 471)
  assert.equal(saved.bestScores.trompo, 0)
  assert.equal(saved.totalRuns, 8)
  assert.deepEqual(saved.unlockedRoutes, ['route1'])
})

test('joystick de Trompo limita el movimiento diagonal y respeta el dedo dueño', () => {
  const stick = new TrompoJoystick(), area = TROMPO_CONFIG.JOYSTICK
  assert.equal(stick.start(1, 1000, 300), false)
  assert.equal(stick.start(1, area.x + 4, area.y), true)
  assert.deepEqual(stick.direction, { x: 0, y: 0 })
  assert.equal(stick.start(2, area.x, area.y), false)
  stick.move(2, area.x + 300, area.y)
  assert.deepEqual(stick.direction, { x: 0, y: 0 })
  stick.move(1, area.x + 300, area.y - 300)
  assert.ok(Math.abs(Math.hypot(stick.direction.x, stick.direction.y) - 1) < 1e-9)
  stick.release(2)
  assert.ok(stick.direction.x > 0)
  stick.release(1)
  assert.deepEqual(stick.direction, { x: 0, y: 0 })
})

test('Trompo permite sacar al rival y pierde por inactividad en distintos FPS', () => {
  for (const fps of [30, 60, 120]) {
    for (const chase of [true, false]) {
      const simulation = new TrompoSimulation()
      for (let ms = 0; ms < 30000 && !simulation.winner; ms += 1000 / fps) {
        const dx = simulation.enemy.x - simulation.player.x, dy = simulation.enemy.y - simulation.player.y
        const distance = Math.hypot(dx, dy) || 1
        simulation.update(1000 / fps, chase ? { x: dx / distance, y: dy / distance } : { x: 0, y: 0 })
      }
      assert.equal(simulation.winner, chase ? 'player' : 'enemy')
      assert.ok(simulation.collisions > 0)
    }
  }
})

test('Trompo resuelve cuerpos superpuestos y salida simultánea sin victoria contradictoria', () => {
  const simulation = new TrompoSimulation(), arena = TROMPO_CONFIG.ARENA
  Object.assign(simulation.player, { x: arena.x, y: arena.y })
  Object.assign(simulation.enemy, { x: arena.x, y: arena.y })
  simulation.update(16, { x: 1, y: 0 })
  assert.ok(Number.isFinite(simulation.player.x))
  assert.ok(Math.hypot(simulation.enemy.x - simulation.player.x, simulation.enemy.y - simulation.player.y) >= TROMPO_CONFIG.TOP_RADIUS * 2 - 0.01)
  simulation.player.x = arena.x - arena.radius - 50
  simulation.enemy.x = arena.x + arena.radius + 50
  simulation.update(16, { x: 0, y: 0 })
  assert.equal(simulation.winner, 'enemy')
})

test('Trompo limpia joystick al pausar y emite resultado único al ganar o agotar tiempo', () => {
  for (const won of [true, false]) {
    browser(); gameManager.initialize()
    const page = new TrompoScene(), results = [], stick = new TrompoJoystick(), area = TROMPO_CONFIG.JOYSTICK
    page.simulation = new TrompoSimulation()
    page.joystick = stick
    page.stick = drawable()
    stick.start(1, area.x, area.y)
    stick.move(1, area.x + 80, area.y)
    page.cancelInput()
    assert.deepEqual(stick.direction, { x: 0, y: 0 })
    assert.equal(page.stick.x, area.x)
    page.renderBodies = () => {}
    page.session = { complete: result => results.push(result) }
    if (won) page.simulation.winner = 'player'
    else page.elapsedMs = TROMPO_CONFIG.GAME_DURATION_MS
    page.update(0, 16)
    page.update(0, 16)
    assert.equal(results.length, 1)
    assert.equal(results[0].key, 'trompo')
    assert.equal(results[0].won, won)
  }
})

test('Cocina conserva agarre, bloquea segundo arrastre y cancela limpiamente', () => {
  const pot = { containsDropPoint: () => true, getSlotPosition: () => ({ x: 640, y: 360 }) }
  const manager = new IngredientManager(scene(), pot)
  assert.equal(manager.startDrag(COCINA_CONFIG.INGREDIENTS[0].x + 10, COCINA_CONFIG.INGREDIENTS[0].y), true)
  assert.equal(manager.startDrag(COCINA_CONFIG.INGREDIENTS[1].x, COCINA_CONFIG.INGREDIENTS[1].y), false)
  manager.dragTo(300, 300)
  assert.equal(manager.dropAt(300, 300), false)
  assert.equal(manager.getIngredientsInPot()[0].id, 'cubios')
  assert.equal(manager.startDrag(COCINA_CONFIG.INGREDIENTS[5].x, COCINA_CONFIG.INGREDIENTS[5].y), true)
  assert.equal(manager.dropAt(640, 360), true)
  assert.equal(manager.dropAt(640, 360), false)
  manager.startDrag(COCINA_CONFIG.INGREDIENTS[1].x, COCINA_CONFIG.INGREDIENTS[1].y); manager.cancelDrag()
  assert.equal(manager.startDrag(COCINA_CONFIG.INGREDIENTS[1].x, COCINA_CONFIG.INGREDIENTS[1].y), true)
})

test('Cocina solo cuenta el distractor al soltar el dedo dueño', () => {
  const page = new CocinaScene()
  let drops = 0
  page.ingredientManager = { startDrag: () => true, dragTo() {}, dropAt() { drops++; return true } }
  page.handlePointerDown({ id: 1, worldX: 20, worldY: 20 })
  page.handlePointerDown({ id: 2, worldX: 20, worldY: 20 })
  page.handlePointerUp({ id: 2, worldX: 20, worldY: 20 })
  assert.equal(drops, 0)
  page.handlePointerUp({ id: 1, worldX: 20, worldY: 20 })
  page.handlePointerUp({ id: 1, worldX: 20, worldY: 20 })
  assert.equal(drops, 1)
  assert.equal(page.ingredientErrors, 1)
})

test('Tejo solo lanza al soltar el dedo dueño y cancela el apuntado al pausar', () => {
  const page = new TejoScene()
  page.cameras = { main: { getWorldPoint: (x, y) => ({ x, y }) } }
  let launches = 0, clears = 0, lastPoint, impactClears = 0
  page.disc = { contains: () => true, setHighlighted() {}, setPosition() {}, reset() {}, setTouchAreaVisible() {} }
  page.aimSystem = { update: (x, y) => { lastPoint = { x, y }; return {} }, getCurrentAim: () => ({}), hasValidDrag: () => true, clear() { clears++ } }
  page.board = { clearImpactPoint() { impactClears++ } }
  page.throwSystem = { start() { launches++ } }
  page.refreshHud = () => {}
  page.handlePointerDown({ id: 1, x: 640, y: 622 })
  page.handlePointerUp({ id: 2 })
  assert.equal(launches, 0)
  page.handlePointerUp({ id: 1, x: 660, y: 690 })
  page.handlePointerUp({ id: 1 })
  assert.equal(launches, 1)
  assert.deepEqual(lastPoint, { x: 660, y: 690 })
  assert.equal(page.activeAim, null)
  assert.equal(page.aimPointerId, null)
  assert.equal(clears, 1)
  page.resetDisc()
  assert.equal(impactClears, 2)
  assert.equal(page.phase, 'READY')
  page.phase = 'READY'
  page.handlePointerDown({ id: 3, x: 640, y: 622 })
  page.cancelAim()
  page.handlePointerUp({ id: 3 })
  assert.equal(launches, 1)
  assert.equal(page.phase, 'READY')
})

test('Cocuy evalúa la victoria después de aplicar una roca en el mismo cuadro', () => {
  const page = new CocuyScene(), finishes = []
  page.state = 'PLAYING'
  page.condor = { setX() {}, update() {} }
  page.movementSystem = { update: () => ({ x: 640 }) }
  page.worldScrollSystem = { update() {}, getSpeed: () => 0 }
  page.ascentSystem = new AscentSystem()
  page.ascentSystem.setAltitude(500)
  page.obstacleEffectSystem = { update() { page.ascentSystem.applyRockPenalty() } }
  page.refreshHud = () => {}
  page.finish = won => finishes.push(won)
  page.update(0, 0)
  assert.deepEqual(finishes, [])
  assert.ok(page.ascentSystem.getSnapshot().altitude < 500)
  page.elapsedMs = 30000
  page.update(0, 0)
  assert.deepEqual(finishes, [false])
})

test('pausa conserva el reloj de Ruana y limpia input sin reanudar automáticamente', () => {
  browser()
  const original = globalThis.performance
  let now = 100
  globalThis.performance = { now: () => now }
  try {
    const clock = new RhythmClock(), page = scene()
    clock.start(); now = 1100
    let cancellations = 0
    const session = new GameplaySession(page, {
      cancelInput: () => cancellations++, pause: () => clock.pause(), resume: () => clock.resume(),
    })
    session.requestPause()
    now = 15100
    assert.equal(clock.getCurrentTime(), 1000)
    assert.equal(cancellations, 1)
    document.dispatchEvent(new Event('visibilitychange'))
    assert.equal(clock.getCurrentTime(), 1000)
    page.scene.resume(); now = 16100
    assert.equal(clock.getCurrentTime(), 2000)
    page.events.emit('shutdown')
    window.dispatchEvent(new Event('papya:suspend'))
    assert.equal(cancellations, 1)
  } finally { globalThis.performance = original }
})

test('no completar avanza inmediatamente sin texto; completar muestra Ganaste una sola vez', () => {
  browser(); gameManager.initialize(); gameManager.startNewRun(['papa', 'tejo'])
  const page = scene(), session = new GameplaySession(page)
  session.complete(outcome('papa', false)); session.complete(outcome('papa', false))
  assert.deepEqual(page.starts, ['TransitionScene'])
  assert.equal(page.timers.length, 0)
  assert.equal(page.texts.includes(TEXTS.won), false)
  assert.equal(gameManager.roundManager.getState().defeats, 1)
  const next = scene(), winning = new GameplaySession(next)
  winning.complete(outcome('tejo')); winning.complete(outcome('tejo'))
  assert.equal(next.texts.filter(text => text === TEXTS.won).length, 1)
  assert.equal(next.timers.length, 1)
  assert.equal(next.timers[0].delay, 650)
  next.timers[0].callback()
  assert.deepEqual(next.starts, ['ResultsScene'])
  assert.equal(gameManager.roundManager.getState().results.length, 2)
})

test('la transición inicia el minijuego sin instrucciones ni temporizador', () => {
  browser(); gameManager.initialize()
  gameManager.startNewRun(['cocina'])
  const page = new TransitionScene(), view = scene()
  page.scene = view.scene
  page.create()
  assert.deepEqual(view.starts, [gameManager.getCurrentMinigame().sceneKey])
  assert.equal(view.timers.length, 0)
})
for (const scenario of [
  { name: 'ruta obtenida', wins: 3, before: 0, message: TEXTS.runEnd.routeUnlocked },
  { name: 'sin ruta', wins: 0, before: 0, message: TEXTS.runEnd.routePending },
  { name: 'última ruta', wins: 3, before: 4, message: TEXTS.runEnd.allRoutes },
  { name: 'todas abiertas y viaje sin victorias', wins: 0, before: 5, message: TEXTS.runEnd.routePending },
]) {
  test(`cierre breve: ${scenario.name}, guarda una vez y continúa automáticamente`, () => {
    browser(); gameManager.initialize()
    for (let i = 0; i < scenario.before; i++) gameManager.progressManager.unlockNextRoute()
    gameManager.startNewRun([...MINIGAME_ORDER])
    MINIGAME_ORDER.forEach((key, i) => gameManager.completeCurrentMinigame(outcome(key, i < scenario.wins)))
    const page = new ResultsScene(), view = scene()
    const images = []
    view.add.image = (x, y, key) => {
      images.push(key)
      return Object.assign(drawable(x, y), { width: 960, height: 420 })
    }
    page.scene = view.scene; page.add = view.add; page.time = view.time
    page.cameras = { main: { setBackgroundColor() {} } }
    page.create()
    const earned = gameManager.lastUnlockedRoute
    assert.deepEqual(view.texts, earned ? [TEXTS.routeName(scenario.before + 1), scenario.message] : [scenario.message])
    assert.deepEqual(images, earned ? [`route-card-${scenario.before + 1}`] : [])
    assert.equal(gameManager.progressManager.getSaveData().totalRuns, 1)
    gameManager.finishRun()
    assert.equal(gameManager.progressManager.getSaveData().totalRuns, 1)
    assert.equal(view.timers[0].delay, ROUTE_MESSAGE_DURATION_MS)
    assert.equal(view.timers[0].delay, 5000)
    view.timers[0].callback()
    assert.deepEqual(view.starts, ['TransitionScene'])
    assert.equal(gameManager.roundManager.getState().isRunning, true)
  })
}
test('ritmo progresa solo con viajes exitosos, tiene límite y se reinicia voluntariamente', () => {
  browser(); gameManager.initialize()
  gameManager.startNewRun([...MINIGAME_ORDER])
  assert.equal(gameManager.pace, 1)
  assert.equal(gameManager.difficultyLevel, 0)
  for (let run = 1; run <= 6; run++) {
    MINIGAME_ORDER.forEach(key => gameManager.completeCurrentMinigame(outcome(key, true)))
    gameManager.finishRun()
    const rate = gameManager.pace
    gameManager.finishRun()
    assert.equal(gameManager.pace, rate)
    assert.equal(rate, 30 / [30,27,24,21,18][Math.min(run,4)])
    assert.equal(gameManager.difficultyLevel, Math.min(run, 4))
    gameManager.startNewRun([...MINIGAME_ORDER], false, true)
    assert.equal(gameManager.pace, rate)
  }
  MINIGAME_ORDER.forEach(key => gameManager.completeCurrentMinigame(outcome(key, false)))
  gameManager.finishRun()
  assert.equal(gameManager.pace, 30 / 18)
  assert.equal(gameManager.difficultyLevel, 4)
  gameManager.startNewRun()
  assert.equal(gameManager.pace, 1)
  assert.equal(gameManager.difficultyLevel, 0)
})
test('controles de temperatura nacen visibles y cambian dirección antes de añadir ingredientes', () => {
  browser(); gameManager.initialize()
  const view = scene()
  view.children = { list: [] }
  for (const method of ['rectangle','text']) {
    const original = view.add[method]
    view.add[method] = (...args) => {
      const node = original(...args)
      node.visible = true
      node.setVisible = value => { node.visible = value; return node }
      node.setInteractive = () => { node.inputEnabled = true; return node }
      node.disableInteractive = () => { node.inputEnabled = false; return node }
      view.children.list.push(node)
      return node
    }
  }
  const page = new CocinaScene()
  page.cookingSystem = new CookingSystem()
  page.phase = 'PREPARATION'
  const controls = new HeatControls(view, () => page.decreaseHeat(), () => page.increaseHeat())
  assert.equal(view.children.list.length, 4)
  assert.ok(view.children.list.every(node => node.visible))
  const buttons = view.children.list.filter(node => node.inputEnabled)
  assert.equal(buttons.length, 2)
  buttons[0].emit('pointerdown')
  assert.ok(page.cookingSystem.update(1000, false).temperature < 0.35)
  buttons[1].emit('pointerdown')
  assert.ok(page.cookingSystem.getSnapshot().temperatureRate > 0)
  controls.setEnabled(false)
  assert.ok(view.children.list.every(node => !node.visible))
})
test('receta actual usa cinco ingredientes y tres distractores, sin ingredientes retirados', () => {
  const correct = COCINA_CONFIG.INGREDIENTS.filter(item => item.isCorrect).map(item => item.id).sort()
  const wrong = COCINA_CONFIG.INGREDIENTS.filter(item => !item.isCorrect).map(item => item.id).sort()
  assert.deepEqual(correct, ['costilla','cubios','habas','mazorca','papa'])
  assert.deepEqual(wrong, ['berenjena','brocoli','fresa'])
  assert.equal(new Set(COCINA_CONFIG.INGREDIENTS.map(item => item.id)).size, 8)
  assert.equal(COCINA_CONFIG.GAME_DURATION_MS, 30000)
  assert.ok(existsSync(new URL(`../public/${COCINA_ASSETS.costilla.path}`, import.meta.url)))
  const manager = new IngredientManager(scene(), { containsDropPoint: () => true, getSlotPosition: () => ({ x: 640, y: 300 }) })
  const recipe = new RecipeManager()
  manager.forceRecipeComplete()
  assert.deepEqual(manager.getIngredientsInPot().map(item => item.id).sort(), correct)
  assert.equal(recipe.getSnapshot(manager.getIngredientsInPot()).complete, true)
  manager.addWrongIngredient()
  assert.equal(recipe.getSnapshot(manager.getIngredientsInPot()).complete, false)
  manager.removeWrongIngredients()
  assert.equal(recipe.getSnapshot(manager.getIngredientsInPot()).complete, true)
})
test('audio tiene 19 claves y rutas únicas existentes', () => {
  const keys = Object.keys(AUDIO_CONFIG)
  assert.equal(keys.length, 19)
  assert.equal(new Set(keys.map(audioPath)).size, keys.length)
  for (const key of keys) assert.ok(existsSync(new URL(`../public/${audioPath(key)}`, import.meta.url)))
})

test('audio reemplaza música, separa volúmenes y libera efectos al salir', () => {
  const audio = new AudioManager(), sounds = []
  const view = { cache: { audio: { exists: () => true } }, events: new EventEmitter(), sound: { add(key) {
    const sound = Object.assign(new EventEmitter(), { key, destroyed: false,
      play(config) { this.volume = config.volume; this.loop = config.loop },
      setVolume(value) { this.volume = value }, destroy() { this.destroyed = true },
    })
    sounds.push(sound); return sound
  } } }
  audio.playMusic(view, 'menuMusic')
  audio.playMusic(view, 'papaMusic')
  assert.equal(sounds[0].destroyed, true)
  assert.equal(sounds[1].loop, true)
  audio.playEffect(view, 'papaGood')
  audio.setMusicVolume(0.2); audio.setSfxVolume(0.4)
  assert.equal(sounds[1].volume, 0.2); assert.equal(sounds[2].volume, 0.4)
  audio.setMuted(true)
  assert.equal(sounds[1].volume, 0); assert.equal(sounds[2].volume, 0)
  audio.setMuted(false)
  assert.equal(sounds[1].volume, 0.2)
  assert.equal(audio.playEffect(view, 'papaGood'), true)
  assert.equal(audio.playEffect(view, 'papaGood'), true)
  assert.equal(sounds.filter(sound => sound.key === 'papaGood').length, 3)
  assert.equal(audio.playEffect(view, 'tejoExplosion'), true)
  assert.equal(audio.playEffect(view, 'tejoExplosion'), true)
  assert.equal(sounds.filter(sound => sound.key === 'tejoExplosion').length, 2)
  assert.equal(audio.playEffect(view, 'cocuyWind', true), true)
  assert.equal(audio.playEffect(view, 'cocuyWind', true), false)
  const firstGood = sounds.find(sound => sound.key === 'papaGood')
  firstGood.emit('complete')
  assert.equal(sounds.filter(sound => sound.key === 'papaGood' && !sound.destroyed).length, 2)
  view.events.emit('shutdown')
  assert.ok(sounds.every(sound => sound.destroyed))
})
test('arte nuevo cubre ocho ingredientes, tres cuadros de fuego y piezas de Tejo', () => {
  const assets = [...Object.values(COCINA_ASSETS), ...Object.values(TEJO_ASSETS)]
  assert.equal(new Set(assets.map(asset => asset.key)).size, assets.length)
  for (const asset of assets) assert.ok(existsSync(new URL(`../public/${asset.path}`, import.meta.url)))
  for (const ingredient of COCINA_CONFIG.INGREDIENTS) assert.ok(COCINA_ASSETS[ingredient.id])
  assert.equal(new Set([COCINA_ASSETS.fuego1.key, COCINA_ASSETS.fuego2.key, COCINA_ASSETS.fuego3.key]).size, 3)
  assert.ok(audioPath('tejoExplosion').endsWith('.ogg'))
  assert.ok(audioPath('tejoCrowd').endsWith('.ogg'))
})
test('explosión ganadora conserva volumen y termina después del cambio de escena', () => {
  const audio = new AudioManager(), sounds = []
  const view = { cache: { audio: { exists: () => true } }, events: new EventEmitter(), sound: { add(key) {
    const sound = Object.assign(new EventEmitter(), { key, destroyed: false,
      play(config) { this.volume = config.volume }, setVolume(value) { this.volume = value },
      destroy() { this.destroyed = true },
    })
    sounds.push(sound); return sound
  } } }
  audio.playEffect(view, 'tejoExplosion', false, true)
  audio.playEffect(view, 'victory')
  assert.ok(Math.abs(sounds[0].volume - 0.8) < 0.00001)
  assert.equal(sounds[1].volume, 1)
  assert.equal(audio.settings.musicVolume, 0.29925)
  view.events.emit('shutdown')
  assert.equal(sounds[0].destroyed, false)
  assert.equal(sounds[1].destroyed, true)
  sounds[0].emit('complete')
  assert.equal(sounds[0].destroyed, true)
})

test('arte del 16 de octubre conserva 28 recursos únicos y todos los estados del mapa', () => {
  const assets = Object.values(SCENE_ASSETS)
  assert.equal(assets.length, 28)
  assert.equal(new Set(assets.map(asset => asset.key)).size, 28)
  assert.equal(new Set(assets.map(asset => asset.path)).size, 28)
  for (const asset of assets) assert.ok(existsSync(new URL(`../public/${asset.path}`, import.meta.url)))
  for (let i = 0; i <= 5; i++) assert.ok(SCENE_ASSETS[`map${i}`])
  for (let i = 1; i <= 6; i++) assert.ok(SCENE_ASSETS[`condorSide${i}`])
  for (let i = 1; i <= 2; i++) assert.ok(SCENE_ASSETS[`condorFlight${i}`])
})
test('comida queda delante del borde trasero y detrás del frente de la olla', () => {
  const view = scene(), images = []
  const originalImage = view.add.image
  view.add.image = (...args) => {
    const image = originalImage(...args)
    image.setCrop = (...crop) => { image.crop = crop; return image }
    images.push(image)
    return image
  }
  view.add.sprite = (x, y) => Object.assign(drawable(x, y), { play() { return this } })
  view.tweens.add = config => {
    config.targets.setPosition(config.x, config.y)
    config.onUpdate?.()
  }
  const pot = new CookingPot(view)
  const ingredient = new Ingredient(view, COCINA_CONFIG.INGREDIENTS[0])
  ingredient.placeInPot(pot.getSlotPosition(0))
  const [rear, front] = images.filter(image => image.texture.key === COCINA_ASSETS.ollaFrente.key)
  assert.ok(rear.depth < ingredient.container.depth)
  assert.ok(front.depth > ingredient.container.depth)
  assert.ok(front.crop[1] >= 25, 'el borde trasero del PNG no se dibuja encima de la comida')
  const stove = images.find(image => image.texture.key === COCINA_ASSETS.hornilla.key)
  assert.equal(rear.x, stove.x)
  // El último píxel visible de la base está en la fila 51 del PNG de 64 px.
  const visibleBaseY = rear.y + (51.5 / 64 - 0.5) * rear.height
  assert.ok(Math.abs(visibleBaseY - stove.y) < 1)
})

test('Cocuy desplaza montaña y vegetación continuamente sin reinicio cada 220 píxeles', () => {
  const view = scene()
  const graphics = drawable()
  graphics.fillGradientStyle = () => graphics
  view.add.graphics = () => graphics
  const image = view.add.image
  view.add.image = (...args) => {
    const item = image(...args)
    Object.defineProperty(item, 'displayHeight', { get() { return this.height } })
    return item
  }
  const world = new WorldScrollSystem(view)
  let previousY = world.scenery[0].y
  for (let elapsed = 100; elapsed <= 30000; elapsed += 100) {
    world.update(elapsed, 100)
    const y = world.scenery[0].y
    assert.ok(y > previousY)
    assert.ok(y - previousY < 4)
    previousY = y
    for (const cloud of world.clouds) {
      assert.ok(cloud.y >= -cloud.displayHeight / 2)
      assert.ok(cloud.y <= 720 + cloud.displayHeight / 2)
    }
  }
  assert.ok(world.scenery[1].y > 900)
  assert.ok(world.scenery[2].y > 900)
  world.destroy()
})
test('formato horizontal conserva ingredientes, carriles y controles dentro de 1280x720', () => {
  assert.equal(LOGICAL_WIDTH, 1280); assert.equal(LOGICAL_HEIGHT, 720)
  for (const item of COCINA_CONFIG.INGREDIENTS) {
    assert.ok(item.x >= 60 && item.x <= LOGICAL_WIDTH - 60)
    assert.ok(item.y >= 120 && item.y <= LOGICAL_HEIGHT - 150)
  }
  for (const x of RUANA_CONFIG.LANE_END_POSITIONS) assert.ok(x > 50 && x < LOGICAL_WIDTH - 50)
  assert.ok(COCUY_CONFIG.PLAYER_MAX_X < LOGICAL_WIDTH)
  assert.ok(TEJO_CONFIG.THROW_START_Y < LOGICAL_HEIGHT - 60)
  assert.ok(PAPA_CONFIG.POTATO_SPAWN_Y < LOGICAL_HEIGHT)
  assert.ok(existsSync(new URL('../public/assets/branding/logo-gobernacion.png', import.meta.url)))
})

test('HUD mínimo oculta los indicadores anteriores sin eliminar los controles DEV', () => {
  const objects = [drawable(), drawable()]
  objects[1].depth = 902
  for (const node of objects) node.setVisible = value => { node.visible = value; return node }
  applyHudLayers({ children: { list: objects } }, 0)
  assert.equal(objects[0].visible, false)
  assert.equal(objects[1].depth, 1802)
  const control = drawable()
  control.setVisible = value => { control.visible = value; return control }
  applyHudLayers({ children: { list: [control] } }, 0, false)
  assert.notEqual(control.visible, false)
})
test('Ruana mantiene amarillo, azul, rojo y blanco en notas y botones', () => {
  assert.deepEqual(RUANA_CONFIG.LANE_COLORS, [0xfacc15, 0x2563eb, 0xef4444, 0xffffff])
  const lanes = RUANA_CONFIG.LANE_END_POSITIONS.map((x, id) => ({ id, startX: x, startY: 300, endX: x, endY: 1040 }))
  const projector = { getLanes: () => lanes, project: lane => ({ x: lanes[lane].endX, y: 500, scale: 1 }) }
  const view = scene(), colors = []
  view.add.rectangle = (x, y, width, height, color) => {
    const item = drawable(x, y)
    item.color = color
    item.setFillStyle = next => { item.color = next; return item }
    colors.push(item)
    return item
  }
  new HitZone(view, projector)
  assert.deepEqual(colors.slice(0, 4).map(item => item.color), [...RUANA_CONFIG.LANE_COLORS])
  for (let lane = 0; lane < 4; lane++) {
    const note = new RhythmNote(view, { id: `test-${lane}`, lane, hitTime: 500 }, projector)
    assert.equal(note.shape.color, RUANA_CONFIG.LANE_COLORS[lane])
    note.markJudged(0x123456)
    assert.equal(note.shape.color, RUANA_CONFIG.LANE_COLORS[lane])
  }
})
test('Cocina muestra temperatura, cocción y quemado sin invadir botones', () => {
  const view = scene()
  view.children = { list: [] }
  const graphics = drawable()
  graphics.strokeRoundedRect = () => graphics
  graphics.setVisible = value => { graphics.visible = value; return graphics }
  view.add.graphics = () => { view.children.list.push(graphics); return graphics }
  view.add.text = (x, y, contents) => {
    const item = drawable(x, y)
    item.contents = contents
    item.setText = value => { item.contents = value; return item }
    view.children.list.push(item)
    return item
  }
  const display = new CookingDisplay(view)
  const snapshot = { ...new CookingSystem().getSnapshot(), temperature: 0.65, cookingProgress: 40, burnProgress: 25 }
  display.update(snapshot, true)
  assert.deepEqual(display.bars.map(bar => bar.value.contents), ['65%','40%','25%'])
  for (const bar of display.bars) {
    assert.ok(bar.x >= 0 && bar.x + bar.width <= LOGICAL_WIDTH)
    assert.ok(bar.y + 64 <= COCINA_CONFIG.CONTROL_Y - COCINA_CONFIG.CONTROL_TOUCH_HEIGHT / 2)
  }
  display.update(snapshot, false)
  assert.equal(graphics.visible, false)
})

test('viewport lee el contenedor nuevo antes de escalar al rotar un celular', () => {
  browser()
  const oldFrame = globalThis.requestAnimationFrame, oldCancel = globalThis.cancelAnimationFrame
  globalThis.requestAnimationFrame = callback => { callback(); return 1 }
  globalThis.cancelAnimationFrame = () => {}
  try {
    const app = { style: {} }, rendered = [], parent = { width: 1280, height: 720 }
    document.getElementById = () => app
    window.visualViewport = Object.assign(new EventTarget(), { width: 844, height: 390, offsetLeft: 0, offsetTop: 0 })
    const game = { scale: {
      getParentBounds() { parent.width = parseFloat(app.style.width); parent.height = parseFloat(app.style.height) },
      refresh() { rendered.push({ ...parent }) },
    }, events: new EventEmitter(), scene: { getScenes: () => [] } }
    installMobileViewport(game)
    assert.deepEqual(rendered.at(-1), { width: 844, height: 390 })
    window.visualViewport.width = 390; window.visualViewport.height = 844
    window.visualViewport.dispatchEvent(new Event('resize'))
    assert.deepEqual(rendered.at(-1), { width: 390, height: 844 })
    window.visualViewport.width = 900; window.visualViewport.height = 420
    window.visualViewport.dispatchEvent(new Event('resize'))
    assert.deepEqual(rendered.at(-1), { width: 900, height: 420 })
    game.events.emit('destroy')
  } finally { globalThis.requestAnimationFrame = oldFrame; globalThis.cancelAnimationFrame = oldCancel }
})

test('viewport sigue la altura visible del navegador y libera sus listeners', () => {
  browser()
  const previousFrame = globalThis.requestAnimationFrame, previousCancel = globalThis.cancelAnimationFrame
  globalThis.requestAnimationFrame = callback => { callback(); return 1 }
  globalThis.cancelAnimationFrame = () => {}
  try {
    const app = { style: {} }
    document.getElementById = () => app
    window.visualViewport = Object.assign(new EventTarget(), { width: 900, height: 380, offsetLeft: 0, offsetTop: 0 })
    let refreshes = 0
    const game = { scale: { refresh: () => refreshes++ }, events: new EventEmitter(), scene: { getScenes: () => [{ scene: { key: 'MenuScene' } }] } }
    installMobileViewport(game)
    assert.equal(app.style.height, '380px')
    window.visualViewport.height = 340
    window.visualViewport.dispatchEvent(new Event('resize'))
    assert.equal(app.style.height, '340px')
    assert.equal(refreshes, 2)
    game.events.emit('prerender')
    assert.equal(app.style.backgroundImage, 'none')
    game.events.emit('destroy')
    window.visualViewport.height = 300
    window.visualViewport.dispatchEvent(new Event('resize'))
    assert.equal(app.style.height, '340px')
  } finally { globalThis.requestAnimationFrame = previousFrame; globalThis.cancelAnimationFrame = previousCancel }
})
test('pantalla expandida estira el fondo sin mover objetos ni cargar imágenes CSS', () => {
  browser()
  const previousFrame = globalThis.requestAnimationFrame, previousCancel = globalThis.cancelAnimationFrame
  globalThis.requestAnimationFrame = callback => { callback(); return 1 }
  globalThis.cancelAnimationFrame = () => {}
  try {
    const app = { style: {} }
    document.getElementById = () => app
    window.visualViewport = Object.assign(new EventTarget(), { width: 1000, height: 450, offsetLeft: 0, offsetTop: 0 })
    const background = Object.assign(drawable(640, 360), { texture: { key: SCENE_ASSETS.tejoBackground.key } })
    const foreground = Object.assign(drawable(640, 300), { texture: { key: TEJO_ASSETS.bocin.key } })
    const mountain = Object.assign(drawable(640, 420), { texture: { key: SCENE_ASSETS.summit.key } })
    const camera = { setScroll(x, y) { this.scrollX = x; this.scrollY = y } }
    const world = { cameras: { main: camera }, children: { list: [background, mountain, foreground] } }
    const game = { scale: { gameSize: { width: 1600, height: 720 }, refresh() {} }, events: new EventEmitter(), scene: { getScenes: () => [world] } }
    installMobileViewport(game)
    game.events.emit('prerender')
    assert.equal(background.width, 1600)
    assert.ok(mountain.width * 62 / 64 >= 1600)
    assert.equal(mountain.y, 420)
    assert.equal(background.height, 720)
    assert.equal(foreground.x, 640)
    assert.equal(foreground.x - camera.scrollX, 800)
    assert.equal(app.style.backgroundImage, 'none')
    game.scale.gameSize.width = 1800
    game.events.emit('prerender')
    assert.equal(background.width, 1800)
    assert.ok(mountain.width * 62 / 64 >= 1800)
    assert.equal(foreground.x - camera.scrollX, 900)
    game.events.emit('destroy')
  } finally { globalThis.requestAnimationFrame = previousFrame; globalThis.cancelAnimationFrame = previousCancel }
})
test('pantalla completa se solicita al soltar el botón de jugar, una sola vez', async () => {
  browser()
  let calls = 0
  document.documentElement = { requestFullscreen: async options => { calls++; assert.equal(options.navigationUI, 'hide') } }
  requestFullscreenOnPlay()
  assert.equal(calls, 0)
  window.dispatchEvent(new Event('pointerup'))
  await Promise.resolve()
  assert.equal(calls, 1)
  window.dispatchEvent(new Event('pointerup'))
  assert.equal(calls, 1)
})

test('rechazar o no soportar fullscreen no interrumpe el inicio del juego', async () => {
  browser()
  assert.equal(await requestGameFullscreen(), false)
  document.documentElement = { requestFullscreen: async () => { throw new Error('denegado') } }
  assert.equal(await requestGameFullscreen(), false)
  document.fullscreenElement = {}
  assert.equal(await requestGameFullscreen(), true)
})

test('fullscreen admite la variante WebKit cuando está disponible', async () => {
  browser()
  let calls = 0
  document.documentElement = { webkitRequestFullscreen: () => { calls++ } }
  assert.equal(await requestGameFullscreen(), true)
  assert.equal(calls, 1)
})
