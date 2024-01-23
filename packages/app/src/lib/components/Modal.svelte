<script lang="ts">
  import { isDark } from '$lib/theme';
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();

  export let element: HTMLDialogElement;
  export let open = false;
  export let noPadding = false;
  export let maxWidth = 'unset';

  onMount(() => {
    if (open) element.showModal();
  });
</script>

<svelte:window
  on:click={(e) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (e.target === element) {
      dispatch('close-by-outside-click');
      element.close();
    }
  }}
/>

<dialog
  on:close={(e) => {
    if (element.classList.contains('closing')) return;

    // FIXME preventDefault() has no effect somehow
    e.preventDefault();
    element.classList.add('closing');
    setTimeout(() => {
      element.close();
      dispatch('close');
      element.classList.remove('closing');
    }, 200);
  }}
  {...$$restProps}
  class="{$isDark ? 'dark' : 'light'} {$$restProps.class}"
  class:no-padding={noPadding}
  bind:this={element}
  style:max-width={`calc(min(100vw, ${maxWidth}))`}
>
  <slot />
</dialog>

<style>
  dialog {
    position: fixed;
    z-index: 1000;
    min-width: calc(min(100%, 500px));
    padding: 1.5rem;
    color: var(--text);
    background: var(--bg);
    border: none;
    border-radius: var(--radius-block);
    min-width: 0;
  }

  dialog.no-padding {
    padding: 0;
  }

  dialog:global(.closing) {
    animation: pop-up 0.5s ease reverse;
  }

  dialog[open] {
    animation: pop-up 0.25s ease;
  }

  dialog:not([open])::backdrop {
    background-color: transparent;
  }

  dialog[open]::backdrop {
    overscroll-behavior: contain;
    background-color: var(--backdrop);
    backdrop-filter: blur(10px);
    transition: background-color 0.5s ease;
  }

  /* @media (max-width: 1000px) {
    dialog {
      border-radius: 0;
    }
  } */

  @keyframes pop-up {
    from {
      transform: scale(0);
    }

    to {
      transform: scale(1);
    }
  }

  @keyframes fade-in {
    from {
      background-color: transparent;
      backdrop-filter: blur(0);
    }

    to {
      background-color: var(--backdrop);
      backdrop-filter: blur(10px);
    }
  }
</style>
