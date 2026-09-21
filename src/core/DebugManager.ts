export default class DebugManager {
  private autoPlaceholders = true
  private showTouchAreas = true
  private ruanaGuides = false
  private papaHitboxes = false

  isAutoPlayEnabled(): boolean {
    return this.autoPlaceholders
  }

  toggleAutoPlaceholders(): boolean {
    this.autoPlaceholders = !this.autoPlaceholders
    return this.autoPlaceholders
  }

  areTouchAreasVisible(): boolean {
    return this.showTouchAreas
  }

  toggleTouchAreas(): boolean {
    this.showTouchAreas = !this.showTouchAreas
    return this.showTouchAreas
  }

  areRuanaGuidesVisible(): boolean {
    return this.showTouchAreas || this.ruanaGuides
  }

  toggleRuanaGuides(): boolean {
    this.ruanaGuides = !this.ruanaGuides
    return this.ruanaGuides
  }

  arePapaHitboxesVisible(): boolean {
    return this.showTouchAreas || this.papaHitboxes
  }

  togglePapaHitboxes(): boolean {
    this.papaHitboxes = !this.papaHitboxes
    return this.papaHitboxes
  }
}
