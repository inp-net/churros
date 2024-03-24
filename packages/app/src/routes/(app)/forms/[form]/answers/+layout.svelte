<script lang="ts">
  import AvatarGroup from '$lib/components/AvatarGroup.svelte';
  import IndicatorVisibility from '$lib/components/IndicatorVisibility.svelte';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
  $: ({ form } = data);
</script>

{#if form}
  {@const { group, visibility, title } = form}
  <h1>
    <AvatarGroup href="/groups/{group.uid}" {...group}></AvatarGroup> Réponses à {title}
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
