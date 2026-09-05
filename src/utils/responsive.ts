import { SAFE_MARGIN } from '../config/constants'

export function getSafeBounds(width: number, height: number) {
  return {
    left: SAFE_MARGIN,
    right: width - SAFE_MARGIN,
    top: SAFE_MARGIN,
    bottom: height - SAFE_MARGIN,
    centerX: width / 2,
    centerY: height / 2,
  }
}
