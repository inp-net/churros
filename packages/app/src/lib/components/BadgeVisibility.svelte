<script lang="ts">
  import type { PendingValue, Visibility$options } from '$houdini';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { DISPLAY_VISIBILITIES, HELP_VISIBILITY } from '$lib/display';
  import { loaded } from '$lib/loading';
  import { tooltip } from '$lib/tooltip';
  import type { Visibility } from '$lib/zeus';
  import IndicatorVisibility from './IndicatorVisibility.svelte';

  export let visibility: Visibility | Visibility$options | typeof PendingValue;
  export let inline = false;
</script>

<div
  class:inline
  class="badge-visibility"
  use:tooltip={loaded(visibility) ? HELP_VISIBILITY[visibility] : ''}
>
  {#if loaded(visibility)}
    <IndicatorVisibility {visibility}></IndicatorVisibility>
    {DISPLAY_VISIBILITIES[visibility]}
  {:else}
    <LoadingText>Lorem ipsum</LoadingText>
  {/if}
</div>

<style>
  .badge-visibility {
    padding: 0.2em 0.7em;
    font-size: 0.9em;
    background: var(--muted-bg);
    border-radius: var(--radius-block);
  }

  .badge-visibility.inline {
    display: inline-block;
  }
</style>
