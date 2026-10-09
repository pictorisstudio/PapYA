export default class DebugManager {
  private controlsEnabled = false
  private autoPlaceholders = false
  private showTouchAreas = false
  private ruanaGuides = false
  private papaHitboxes = false

  areControlsEnabled(): boolean { return this.controlsEnabled }
  toggleControls(): boolean {
    this.controlsEnabled = !this.controlsEnabled
    return this.controlsEnabled
  }

  isAutoPlayEnabled(): boolean {
    return this.autoPlaceholders
  }

  toggleAutoPlaceholders(): boolean {
    this.autoPlaceholders = !this.autoPlaceholders
    return this.autoPlaceholders
  }

  areTouchAreasVisible(): boolean {
    return this.controlsEnabled && this.showTouchAreas
  }

  toggleTouchAreas(): boolean {
    this.showTouchAreas = !this.showTouchAreas
    return this.showTouchAreas
  }

  areRuanaGuidesVisible(): boolean {
    return this.controlsEnabled && (this.showTouchAreas || this.ruanaGuides)
  }

  toggleRuanaGuides(): boolean {
    this.ruanaGuides = !this.ruanaGuides
    return this.ruanaGuides
  }

  arePapaHitboxesVisible(): boolean {
    return this.controlsEnabled && (this.showTouchAreas || this.papaHitboxes)
  }

  togglePapaHitboxes(): boolean {
    this.papaHitboxes = !this.papaHitboxes
    return this.papaHitboxes
  }
}
