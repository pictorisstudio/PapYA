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
  for (const method of ['setVisible', 'setStrokeStyle', 'setOrigin', 'setInteractive', 'setScale', 'setFillStyle', 'setAlpha',
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
  assert.equal(potato.contains(640 + 25, 360 + 25), false)
  potato.update(250)
  assert.equal(potato.sprite.rotation, Math.PI / 4)
  assert.equal(potato.container.rotation ?? 0, 0)
  assert.equal(potato.contains(potato.x + 25, potato.y + 25), false)
  potato.container.setScale(0.86)
  assert.equal(potato.contains(potato.x + 26, potato.y), false)
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
  page.add.graphics = () => Object.assign(drawable(), { fillCircle(x, y) { dots.push({ x, y }); return this } })
  const aim = new TejoAimSystem(page)
  const shot = aim.update(690, 690)
  const flight = new TejoThrowSystem()
  let position
  const disc = { setPosition(point) { position = point }, setScale() {}, setRotation() {} }
  flight.start(shot, () => {})
  flight.update(shot.durationMs / TEJO_CONFIG.PREVIEW_DOTS, disc)
  assert.ok(Math.hypot(position.x - dots[0].x, position.y - dots[0].y) < 0.001)
  assert.ok(Math.hypot(dots.at(-1).x - shot.target.x, dots.at(-1).y - shot.target.y) < 0.001)
  const score = new TejoScoreManager()
  assert.equal(score.registerImpact('MECHA').victory, false)
  assert.equal(score.registerImpact('MECHA').victory, true)
})

test('Cocina conserva agarre, bloquea segundo arrastre y cancela limpiamente', () => {
  const pot = { containsDropPoint: () => true, getSlotPosition: () => ({ x: 640, y: 360 }) }
  const manager = new IngredientManager(scene(), pot)
  assert.equal(manager.startDrag(156, 174), true)
  assert.equal(manager.startDrag(330, 150), false)
  manager.dragTo(300, 300)
  assert.equal(manager.dropAt(300, 300), false)
  assert.equal(manager.getIngredientsInPot()[0].id, 'cubios')
  assert.equal(manager.startDrag(1094, 520), true)
  assert.equal(manager.dropAt(640, 360), true)
  assert.equal(manager.dropAt(640, 360), false)
  manager.startDrag(330, 150); manager.cancelDrag()
  assert.equal(manager.startDrag(330, 150), true)
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
  { name: 'todas abiertas y viaje sin victorias', wins: 0, before: 5, message: TEXTS.runEnd.allRoutes },
]) {
  test(`cierre breve: ${scenario.name}, guarda una vez y continúa automáticamente`, () => {
    browser(); gameManager.initialize()
    for (let i = 0; i < scenario.before; i++) gameManager.progressManager.unlockNextRoute()
    gameManager.startNewRun([...MINIGAME_ORDER])
    MINIGAME_ORDER.forEach((key, i) => gameManager.completeCurrentMinigame(outcome(key, i < scenario.wins)))
    const page = new ResultsScene(), view = scene()
    page.scene = view.scene; page.add = view.add; page.time = view.time
    page.cameras = { main: { setBackgroundColor() {} } }
    page.create()
    assert.deepEqual(view.texts, [scenario.message])
    assert.equal(gameManager.progressManager.getSaveData().totalRuns, 1)
    gameManager.finishRun()
    assert.equal(gameManager.progressManager.getSaveData().totalRuns, 1)
    assert.equal(view.timers[0].delay, ROUTE_MESSAGE_DURATION_MS)
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
