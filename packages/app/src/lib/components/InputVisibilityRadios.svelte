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
  {#if label}
    <legend class="typo-field-label">{label}</legend>
  {/if}
  {#each ORDER_VISIBILITIES as value}
    {@const display = DISPLAY_VISIBILITIES[value]}
    <label
      tabindex="0"
      on:click={() => {
        visibility = value;
      }}
      on:keypress={(e) => {
        if (e.key === 'Enter') {
          visibility = value;
        }
      }}
      class:selected={visibility === value}
    >
      <input type="radio" name={value} {value} bind:group={visibility} />
      <IndicatorVisibility visibility={value}></IndicatorVisibility>
      {display}
      <p class="explanation">{HELP_VISIBILITY[value]}</p>
    </label>
  {/each}
</fieldset>

<style>
  fieldset {
    border: none;
  }

  fieldset input {
    display: none;
  }

  fieldset label {
    display: block;
    border: var(--border-block) solid var(--muted-border);
    border-radius: var(--radius-block);
    padding: 1em;
    margin-bottom: 1rem;
    transition: all 0.125s ease;
  }

  fieldset label:hover,
  fieldset label:focus-visible {
    border-color: var(--border);
    cursor: pointer;
  }

  fieldset label.selected {
    border-color: var(--primary-border);
    color: var(--primary-border);
    background-color: color-mix(in srgb, var(--primary-link) 15%, transparent);
  }

  fieldset .explanation {
    font-size: 0.9em;
  }
</style>
