export type RuanaJudgeResult = 'PERFECT' | 'GOOD' | 'MISS'
export type RuanaLaneId = 0 | 1 | 2 | 3

export interface RuanaBeatNote {
  id: string
  lane: RuanaLaneId
  hitTime: number
}

export interface RuanaJudgement {
  result: RuanaJudgeResult
  offsetMs: number
  noteId?: string
  lane?: RuanaLaneId
}

export interface RuanaLaneDefinition {
  id: RuanaLaneId
  startX: number
  endX: number
  startY: number
  endY: number
}

export interface RuanaProjection {
  x: number
  y: number
  scale: number
  visualProgress: number
}

export interface RuanaDebugSnapshot {
  clockMs: number
  nextNoteMs: number | null
  nextNoteLane: RuanaLaneId | null
  nextNoteProgress: number | null
  offsetMs: number | null
  activeNotes: number
  fps: number
}
