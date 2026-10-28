import { RUANA_BEATMAP_PROTOTYPE } from './beatmapPrototype'
import { RUANA_CONFIG } from './ruanaConfig'
import type { RuanaBeatNote, RuanaLaneId } from '../types/RuanaTypes'

// Mismo pulso base; la dificultad agrega contratiempos y luego acordes de dos dedos.
const PATTERNS: readonly (readonly RuanaLaneId[])[] = [
  [0, 1, 2, 3, 2, 1, 0, 1],
  [0, 2, 1, 3, 0, 1, 3, 2],
  [0, 3, 1, 2, 0, 2, 3, 1],
  [0, 1, 3, 2, 1, 0, 2, 3],
  [0, 3, 1, 2, 3, 0, 2, 1],
]

export function buildRuanaBeatmap(difficulty: number): RuanaBeatNote[] {
  const level = Number.isFinite(difficulty) ? Math.max(0, Math.min(4, Math.floor(difficulty))) : 0
  const pattern = PATTERNS[level]!
  const notes: RuanaBeatNote[] = []
  const add = (beat: number, lane: RuanaLaneId, time: number, kind: string) =>
    notes.push({ id: `ruana-${level}-${beat}-${kind}`, lane, hitTime: time })
  RUANA_BEATMAP_PROTOTYPE.forEach((base, index, beats) => {
    const lane = pattern[index % pattern.length]!
    add(index, lane, base.hitTime, 'beat')
    if (level >= 3 && index > 0 && index % 4 === 0)
      add(index, ((lane + 2) % 4) as RuanaLaneId, base.hitTime, 'chord')
    const offbeat = level === 1 ? index % 4 === 3
      : level >= 2 && (index % 2 === 1 || (level === 4 && index % 4 === 2))
    if (offbeat && index < beats.length - 1) {
      const nextLane = pattern[(index + 1) % pattern.length]!
      const extraLane = ([0, 1, 2, 3] as RuanaLaneId[]).find(candidate => candidate !== lane && candidate !== nextLane)!
      add(index, extraLane, (base.hitTime + beats[index + 1]!.hitTime) / 2, 'offbeat')
    }
  })
  return notes.sort((a, b) => a.hitTime - b.hitTime)
}

export function ruanaDuration(beatmap: readonly RuanaBeatNote[]): number {
  return (beatmap.at(-1)?.hitTime ?? 0) + RUANA_CONFIG.NOTE_FINISH_DELAY_MS
}
