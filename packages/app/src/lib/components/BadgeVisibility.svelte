<script lang="ts">
  import { type Visibility$options } from '$houdini';
  import { DISPLAY_VISIBILITIES, HELP_VISIBILITY } from '$lib/display';
  import { tooltip } from '$lib/tooltip';
  import type { Visibility } from '$lib/zeus';
  import IndicatorVisibility from './IndicatorVisibility.svelte';

  export let visibility: Visibility | Visibility$options;
  export let inline = false;
</script>

<div class:inline class="badge-visibility" use:tooltip={HELP_VISIBILITY[visibility]}>
  <IndicatorVisibility {visibility}></IndicatorVisibility>
  {DISPLAY_VISIBILITIES[visibility]}
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
