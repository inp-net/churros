import {
  oauthEnabled,
  oauthInitiateLoginNative,
  oauthInitiateLoginURL,
  oauthLoginBypassed,
} from '$lib/oauth';
import { Capacitor } from '@capacitor/core';
import { redirect } from '@sveltejs/kit';

export async function load(event) {
  if (oauthEnabled() && !oauthLoginBypassed(event)) {
    if (Capacitor.isNativePlatform()) await oauthInitiateLoginNative(event);
    else redirect(307, oauthInitiateLoginURL(event));
  }
}
