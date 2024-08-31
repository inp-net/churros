import { getContext, setContext } from 'svelte';

export const _CONTEXT_KEY_MOBILE = Symbol('mobile');

/**
 * Needs to be called within component initialization, as it uses Svelte's Context API.
 *
 * Gets the context key 'mobile' that is set by the root layout from event.locals.mobile
 * This in turn comes from looking for the string 'mobile' in the user-agent
 *
 * Doing it like this instead of checking a window width allows us to reliably render during SSR (on the server)
 *
 * Actual layout decisions such as hiding elements when they would overflow the screen should still be done via CSS media queries.
 *
 * This is more for stuff that is conditionally rendered but can't be reliably done with CSS. Check for {#if mobile} in the source code for examples.
 */
export function isMobile() {
  return getContext<boolean>(_CONTEXT_KEY_MOBILE) ?? false;
}

/**
 * Needs to be called within component initialization of the root layout
 */
export function setupIsMobile(mobile: boolean) {
  return setContext(_CONTEXT_KEY_MOBILE, mobile);
}

export function inferIsMobile(userAgent: string) {
  return userAgent.toLowerCase().includes('mobile') || userAgent.toLowerCase().includes(' code/1.');
}
