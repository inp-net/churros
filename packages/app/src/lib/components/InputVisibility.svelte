<script lang="ts">
  import { DISPLAY_VISIBILITIES, ORDER_VISIBILITIES } from '$lib/display';
  import IconChevronDown from '~icons/mdi/chevron-down';
  import type { Visibility } from '$lib/zeus';
  import IndicatorVisibility from './IndicatorVisibility.svelte';

  export let value: Visibility;
</script>

<label class="input-visibility">
  <IndicatorVisibility visibility={value}></IndicatorVisibility>
  <span class="text">{DISPLAY_VISIBILITIES[value]}</span>
  <select bind:value>
    {#each ORDER_VISIBILITIES as visibility}
      <option value={visibility}>
        {DISPLAY_VISIBILITIES[visibility]}
      </option>
    {/each}
  </select>
  <IconChevronDown></IconChevronDown>
</label>

<style>
  label {
    position: relative;
    display: flex;
    gap: 0.5em;
    align-items: center;
    padding: 0.3em 0.9em;
    font-size: 0.8em;
    background: var(--muted-bg);
    border-radius: var(--radius-block);
  }

  label > *:not(select) {
    pointer-events: none;
  }

  select {
    position: absolute;
    inset: 0;
    opacity: 0;
  }
</style>
