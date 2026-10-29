// Rutas relativas a public. Claves únicas compartidas por todas las escenas.
export const AUDIO_CONFIG = {
  menuMusic: { path: '00_menu/musica-menu.wav', kind: 'music' },
  ruanaMusic: { path: '01_ruana/musica-ruana.wav', kind: 'music' },
  ruanaHit: { path: '01_ruana/acierto-ritmico.wav', kind: 'sfx' },
  papaMusic: { path: '02_papa/musica-papa.ogg', kind: 'music' },
  papaGood: { path: '02_papa/papa-buena.ogg', kind: 'sfx' },
  papaBad: { path: '02_papa/papa-mala.ogg', kind: 'sfx' },
  tejoMusic: { path: '03_tejo/musica-tejo.ogg', kind: 'music' },
  tejoThrow: { path: '03_tejo/lanzamiento.wav', kind: 'sfx' },
  tejoExplosion: { path: '03_tejo/explosion.ogg', kind: 'sfx' },
  tejoCrowd: { path: '03_tejo/publico.ogg', kind: 'sfx' },
  cocinaMusic: { path: '04_cocina/musica-cocina.mp3', kind: 'music' },
  cocinaIngredient: { path: '04_cocina/ingrediente.wav', kind: 'sfx' },
  cocinaBubbles: { path: '04_cocina/burbujas.wav', kind: 'sfx' },
  cocinaFire: { path: '04_cocina/fuego.wav', kind: 'sfx' },
  cocuyMusic: { path: '05_cocuy/musica-cocuy.ogg', kind: 'music' },
  cocuyWind: { path: '05_cocuy/viento.wav', kind: 'sfx' },
  cocuyCollision: { path: '05_cocuy/colision.ogg', kind: 'sfx' },
  victory: { path: '06_generales/victoria.wav', kind: 'sfx' },
  mapComplete: { path: '06_generales/mapa-completado.ogg', kind: 'sfx' },
} as const

export type AudioKey = keyof typeof AUDIO_CONFIG
export const audioPath = (key: AudioKey): string => `assets/audio/${AUDIO_CONFIG[key].path}`

// Efectos al máximo; la explosión mantiene su volumen anterior.
export const AUDIO_GAIN: Partial<Record<AudioKey, number>> = {
tejoExplosion: 0.8,
}
