<script lang="ts">
  import IconEvent from '~icons/mdi/calendar-outline';
  import IconClose from '~icons/mdi/close';
  import ButtonGhost from './ButtonGhost.svelte';
  import InputEvent from './InputEvent.houdini.svelte';
  import { type InputEvent$data } from '$houdini';

  /**
   * The event's group UID.
   */
  export let group: string;

  export let allow: string[] = [];
  export let except: string[] = [];
  export let event: InputEvent$data | undefined | null = undefined;
  export let suggestions: InputEvent$data[] = [];
  export let clearable = false;

  const asEventType = (x: unknown) => x as InputEvent$data;
</script>

<InputEvent {group} {clearable} {allow} {except} {suggestions} bind:event>
  <div class:empty={!event} class="pill" slot="input" let:value let:openPicker let:clear>
    <ButtonGhost on:click={openPicker}>
      <span class="icon">
        <IconEvent></IconEvent>
      </span>
      <span class="text">
        {#if value}
          {asEventType(value).title}
        {:else}
          Évènement
        {/if}
      </span>
    </ButtonGhost>
    {#if value}
      <div class="delete">
        <ButtonGhost danger tight on:click={clear}>
          <IconClose></IconClose></ButtonGhost
        >
      </div>
    {/if}
  </div>
</InputEvent>

<style lang="scss">
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

  .pill .icon {
    font-size: 0.85em;
  }
</style>
