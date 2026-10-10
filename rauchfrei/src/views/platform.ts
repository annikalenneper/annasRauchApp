/** True when the app was opened from the home screen instead of a browser tab. */
export function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches;
}

export function isIos(): boolean {
  const touchMac = navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || touchMac;
}
