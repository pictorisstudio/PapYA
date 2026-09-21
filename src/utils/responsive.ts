import { SAFE_MARGIN, SAFE_MARGIN_X, SAFE_MARGIN_Y } from '../config/constants'

export function getSafeBounds(width: number, height: number) {
  return {
    left: SAFE_MARGIN_X,
    right: width - SAFE_MARGIN_X,
    top: SAFE_MARGIN_Y,
    bottom: height - SAFE_MARGIN_Y,
    centerX: width / 2,
    centerY: height / 2,
    margin: SAFE_MARGIN,
  }
}
