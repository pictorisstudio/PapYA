import type { MinigameConfig, MinigameKey } from '../types/Minigame'

export const MINIGAME_ORDER: MinigameKey[] = ['ruana', 'cocina', 'papa', 'tejo', 'cocuy']

export const MINIGAMES_CONFIG: Record<MinigameKey, MinigameConfig> = {
  ruana: {
    key: 'ruana',
    sceneKey: 'RuanaScene',
    name: 'Tejiendo la Ruana',
    instruction: 'Sigue el ritmo del tejido provisional.',
    backgroundColor: 0x233047,
  },
  cocina: {
    key: 'cocina',
    sceneKey: 'CocinaScene',
    name: 'Maestro de la Cocina Campesina',
    instruction: 'Prepara la receta placeholder.',
    backgroundColor: 0x3a2a20,
  },
  papa: {
    key: 'papa',
    sceneKey: 'PapaScene',
    name: 'Cosecha de Papa',
    instruction: 'Recolecta papas de prueba.',
    backgroundColor: 0x263821,
  },
  tejo: {
    key: 'tejo',
    sceneKey: 'TejoScene',
    name: 'Tejo al Bocín',
    instruction: 'Apunta al objetivo provisional.',
    backgroundColor: 0x392235,
  },
  cocuy: {
    key: 'cocuy',
    sceneKey: 'CocuyScene',
    name: 'Ascenso al Cocuy',
    instruction: 'Avanza hacia la cima placeholder.',
    backgroundColor: 0x1e3a43,
  },
}
