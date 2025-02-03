import { browser } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function vibrate(pattern: number | number[]) {
  if (Capacitor.isNativePlatform()) void Haptics.impact({ style: ImpactStyle.Medium });
  else if (browser && 'vibrate' in navigator && navigator.vibrate) navigator.vibrate(pattern);
}
