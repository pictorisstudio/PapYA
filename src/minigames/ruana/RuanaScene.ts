import Phaser from 'phaser'
import DebugPanel from '../../components/DebugPanel'
import { DEBUG_MODE } from '../../config/constants'
import { gameManager } from '../../core/GameManager'
import { RUANA_BEATMAP_PROTOTYPE } from './config/beatmapPrototype'
import { RUANA_CONFIG } from './config/ruanaConfig'
import HitJudge from './systems/HitJudge'
import LaneProjector from './systems/LaneProjector'
import NoteManager from './systems/NoteManager'
import RhythmClock from './systems/RhythmClock'
import RuanaScoreManager from './systems/RuanaScoreManager'
import HitZone from './ui/HitZone'
import RuanaHUD from './ui/RuanaHUD'
import RuanaProgressDisplay from './ui/RuanaProgressDisplay'
import RhythmNote from './entities/RhythmNote'
import type { RuanaJudgement, RuanaLaneId } from './types/RuanaTypes'

type RuanaPhase = 'intro' | 'countdown' | 'playing' | 'finished'

export default class RuanaScene extends Phaser.Scene {
  private clock?: RhythmClock
  private noteManager?: NoteManager
  private judge?: HitJudge
  private projector?: LaneProjector
  private scoreManager?: RuanaScoreManager
  private hitZone?: HitZone
  private hud?: RuanaHUD
  private progressDisplay?: RuanaProgressDisplay
  private debugPreviewNote?: RhythmNote
  private phase: RuanaPhase = 'intro'
  private inputHandler?: (pointer: Phaser.Input.Pointer) => void
  private cleanupEvents: Phaser.Time.TimerEvent[] = []
  private lastOffsetMs: number | null = null
  private finished = false

  constructor() {
    super('RuanaScene')
  }

  create(): void {
    this.resetSceneState()
    this.projector = new LaneProjector()
    this.createPlaceholderLoom()

    this.clock = new RhythmClock()
    this.noteManager = new NoteManager(this, RUANA_BEATMAP_PROTOTYPE, this.projector)
    this.judge = new HitJudge()
    this.scoreManager = new RuanaScoreManager(RUANA_BEATMAP_PROTOTYPE.length)
    this.hitZone = new HitZone(this, this.projector)
    this.hitZone.setGuidesVisible(DEBUG_MODE && gameManager.debugManager.areRuanaGuidesVisible())
    this.progressDisplay = new RuanaProgressDisplay(this, 640, 670, RUANA_BEATMAP_PROTOTYPE.length)
    this.hud = new RuanaHUD(this, {
      forcePerfect: () => this.forcePerfect(),
      forceMiss: () => this.forceMiss(),
      finishNow: () => this.finishNow(),
      toggleGuides: () => this.toggleGuides(),
      resumeClock: () => this.resumeClock(),
      previewProgress: (progress) => this.previewProgress(progress),
      restart: () => this.scene.restart(),
    })
    this.refreshHud()

    new DebugPanel(this)
    this.startIntro()
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup())
  }

  update(): void {
    if (this.phase !== 'playing' || !this.clock || !this.noteManager || !this.scoreManager || !this.hud) {
      return
    }

    const currentTime = this.clock.getCurrentTime()
    const missedNotes = this.noteManager.update(currentTime)

    for (const missedNote of missedNotes) {
      this.noteManager.markMissed(missedNote)
      this.scoreManager.register('MISS')
      this.hud.showFeedback('MISS')
    }

    this.refreshHud()
    this.hud.updateDebug({
      clockMs: currentTime,
      nextNoteMs: this.noteManager.getNextNote()?.hitTime ?? null,
      nextNoteLane: this.noteManager.getNextNote()?.lane ?? null,
      nextNoteProgress: this.getNextNoteProgress(currentTime),
      offsetMs: this.lastOffsetMs,
      activeNotes: this.noteManager.getActiveNotes().length,
      fps: this.game.loop.actualFps,
    })

    if (this.noteManager.isFinished()) {
      this.finishWithScore()
    }
  }

  private startIntro(): void {
    this.phase = 'intro'

    const introText = this.add
      .text(640, 306, 'Tejiendo la Ruana\nToca cuando el hilo llegue a la marca', {
        fontSize: '36px',
        color: '#f8fafc',
        align: 'center',
        lineSpacing: 14,
      })
      .setOrigin(0.5)

    this.trackTimer(
      this.time.delayedCall(RUANA_CONFIG.INTRO_DURATION_MS, () => {
        introText.destroy()
        this.startCountdown()
      }),
    )
  }

  private startCountdown(): void {
    this.phase = 'countdown'
    const countdownSteps = ['3', '2', '1', '¡YA!']
    const countdownText = this.add.text(640, 306, '', { fontSize: '82px', fontStyle: '700', color: '#fbbf24' }).setOrigin(0.5)

    countdownSteps.forEach((step, index) => {
      this.trackTimer(
        this.time.delayedCall(index * RUANA_CONFIG.COUNTDOWN_STEP_MS, () => {
          countdownText.setText(step)
        }),
      )
    })

    this.trackTimer(
      this.time.delayedCall(countdownSteps.length * RUANA_CONFIG.COUNTDOWN_STEP_MS, () => {
        countdownText.destroy()
        this.startGameplay()
      }),
    )
  }

  private startGameplay(): void {
    this.phase = 'playing'
    this.clock?.start()
    this.inputHandler = (pointer) => this.handleTap(pointer)
    this.input.on('pointerdown', this.inputHandler)
  }

  private handleTap(pointer: Phaser.Input.Pointer): void {
    if (this.phase !== 'playing' || !this.clock || !this.noteManager || !this.judge || !this.hitZone) {
      return
    }

    const lane = this.hitZone.getLaneAt(pointer.worldX, pointer.worldY)

    if (lane === null) {
      return
    }

    const judgement = this.judge.judge(this.clock.getCurrentTime(), this.noteManager.getActiveNotes(), lane)
    this.applyJudgement(judgement, true)
  }

  private applyJudgement(judgement: RuanaJudgement, showFeedback: boolean): void {
    if (!this.noteManager || !this.scoreManager || !this.hud) {
      return
    }

    this.lastOffsetMs = Number.isFinite(judgement.offsetMs) ? judgement.offsetMs : null

    if (judgement.noteId) {
      const color =
        judgement.result === 'PERFECT'
          ? RUANA_CONFIG.COLORS.threadPerfect
          : judgement.result === 'GOOD'
            ? RUANA_CONFIG.COLORS.threadGood
            : RUANA_CONFIG.COLORS.threadMiss
      this.noteManager.markNoteJudged(judgement.noteId, color)
      this.scoreManager.register(judgement.result)
    }

    if (showFeedback) {
      this.hud.showFeedback(judgement.result, this.lastOffsetMs ?? undefined)
      if (judgement.lane !== undefined) {
        this.hitZone?.pulse(judgement.lane, judgement.result)
      }
    }

    this.refreshHud()
  }

  private forcePerfect(): void {
    const note = this.noteManager?.getActiveNotes().find((activeNote) => !activeNote.isJudged())

    if (!note) {
      this.hud?.showFeedback('MISS')
      return
    }

    this.applyJudgement({ result: 'PERFECT', offsetMs: 0, noteId: note.id, lane: note.lane }, true)
  }

  private forceMiss(): void {
    const note = this.noteManager?.getActiveNotes().find((activeNote) => !activeNote.isJudged())

    if (!note) {
      this.applyJudgement({ result: 'MISS', offsetMs: Number.POSITIVE_INFINITY }, true)
      return
    }

    this.applyJudgement({ result: 'MISS', offsetMs: Number.POSITIVE_INFINITY, noteId: note.id, lane: note.lane }, true)
  }

  private toggleGuides(): void {
    const visible = gameManager.debugManager.toggleRuanaGuides()
    this.hitZone?.setGuidesVisible(visible)
  }

  private finishNow(): void {
    this.finishWithScore()
  }

  private previewProgress(progress: number): void {
    if (!this.clock || !this.projector) {
      return
    }

    this.clock.pause()

    if (!this.debugPreviewNote) {
      this.debugPreviewNote = new RhythmNote(this, {
        id: 'debug-preview',
        lane: RUANA_CONFIG.DEBUG_PREVIEW_LANE as RuanaLaneId,
        hitTime: 0,
      }, this.projector)
    }

    this.debugPreviewNote.setProgress(progress)
  }

  private resumeClock(): void {
    this.debugPreviewNote?.destroy()
    this.debugPreviewNote = undefined
    this.clock?.resume()
  }

  private finishWithScore(): void {
    if (this.finished || !this.scoreManager || !this.hud) {
      return
    }

    this.finished = true
    this.phase = 'finished'
    this.clock?.pause()
    this.removeInputHandler()

    const score = this.scoreManager.getSnapshot()
    this.hud.showFinal(score.accuracy, score.victory)

    this.trackTimer(
      this.time.delayedCall(RUANA_CONFIG.RESULT_DURATION_MS, () => {
        const nextScene = gameManager.completeCurrentMinigame(score.victory)
        this.scene.start(nextScene === 'next' ? 'TransitionScene' : 'ResultsScene')
      }),
    )
  }

  private createPlaceholderLoom(): void {
    if (!this.projector) {
      return
    }

    this.cameras.main.setBackgroundColor(RUANA_CONFIG.COLORS.background)

    // TODO: reemplazar por telar y ruana pixel art finales.
    this.add.rectangle(640, 386, 1080, 450, RUANA_CONFIG.COLORS.loomPanel, 0.88).setStrokeStyle(4, 0x64748b)
    this.add.circle(RUANA_CONFIG.VANISHING_POINT_X, RUANA_CONFIG.VANISHING_POINT_Y, 8, 0xf8fafc, DEBUG_MODE ? 0.9 : 0)

    for (const lane of this.projector.getLanes()) {
      this.add.line(0, 0, lane.startX, lane.startY, lane.endX, lane.endY, RUANA_CONFIG.COLORS.laneLine, 0.68).setOrigin(0, 0)
      this.add.line(0, 0, RUANA_CONFIG.VANISHING_POINT_X, RUANA_CONFIG.VANISHING_POINT_Y, lane.startX, lane.startY, 0xffffff, DEBUG_MODE ? 0.3 : 0).setOrigin(0, 0)
    }

    if (DEBUG_MODE) {
      for (const progress of RUANA_CONFIG.DEBUG_PROGRESS_MARKS) {
        for (const lane of this.projector.getLanes()) {
          const mark = this.projector.project(lane.id, progress)
          this.add.circle(mark.x, mark.y, 4, 0xfbbf24, 0.55).setDepth(620)
        }
      }
    }

  }

  private refreshHud(): void {
    if (!this.scoreManager || !this.hud) {
      return
    }

    const state = gameManager.roundManager.getState()
    this.hud.update(this.scoreManager.getSnapshot(), state.victories, state.minigameOrder.length)
    this.progressDisplay?.setProgress(this.scoreManager.getSnapshot().notesHit)
  }

  private resetSceneState(): void {
    this.phase = 'intro'
    this.lastOffsetMs = null
    this.finished = false
    this.cleanupEvents = []
  }

  private trackTimer(timer: Phaser.Time.TimerEvent): void {
    this.cleanupEvents.push(timer)
  }

  private cleanup(): void {
    this.removeInputHandler()

    for (const timer of this.cleanupEvents) {
      timer.remove(false)
    }

    this.noteManager?.destroy()
    this.debugPreviewNote?.destroy()
    this.clock?.reset()
    this.noteManager = undefined
    this.clock = undefined
    this.judge = undefined
    this.projector = undefined
    this.scoreManager = undefined
    this.hud = undefined
    this.hitZone = undefined
    this.progressDisplay = undefined
    this.debugPreviewNote = undefined
  }

  private removeInputHandler(): void {
    if (!this.inputHandler) {
      return
    }

    this.input.off('pointerdown', this.inputHandler)
    this.inputHandler = undefined
  }

  private getNextNoteProgress(currentTime: number): number | null {
    const nextNote = this.noteManager?.getNextNote()

    if (!nextNote || !this.projector) {
      return null
    }

    return this.projector.getProgressForTime(currentTime, nextNote.hitTime)
  }
}
