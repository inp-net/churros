import { browser, dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import { graphql } from '$houdini';
import { loaded, type MaybeLoading } from '$lib/loading';
import { toasts } from '$lib/toasts';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { get, type Readable } from 'svelte/store';

export async function canShare() {
  if (Capacitor.isNativePlatform()) return await Share.canShare();

  return Boolean(browser && navigator.share !== undefined);
}

export async function share(data: {
  resourceId?: MaybeLoading<string>;
  url: string;
  path?: string;
  page: Readable<{ url: URL }>;
}) {
  const currentUrl = get(data.page).url;
  const finalUrl = data.url || rewriteUrl(data.path ? new URL(data.path, currentUrl) : currentUrl);

  if (await canShare()) {
    if (Capacitor.isNativePlatform()) {
      await Share.share({
        url: finalUrl,
        title: document.title,
        dialogTitle: document.title,
      });
    } else {
      await navigator.share({
        url: finalUrl,
        title: document.title,
        text: document.querySelector('meta[name=description]')?.getAttribute('content') ?? '',
      });
    }
  } else {
    await navigator.clipboard.writeText(finalUrl);
    toasts.info('Lien copié dans le presse-papiers');
  }

  if (data.resourceId && loaded(data.resourceId)) {
    await graphql(`
      mutation Shared($id: ID!) {
        trackShare(resource: $id)
      }
    `)
      .mutate({ id: data.resourceId })
      .catch(console.error);
  }
}

function rewriteUrl(url: URL): string {
  if (Capacitor.isNativePlatform() && !dev) {
    // Android uses localhost for its internal webview, but we want to share the public web link
    url = new URL(url.toString().replace(/https?:\/\/localhost/, env.PUBLIC_FRONTEND_ORIGIN));
  }
  const segments = url.pathname.split('/').filter(Boolean);
  if (['users', 'groups'].includes(segments[0]) && segments.length === 2) {
    return new URL(url.pathname.replace(`/${segments[0]}/`, '/@'), url.origin)
      .toString()
      .replace(/\/$/, '');
  }

  return url.toString();
}
