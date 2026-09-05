import Phaser from 'phaser'
import { RUANA_CONFIG } from '../config/ruanaConfig'
import type LaneProjector from '../systems/LaneProjector'
import type { RuanaJudgeResult, RuanaLaneId } from '../types/RuanaTypes'

export default class HitZone {
  private readonly guides: Phaser.GameObjects.Rectangle[] = []
  private readonly zones = new Map<RuanaLaneId, Phaser.GameObjects.Rectangle>()
  private readonly feedbackLabels = new Map<RuanaLaneId, Phaser.GameObjects.Text>()

  constructor(private readonly scene: Phaser.Scene, projector: LaneProjector) {
    for (const lane of projector.getLanes()) {
      // TODO: reemplazar por zona visual final del telar.
      const zone = scene.add
        .rectangle(lane.endX, lane.endY, RUANA_CONFIG.HIT_ZONE_WIDTH, RUANA_CONFIG.HIT_ZONE_HEIGHT, RUANA_CONFIG.COLORS.hitZone, 0.82)
        .setStrokeStyle(3, 0xf8fafc, 0.85)
        .setDepth(650)

      const label = scene.add
        .text(lane.endX, lane.endY - 74, '', {
          fontSize: '24px',
          fontStyle: '700',
          color: '#ffffff',
        })
        .setOrigin(0.5)
        .setDepth(700)
        .setAlpha(0)

      this.zones.set(lane.id, zone)
      this.feedbackLabels.set(lane.id, label)
    }

    this.guides.push(
      ...projector.getLanes().map((lane) =>
        scene.add.rectangle(lane.endX, lane.endY, RUANA_CONFIG.HIT_ZONE_WIDTH + 70, RUANA_CONFIG.HIT_ZONE_HEIGHT + 34, RUANA_CONFIG.COLORS.goodWindow, 0.1),
      ),
      ...projector.getLanes().map((lane) =>
        scene.add.rectangle(lane.endX, lane.endY, RUANA_CONFIG.HIT_ZONE_WIDTH, RUANA_CONFIG.HIT_ZONE_HEIGHT + 18, RUANA_CONFIG.COLORS.perfectWindow, 0.16),
      ),
    )
  }

  getLaneAt(x: number, y: number): RuanaLaneId | null {
    for (const [laneId, zone] of this.zones) {
      const bounds = zone.getBounds()

      if (bounds.contains(x, y)) {
        return laneId
      }
    }

    return null
  }

  pulse(laneId: RuanaLaneId, result: RuanaJudgeResult): void {
    const zone = this.zones.get(laneId)
    const label = this.feedbackLabels.get(laneId)

    if (!zone || !label) {
      return
    }

    const color = result === 'PERFECT' ? '#6ee7b7' : result === 'GOOD' ? '#fbbf24' : '#f87171'
    zone.setAlpha(1)
    label.setText(result)
    label.setColor(color)
    label.setAlpha(1)

    this.scene.tweens.add({
      targets: [zone, label],
      alpha: { from: 1, to: 0.82 },
      duration: 230,
      ease: 'Sine.easeOut',
      onComplete: () => label.setAlpha(0),
    })
  }

  setGuidesVisible(visible: boolean): void {
    for (const guide of this.guides) {
      guide.setVisible(visible)
    }
  }
}
