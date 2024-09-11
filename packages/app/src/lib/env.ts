import { env } from '$env/dynamic/public';
import { Capacitor } from '@capacitor/core';

function replaceOrigin(url: string): string {
  return url.replace(
    env.PUBLIC_API_ORIGIN_WEB,
    Capacitor.getPlatform() === 'web' ? env.PUBLIC_API_ORIGIN_WEB : env.PUBLIC_API_ORIGIN_ANDROID,
  );
}

export const AUTH_URL = replaceOrigin(env.PUBLIC_API_AUTH_URL);
export const API_URL = replaceOrigin(env.PUBLIC_API_URL);
