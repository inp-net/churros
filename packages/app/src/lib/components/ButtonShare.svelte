<script lang="ts">
  import { page } from '$app/stores';
  import { fragment, graphql, type ButtonShare } from '$houdini';
  import { loaded } from '$lib/loading';
  import * as sharing from '$lib/share';
  import IconShare from '~icons/msl/ios-share';
  import GhostButton from './ButtonGhost.svelte';
  import ButtonInk from './ButtonInk.svelte';

  export let white = false;
  export let url = '';
  export let path = '';
  export let text: boolean | string = false;

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

  const share = async () => {
    sharing.share({
      resourceId: $resourceData?.id,
      url,
      path,
      page,
    });
  };
</script>

{#if $$slots.default}
  <slot {share}></slot>
{:else if text}
  <ButtonInk track="share" trackData={{ url }} on:click={share} icon={IconShare}>
    {#if typeof text === 'string'}
      {text}
    {:else}
      {#await sharing.canShare()}
        Partager
      {:then can}
        {#if can}
          Partager
        {:else}
          Copier le lien
        {/if}
      {/await}
    {/if}
  </ButtonInk>
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
