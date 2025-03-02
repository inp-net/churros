<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { fragment, graphql, type ButtonShare } from '$houdini';
  import { allLoaded, loaded } from '$lib/loading';
  import { toasts } from '$lib/toasts';
  import IconShare from '~icons/msl/ios-share';
  import GhostButton from './ButtonGhost.svelte';
  import ButtonInk from './ButtonInk.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';

  export let white = false;
  export let url = '';
  export let path = '';

  /** Uses ButtonSecondary when shape=block, subtle uses ButtonGhost or ButtonInk (depending on if text is truthy) */
  export let shape: 'block' | 'subtle' = 'subtle';

  /** Use text with the button. A string can be used to change the displayed text. By default it's dependent on whether the WebShare API is available */
  export let text: string | boolean = false;

  /** Resource that was shared. Useful to display the share count (and count up new shares) */
  export let resource: ButtonShare | null = null;
  $: resourceData = fragment(
    resource,
    graphql(`
      fragment ButtonShare on Shareable @loading {
        id
        shares
      }
    `),
  );

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
    if (canShare) {
      await navigator.share({
        url: finalUrl,
        title: document.title,
        text: document.querySelector('meta[name=description]')?.getAttribute('content') ?? '',
      });
    } else {
      await navigator.clipboard.writeText(finalUrl);
      toasts.info('Lien copié dans le presse-papiers');
    }

    if ($resourceData && allLoaded($resourceData)) {
      await graphql(`
        mutation Shared($id: ID!) {
          trackShare(resource: $id)
        }
      `)
        .mutate({ id: $resourceData.id })
        .catch(console.error);
    }
  }
</script>

{#if $$slots.default}
  <slot {share}></slot>
{:else if text}
  <svelte:component
    this={shape === 'block' ? ButtonSecondary : ButtonInk}
    track="share"
    trackData={{ url }}
    on:click={share}
    icon={IconShare}
  >
    {#if typeof text === 'string'}
      {text}
    {:else if canShare}
      Partager
    {:else}
      Copier le lien
    {/if}
  </svelte:component>
{:else}
  <GhostButton
    track="share"
    trackData={{ url }}
    help="Partager"
    on:click={share}
    darkShadow={white}
  >
    <div class="maybe-with-count">
      <IconShare color={white ? 'white' : undefined} />
      {#if $resourceData && loaded($resourceData.shares) && $resourceData.shares > 0}
        {$resourceData.shares}
      {/if}
    </div>
  </GhostButton>
{/if}

<style>
  .maybe-with-count {
    display: flex;
    gap: 0.5ch;
    align-items: center;
  }
</style>
