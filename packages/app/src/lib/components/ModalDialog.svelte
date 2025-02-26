<script lang="ts">
  import { isDark, theme } from '$lib/theme';
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();

  export let element: HTMLDialogElement;
  export let tall = false;
  export let narrow = false;
  export let opened = false;
  export let maxWidth = 'unset';
  export const open = () => {
    dispatch('open');
    opened = true;
    element?.showModal();
  };

  onMount(() => {
    if (opened) element?.showModal();
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
  class:narrow
  on:close={(e) => {
    if (element.classList.contains('closing')) return;
    if (!(e.currentTarget instanceof HTMLDialogElement)) return;

    // FIXME preventDefault() has no effect somehow
    e.preventDefault();
    e.currentTarget.classList.add('closing');
    setTimeout(() => {
      e.currentTarget?.close();
      e.currentTarget?.classList.remove('closing');
    }, 200);
  }}
  data-theme={$theme.id}
  data-theme-variant={$isDark ? 'dark' : 'light'}
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
    color: var(--text);
    background: var(--bg);
    border: none;
    border-radius: var(--radius-block);
  }

  dialog[data-theme-variant='dark'] {
    background: var(--bg2);
  }

  dialog.tall {
    width: 50vw;
    height: 80vh;
  }

  dialog.narrow {
    width: 33vw;
  }

  dialog:global(.closing) {
    animation: pop-up 0.5s ease reverse;
  }

  dialog[open] {
    padding: 1.5rem;
    animation: pop-up 0.25s ease;
  }

  dialog:not([open])::backdrop {
    background-color: transparent;
  }

  dialog:global(.closing)::backdrop {
    animation: fade-in 0.25s ease reverse;
  }

  dialog[open]::backdrop {
    overscroll-behavior: contain;
    background: var(--backdrop);
    backdrop-filter: blur(10px);
    animation: fade-in 0.75s ease;
  }

  @keyframes pop-up {
    from {
      opacity: 0;
      transform: scale(0.6);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes fade-in {
    from {
      background-color: transparent;
      backdrop-filter: blur(0);
    }

    to {
      background: var(--backdrop);
      backdrop-filter: blur(10px);
    }
  }
</style>
