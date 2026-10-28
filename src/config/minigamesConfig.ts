import { TEXTS } from './texts'
import type { MinigameConfig, MinigameKey } from '../types/Minigame'

// Prueba reversible: false devuelve Cocina a la ronda, sin borrar escenas ni assets.
export const USE_TROMPO_PROTOTYPE = true
export const MINIGAME_ORDER: MinigameKey[] = ['ruana', USE_TROMPO_PROTOTYPE ? 'trompo' : 'cocina', 'papa', 'tejo', 'cocuy']

export const MINIGAMES_CONFIG: Record<MinigameKey, MinigameConfig> = {
  trompo: {
    key: 'trompo', sceneKey: 'TrompoScene', name: TEXTS.minigames.trompo.name,
    instruction: TEXTS.minigames.trompo.objective, backgroundColor: 0x25453c,
  },
  ruana: {
    key: 'ruana',
    sceneKey: 'RuanaScene',
    name: TEXTS.minigames.ruana.name,
    instruction: TEXTS.minigames.ruana.objective,
    backgroundColor: 0x233047,
  },
  cocina: {
    key: 'cocina',
    sceneKey: 'CocinaScene',
    name: TEXTS.minigames.cocina.name,
    instruction: TEXTS.minigames.cocina.objective,
    backgroundColor: 0x3a2a20,
  },
  papa: {
    key: 'papa',
    sceneKey: 'PapaScene',
    name: TEXTS.minigames.papa.name,
    instruction: TEXTS.minigames.papa.objective,
    backgroundColor: 0x263821,
  },
  tejo: {
    key: 'tejo',
    sceneKey: 'TejoScene',
    name: TEXTS.minigames.tejo.name,
    instruction: TEXTS.minigames.tejo.objective,
    backgroundColor: 0x392235,
  },
  cocuy: {
    key: 'cocuy',
    sceneKey: 'CocuyScene',
    name: TEXTS.minigames.cocuy.name,
    instruction: TEXTS.minigames.cocuy.objective,
    backgroundColor: 0x1e3a43,
  },
}
