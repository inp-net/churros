<script lang="ts">
  import IconClear from '~icons/mdi/close';
  import IconLater from '~icons/mdi/clock-outline';
  import ButtonGhost from './ButtonGhost.svelte';
  import { formatISO, intlFormatDistance, parseISO } from 'date-fns';
  export let value: Date | undefined;
  export let after: Date | undefined = undefined;

  let _valueString = value ? formatISO(value) : undefined;
  let inputElement: HTMLInputElement;

  $: value = _valueString ? parseISO(_valueString) : undefined;
</script>

<div class="pill input-pill-date" class:empty={!value}>
  <ButtonGhost
    on:click={() => {
      inputElement.focus();
    }}
  >
    <IconLater></IconLater>
    {#if value}
      <span class="value">{intlFormatDistance(value, new Date())}</span>
    {:else}
      <span class="value">
        <slot />
      </span>
    {/if}
    <input
      min={after ? formatISO(after) : undefined}
      bind:this={inputElement}
      type="datetime-local"
      bind:value={_valueString}
    />
  </ButtonGhost>
  {#if value}
    <ButtonGhost
      danger
      on:click={() => {
        _valueString = undefined;
      }}
    >
      <IconClear></IconClear>
    </ButtonGhost>
  {/if}
</div>

<style>
  input {
    background: transparent;
    border: none;
  }

  .pill {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.2em 0.8em;
    font-size: 0.85rem;
    background: var(--muted-bg);
    border: var(--border-block) solid var(--muted-bg);
    border-radius: 100000px;

    &.empty {
      background: transparent;
      border-color: var(--border);
    }

    & input {
      color: var(--text);
    }

    &:hover {
      color: var(--hover-text);
      cursor: pointer;
      background: var(--hover-bg);

      &.empty {
        border-color: var(--hover-border);
      }
    }
  }

  .pill :global(.button-ghost) {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }

  .pill:not(.empty) input {
    display: none;
  }
</style>
