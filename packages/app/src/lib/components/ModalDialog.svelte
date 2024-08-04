<script lang="ts">
  import { isDark } from '$lib/theme';
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();

  export let element: HTMLDialogElement;
  export let tall = false;
  export let opened = false;
  export let maxWidth = 'unset';
  export const open = () => {
    dispatch('open');
    element.showModal();
  };

  onMount(() => {
    if (opened) element.showModal();
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
  class:tall
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
  style:max-width={maxWidth}
>
  <slot />
</dialog>

<style>
  dialog {
    position: fixed;
    z-index: 1000;

    /* min-width: calc(min(100%, 500px)); */
    width: 66vw;
    height: 50vh;
    padding: 1.5rem;
    color: var(--text);
    background: var(--bg);
    border: none;
    border-radius: var(--radius-block);
  }

  dialog.tall {
    width: 50vw;
    height: 80vh;
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
