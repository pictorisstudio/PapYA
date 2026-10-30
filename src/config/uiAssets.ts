export const MENU_BUTTON_SIZE = { width: 380, height: 138 } as const
export const MENU_MAIN_BUTTON_FRAMES = [
  { key: 'art-travelButton', crop: [2, 15, 124, 45] },
  { key: 'art-mapButton', crop: [4, 15, 122, 44] },
] as const
export const MENU_UI_ASSETS = {
  instructions: { key: 'ui-instructions', path: 'assets/ui/menu/Boton_Intrucciones.png', crop: [2, 14, 124, 43] },
  resume: { key: 'ui-resume', path: 'assets/ui/menu/CONTINUAR.png', crop: [44, 36, 139, 70] },
  menu: { key: 'ui-return-menu', path: 'assets/ui/menu/VOLERALMENU.png', crop: [26, 38, 194, 74] },
} as const
export const GUIDE_FRAMES = [1, 2, 3, 4].map(frame => ({
  key: frame === 1 ? 'papa-guide' : `papa-guide-${frame}`, path: `assets/ui/guide/HADAframe${frame}.png`,
}))
export const SACK_ASSETS = [
  { key: 'papa-sack-empty', path: 'assets/minigames/papa/COSTAL.png' },
  { key: 'papa-sack-half', path: 'assets/minigames/papa/COSTALMEDIOLLENO.png' },
  { key: 'papa-sack-full', path: 'assets/minigames/papa/COSTALLLENO.png' },
] as const
