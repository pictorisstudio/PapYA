import { RUANA_CONFIG } from '../config/ruanaConfig'
import type RhythmNote from '../entities/RhythmNote'
import type { RuanaJudgement, RuanaLaneId } from '../types/RuanaTypes'

export default class HitJudge {
  judge(currentTime: number, notes: readonly RhythmNote[], lane: RuanaLaneId): RuanaJudgement {
    const candidate = this.findClosestNote(currentTime, notes, lane)

    if (!candidate) {
      return { result: 'MISS', offsetMs: Number.POSITIVE_INFINITY, lane }
    }

    const offsetMs = Math.round(currentTime - candidate.hitTime)
    const absoluteOffset = Math.abs(offsetMs)

    if (absoluteOffset <= RUANA_CONFIG.PERFECT_WINDOW_MS) {
      return { result: 'PERFECT', offsetMs, noteId: candidate.id, lane }
    }

    if (absoluteOffset <= RUANA_CONFIG.GOOD_WINDOW_MS) {
      return { result: 'GOOD', offsetMs, noteId: candidate.id, lane }
    }

    return { result: 'MISS', offsetMs, lane }
  }

  private findClosestNote(currentTime: number, notes: readonly RhythmNote[], lane: RuanaLaneId): RhythmNote | null {
    let closestNote: RhythmNote | null = null
    let closestDistance = Number.POSITIVE_INFINITY

    for (const note of notes) {
      if (note.isJudged() || note.lane !== lane) {
        continue
      }

      const distance = Math.abs(currentTime - note.hitTime)

      if (distance < closestDistance) {
        closestDistance = distance
        closestNote = note
      }
    }

    return closestNote
  }
}
