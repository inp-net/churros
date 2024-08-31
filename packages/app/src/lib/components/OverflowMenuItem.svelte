<script lang="ts">
  import { page } from '$app/stores';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import type { ActionData, OverflowMenuAction } from '$lib/components/OverflowMenu.svelte';
  import { createEventDispatcher, tick } from 'svelte';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let action: OverflowMenuAction<any>;
  const dispatch = createEventDispatcher<{ click: undefined }>();

  async function getActionData(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action: OverflowMenuAction<any>,
    _refresh: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<ActionData<any>> {
    if (typeof action === 'function') return action($page);

    return action;
  }

  let refresh = false;
</script>

{#await getActionData(action, refresh)}
  <div class="empty-icon"></div>
  <div class="label">
    <span class="main"><LoadingText>Lorem ipsum dolor</LoadingText></span>
  </div>
{:then { label, hidden, disabled, icon, help, 'do': do_, href }}
  {#if !hidden}
    <svelte:element
      this={disabled ? 'span' : href ? 'a' : 'button'}
      class="item"
      aria-disabled={disabled}
      class:muted={disabled}
      {disabled}
      on:click={async () => {
        dispatch('click');
        await do_?.();
        await tick();
        refresh = !refresh;
      }}
      {href}
      role={href ? 'link' : 'button'}
    >
      <svelte:component this={icon}></svelte:component>
      <div class="label">
        <span class="main">{label}</span>
        {#if help}
          <span class="sub">{help}</span>
        {/if}
      </div>
    </svelte:element>
  {/if}
{/await}

<style>
  .item {
    display: flex;
    gap: 1em;
    align-items: center;
    padding: 0.5em 1em;
    font-size: 1.2rem;
    cursor: pointer;
  }

  .label {
    display: flex;
    flex-direction: column;
    align-items: start;
    line-height: 1;
  }

  .label .sub {
    font-size: 0.75em;
    color: var(--muted);
  }

  button {
    font-size: 1em;
    background: var(--bg);
    border: none;
  }
</style>
