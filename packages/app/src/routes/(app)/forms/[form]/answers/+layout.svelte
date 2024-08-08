<script lang="ts">
  import { page } from '$app/stores';
  import AvatarGroup from '$lib/components/AvatarGroup.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import IndicatorVisibility from '$lib/components/IndicatorVisibility.svelte';
  import IconEdit from '~icons/mdi/pencil-outline';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
  $: ({ form } = data);
</script>

{#if form}
  {@const { group, visibility, title } = form}
  <h1>
    {#if group}
      <AvatarGroup href="/groups/{group.uid}" {...group}></AvatarGroup>
    {/if}
    Réponses à {title}
    {#if $page.route.id !== '/(app)/forms/[form]/edit'}
      <ButtonGhost href="/forms/{$page.params.form}/edit"><IconEdit></IconEdit></ButtonGhost>
    {/if}
  </h1>
  <p class="visibility">
    <IndicatorVisibility text {visibility}></IndicatorVisibility>
  </p>
{/if}

<slot />

<style>
  h1 {
    display: flex;
    column-gap: 0.5em;
    align-items: center;
  }

  .visibility {
    margin-top: 1em;
    margin-bottom: 2em;
  }
</style>
