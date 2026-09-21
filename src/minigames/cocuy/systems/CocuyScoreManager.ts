export default class CocuyScoreManager {
  calculateScore(altitude: number, remainingMs: number, rockHits: number): number {
    const altitudeScore = Math.round(altitude * 2)
    const timeBonus = Math.ceil(remainingMs / 1000) * 8
    const hitPenalty = rockHits * 30
    return Math.max(0, altitudeScore + timeBonus - hitPenalty)
  }
}
