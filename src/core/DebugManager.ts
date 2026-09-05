export default class DebugManager {
  private autoPlaceholders = true
  private ruanaGuides = true
  private papaHitboxes = false

  isAutoPlayEnabled(): boolean {
    return this.autoPlaceholders
  }

  toggleAutoPlaceholders(): boolean {
    this.autoPlaceholders = !this.autoPlaceholders
    return this.autoPlaceholders
  }

  areRuanaGuidesVisible(): boolean {
    return this.ruanaGuides
  }

  toggleRuanaGuides(): boolean {
    this.ruanaGuides = !this.ruanaGuides
    return this.ruanaGuides
  }

  arePapaHitboxesVisible(): boolean {
    return this.papaHitboxes
  }

  togglePapaHitboxes(): boolean {
    this.papaHitboxes = !this.papaHitboxes
    return this.papaHitboxes
  }
}
