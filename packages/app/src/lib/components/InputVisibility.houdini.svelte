<script lang="ts">
  import { DISPLAY_VISIBILITIES, ORDER_VISIBILITIES } from '$lib/display';
  import IconChevronDown from '~icons/mdi/chevron-down';
  import IndicatorVisibility from './IndicatorVisibility.svelte';
  import { tooltip } from '$lib/tooltip';
  import type { Visibility$options } from '$houdini';
  import { mapLoading, type MaybeLoading } from '$lib/loading';
  import LoadingText from '$lib/components/LoadingText.svelte';

  export let value: MaybeLoading<Visibility$options>;
  export let name: string | undefined = undefined;
  export let disabled = false;
  export let help: string | undefined = undefined;
</script>

<label use:tooltip={help} class="input-visibility" class:muted={disabled}>
  <IndicatorVisibility visibility={value}></IndicatorVisibility>
  <span class="text"><LoadingText value={mapLoading(value, (v) => DISPLAY_VISIBILITIES[v])} /></span
  >
  <select {disabled} {name} bind:value>
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
