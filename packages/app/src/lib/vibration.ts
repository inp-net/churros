import { browser } from '$app/environment';

export function vibrate(pattern: number | number[]) {
  if (browser && 'vibrate' in navigator && navigator.vibrate) 
    navigator.vibrate(pattern);
  
}
