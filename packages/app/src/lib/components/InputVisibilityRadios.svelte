<script lang="ts">
  import {
    DISPLAY_VISIBILITIES,
    HELP_VISIBILITY,
    HELP_VISIBILITY_DYNAMIC,
    ORDER_VISIBILITIES,
  } from '$lib/display';
  import type { Visibility } from '$lib/zeus';
  import BadgeVisibility from './BadgeVisibility.svelte';
  import IndicatorVisibility from './IndicatorVisibility.svelte';

  export let visibility: Visibility;
  export let label = '';
</script>

<fieldset>
  <legend>{label}</legend>
  {#each ORDER_VISIBILITIES as value}
    {@const display = DISPLAY_VISIBILITIES[value]}
    <label>
      <input type="radio" name={value} {value} bind:group={visibility} />
      <IndicatorVisibility visibility={value}></IndicatorVisibility>
      {display}
      <p class="explanation">{HELP_VISIBILITY[value]}</p>
    </label>
  {/each}
</fieldset>
