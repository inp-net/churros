<script lang="ts">
  import { page } from '$app/stores';
  import GhostButton from './ButtonGhost.svelte';
  import IconShare from '~icons/mdi/share-variant-outline';

  export let white = false;
  export let href = '';
</script>

<GhostButton
  on:click={async () => {
    try {
      await navigator.share({
        url: href || $page.url.toString(),
        title: document.title,
        text: document.querySelector('meta[name=description]')?.getAttribute('content') ?? '',
      });
    } catch {
      await navigator.clipboard.writeText(href || $page.url.toString());
    }
  }}
  darkShadow={white}
>
  {#if white}
    <IconShare color="white" />
  {:else}
    <IconShare />
  {/if}
</GhostButton>
