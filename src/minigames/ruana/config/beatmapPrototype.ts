import type { RuanaBeatNote } from '../types/RuanaTypes'

// Pulso estimado de Musica_tejiendolaRuana: 140 BPM. Ajustables sin alterar el audio.
export const RUANA_MUSIC_TIMING = { bpm: 140, beatOffsetMs: 176, firstBeat: 5, baseNotes: 64 } as const
export const RUANA_BEATMAP_PROTOTYPE: RuanaBeatNote[] = Array.from(
  { length: RUANA_MUSIC_TIMING.baseNotes }, (_, index) => ({
    id: `r${index + 1}`, lane: (index % 4) as 0 | 1 | 2 | 3,
    hitTime: (RUANA_MUSIC_TIMING.firstBeat + index) * 60000 / RUANA_MUSIC_TIMING.bpm
      + RUANA_MUSIC_TIMING.beatOffsetMs,
  }),
)
