import { TrompoMatch } from '../src/multiplayer/TrompoMatch.ts'

export function finishMatch(room) {
  room.status = 'finished'
  room.wins ??= [0, 0]
  room.wins[room.match.winner]++
}

export function voteRematch(room, player, matchNumber, now) {
  if (room.status !== 'finished' || matchNumber !== (room.matchNumber ?? 1)) return false
  room.rematch ??= [false, false]
  const changed = !room.rematch[player]
  room.rematch[player] = true
  if (room.rematch.every(Boolean)) {
    room.matchNumber = matchNumber + 1
    room.rematch = [false, false]
    room.match = new TrompoMatch()
    room.status = 'playing'
    room.tickAt = now
    for (const participant of room.players) {
      participant.input = { x: 0, y: 0 }
      participant.inputAt = 0
    }
  }
  return changed
}

export function matchSnapshot(room) {
  return {
    status: room.status, ...room.match,
    wins: room.wins ?? [0, 0],
    matchNumber: room.matchNumber ?? 1,
    rematch: room.rematch ?? [false, false],
  }
}
