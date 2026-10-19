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
      image: (x, y, key) => Object.assign(drawable(x, y), { texture: { key } }),
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
      textures: { exists: () => true }, cache: { audio: { exists: () => true } },
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
      add(key) { const music = { key, play() {}, destroy() {} }; sounds.push(music); return music },
    })
    const view = { cache: { audio: { exists: () => true } }, sound, events: new EventEmitter(), scene: { isActive: () => true } }
    audio.playMusic(view, 'menuMusic')
    await Promise.resolve(); await Promise.resolve()
    assert.equal(sound.unlocked, allowed)
    assert.equal(sounds.length, 0)
    // Simula el update de Phaser o el primer gesto permitido por el navegador.
    sound.locked = false
    sound.emit('unlocked')
    assert.equal(sounds.length, 1)
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

test('guía de Tejo coincide con el vuelo y dos mechas completan 10 puntos', () => {
  const page = scene(), dots = []
  page.add.graphics = () => Object.assign(drawable(), { strokeLineShape(line) { dots.push({ x: line.x2, y: line.y2 }); return this } })
  const aim = new TejoAimSystem(page)
  const shot = aim.update(690, 690)
  const flight = new TejoThrowSystem()
  let position
  const disc = { setPosition(point) { position = point }, setScale() {}, setRotation() {} }
  flight.start(shot, () => {})
  flight.update(shot.durationMs / 32, disc)
  assert.ok(Math.hypot(position.x - dots[0].x, position.y - dots[0].y) < 0.001)
  assert.ok(Math.hypot(dots.at(-1).x - shot.target.x, dots.at(-1).y - shot.target.y) < 0.001)
  const score = new TejoScoreManager()
  assert.equal(score.registerImpact('MECHA').victory, false)
  assert.equal(score.registerImpact('MECHA').victory, true)
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
  let launches = 0
  page.disc = { contains: () => true, setHighlighted() {}, setPosition() {}, reset() {}, setTouchAreaVisible() {} }
  page.aimSystem = { update: () => ({}), getCurrentAim: () => ({}), hasValidDrag: () => true, clear() {} }
  page.throwSystem = { start() { launches++ } }
  page.refreshHud = () => {}
  page.handlePointerDown({ id: 1, worldX: 640, worldY: 622 })
  page.handlePointerUp({ id: 2 })
  assert.equal(launches, 0)
  page.handlePointerUp({ id: 1 })
  page.handlePointerUp({ id: 1 })
  assert.equal(launches, 1)
  page.phase = 'READY'
  page.handlePointerDown({ id: 3, worldX: 640, worldY: 622 })
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
  for (let run = 1; run <= 6; run++) {
    MINIGAME_ORDER.forEach(key => gameManager.completeCurrentMinigame(outcome(key, true)))
    gameManager.finishRun()
    const rate = gameManager.pace
    gameManager.finishRun()
    assert.equal(gameManager.pace, rate)
    assert.equal(rate, 30 / [30,27,24,21,18][Math.min(run,4)])
    gameManager.startNewRun([...MINIGAME_ORDER], false, true)
    assert.equal(gameManager.pace, rate)
  }
  MINIGAME_ORDER.forEach(key => gameManager.completeCurrentMinigame(outcome(key, false)))
  gameManager.finishRun()
  assert.equal(gameManager.pace, 30 / 18)
  gameManager.startNewRun()
  assert.equal(gameManager.pace, 1)
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
