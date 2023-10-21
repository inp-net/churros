<script lang="ts">
  import { page } from '$app/stores';
  import GhostButton from './ButtonGhost.svelte';
  import IconShare from '~icons/mdi/share-variant-outline';
  import IconCopyLink from '~icons/mdi/clipboard-outline';
  import ButtonInk from './ButtonInk.svelte';
  import { toasts } from '$lib/toasts';
  import { browser } from '$app/environment';

  export let white = false;
  export let href = '';
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

  async function share() {
    try {
      await navigator.share({
        url: href || rewriteUrl($page.url),
        title: document.title,
        text: document.querySelector('meta[name=description]')?.getAttribute('content') ?? '',
      });
    } catch {
      const url = href || rewriteUrl($page.url);
      await navigator.clipboard.writeText(url);
      toasts.info('Lien copié dans le presse-papiers');
    }
  }
</script>

{#if text}
  <ButtonInk on:click={share} icon={canShare ? IconShare : IconCopyLink}
    >{#if canShare}Partager{:else}Copier le lien{/if}</ButtonInk
  >
{:else}
  <GhostButton help="Partager" on:click={share} darkShadow={white}>
    <IconShare color={white ? 'white' : undefined} />
  </GhostButton>
{/if}
