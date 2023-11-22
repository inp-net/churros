<script lang="ts">
  import { isDark } from '$lib/theme';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let element: HTMLDialogElement;
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
      element.classList.remove('closing');
    }, 200);
  }}
  class={$isDark ? 'dark' : 'light'}
  bind:this={element}
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
    transition: background-color 0.5s ease;
  }

  @media (max-width: 1000px) {
    dialog {
      border-radius: 0;
    }
  }

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
    }

    to {
      background-color: var(--backdrop);
    }
  }
</style>
