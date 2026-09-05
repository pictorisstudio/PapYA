import Phaser from 'phaser'
import { RUANA_CONFIG } from '../config/ruanaConfig'
import RhythmNote from '../entities/RhythmNote'
import type LaneProjector from './LaneProjector'
import type { RuanaBeatNote, RuanaLaneId } from '../types/RuanaTypes'

export default class NoteManager {
  private readonly activeNotes: RhythmNote[] = []
  private nextSpawnIndex = 0
  private completedNotes = 0

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly beatmap: RuanaBeatNote[],
    private readonly projector: LaneProjector,
  ) {}

  update(currentTime: number): RhythmNote[] {
    this.spawnDueNotes(currentTime)

    const missedNotes: RhythmNote[] = []

    for (const note of this.activeNotes) {
      note.update(currentTime)

      if (!note.isJudged() && currentTime > note.hitTime + RUANA_CONFIG.GOOD_WINDOW_MS) {
        missedNotes.push(note)
      }
    }

    this.removeFinishedNotes(currentTime)
    return missedNotes
  }

  markNoteJudged(noteId: string, resultColor: number): void {
    const note = this.activeNotes.find((activeNote) => activeNote.id === noteId)

    if (!note || note.isJudged()) {
      return
    }

    note.markJudged(resultColor)
    this.completedNotes += 1
  }

  markMissed(note: RhythmNote): void {
    if (note.isJudged()) {
      return
    }

    note.markJudged(RUANA_CONFIG.COLORS.threadGood, 0.28)
    this.completedNotes += 1
  }

  getActiveNotes(): readonly RhythmNote[] {
    return this.activeNotes
  }

  findFirstEvaluableNote(laneId?: RuanaLaneId): RhythmNote | null {
    return this.activeNotes.find((note) => !note.isJudged() && (laneId === undefined || note.lane === laneId)) ?? null
  }

  getNextNote(): RhythmNote | RuanaBeatNote | null {
    const nextActive = this.activeNotes.find((note) => !note.isJudged())

    if (nextActive) {
      return nextActive
    }

    return this.beatmap[this.nextSpawnIndex] ?? null
  }

  isFinished(): boolean {
    return this.completedNotes >= this.beatmap.length && this.activeNotes.length === 0
  }

  destroy(): void {
    for (const note of this.activeNotes) {
      note.destroy()
    }

    this.activeNotes.length = 0
  }

  private spawnDueNotes(currentTime: number): void {
    while (
      this.nextSpawnIndex < this.beatmap.length &&
      currentTime >= this.beatmap[this.nextSpawnIndex].hitTime - RUANA_CONFIG.NOTE_TRAVEL_TIME
    ) {
      this.activeNotes.push(new RhythmNote(this.scene, this.beatmap[this.nextSpawnIndex], this.projector))
      this.nextSpawnIndex += 1
    }
  }

  private removeFinishedNotes(currentTime: number): void {
    for (let index = this.activeNotes.length - 1; index >= 0; index -= 1) {
      const note = this.activeNotes[index]
      const shouldRemove = note.isJudged() && currentTime > note.hitTime + 360

      if (shouldRemove) {
        note.destroy()
        this.activeNotes.splice(index, 1)
      }
    }
  }
}
