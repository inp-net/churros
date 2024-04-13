<script lang="ts">
  import { type InputEventEvent$data } from '$houdini';
  import IconEvent from '~icons/mdi/calendar-outline';
  import IconClose from '~icons/mdi/close';
  import ButtonGhost from './ButtonGhost.svelte';
  import InputEvent from './InputEvent.svelte';

  export let groupUid: string;
  export let allow: string[] = [];
  export let except: string[] = [];
  export let suggestions: InputEventEvent$data[] = [];
  export let clearable = false;
  export let event: InputEventEvent$data | null;

  const asEvent = (x: unknown): InputEventEvent$data => x as InputEventEvent$data;
</script>

<InputEvent {groupUid} {clearable} {allow} {except} {suggestions} bind:event>
  <div class:empty={!event} class="pill" slot="input" let:value let:openPicker let:clear>
    <ButtonGhost on:click={openPicker}>
      <span class="icon">
        <IconEvent></IconEvent>
      </span>
      <span class="text">
        {#if value}
          {asEvent(value).title}
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
