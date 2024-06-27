<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { toasts } from '$lib/toasts';
  import IconCopyLink from '~icons/mdi/clipboard-outline';
  import IconShare from '~icons/mdi/share-variant-outline';
  import GhostButton from './ButtonGhost.svelte';
  import ButtonInk from './ButtonInk.svelte';

  export let white = false;
  export let url = '';
  export let path = '';
  export let text = false;

  $: canShare = Boolean(browser && navigator.share !== undefined);

  function rewriteUrl(url: URL): string {
    const segments = url.pathname.split('/').filter(Boolean);
    if (['users', 'groups'].includes(segments[0]) && segments.length === 2) {
      return new URL(url.pathname.replace(`/${segments[0]}/`, '/@'), url.origin)
        .toString()
        .replace(/\/$/, '');
    }

    return url.toString();
  }

  $: finalUrl = url || (path ? new URL(path, $page.url)?.toString() : rewriteUrl($page.url));

  async function share() {
    try {
      await navigator.share({
        url: finalUrl,
        title: document.title,
        text: document.querySelector('meta[name=description]')?.getAttribute('content') ?? '',
      });
    } catch {
      await navigator.clipboard.writeText(finalUrl);
      toasts.info('Lien copié dans le presse-papiers');
    }
  }
</script>

{#if text}
  <ButtonInk
    track="share"
    trackData={{ url }}
    on:click={share}
    icon={canShare ? IconShare : IconCopyLink}
    >{#if canShare}Partager{:else}Copier le lien{/if}</ButtonInk
  >
{:else}
  <GhostButton
    track="share"
    trackData={{ url }}
    help="Partager"
    on:click={share}
    darkShadow={white}
  >
    <IconShare color={white ? 'white' : undefined} />
  </GhostButton>
{/if}
