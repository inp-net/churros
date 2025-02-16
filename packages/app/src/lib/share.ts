import { browser } from '$app/environment';
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
  const finalUrl = rewriteUrl(
    data.url || (data.path ? new URL(data.path, currentUrl) : currentUrl),
  );

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

function rewriteUrl(urlOrString: URL | string): string {
  let url: URL;
  if (URL.canParse(urlOrString)) {
    url = new URL(urlOrString);
  } else {
    return urlOrString.toString();
  }

  if (Capacitor.isNativePlatform()) {
    // Android uses localhost for its internal webview, but we want to share the public web link
    url = new URL(url.toString().replace(/https?:\/\/localhost/, env.PUBLIC_FRONTEND_ORIGIN));
  }

  return url.toString();
}
