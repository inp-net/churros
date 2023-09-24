<script lang="ts">
  import { page } from '$app/stores';
  import GhostButton from './ButtonGhost.svelte';
  import IconShare from '~icons/mdi/share-variant-outline';
    import ButtonInk from './ButtonInk.svelte';

  export let white = false;
  export let href = '';
  export let text = false

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
      await navigator.clipboard.writeText(href || rewriteUrl($page.url));
    }
  }
</script>

{#if text}
<ButtonInk on:click={share} icon={IconShare}>Partager</ButtonInk>
{:else}
<GhostButton
  help="Partager"
  on:click={share}
  darkShadow={white}
>
  {#if white}
    <IconShare color="white" />
  {:else}
    <IconShare />
  {/if}
</GhostButton>

{/if}
