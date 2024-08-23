<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy } from 'svelte';

  /** All pages inside that layout must not reset their layout (with +page@...), or scrolling may break on desktop.  */
  export let mobilePart: 'left' | 'right' = 'left';

  let splitElement: HTMLDivElement;
  $: if (splitElement) {
    splitElement.style.setProperty(
      '--distance-to-top',
      `${splitElement.getBoundingClientRect().top}px`,
    );
  }

  onDestroy(() => {
    if (browser) document.querySelector('#split-layout-styles')?.remove();
  });
</script>

<div class="split" bind:this={splitElement}>
  <div class="left" class:mobile-shown={mobilePart === 'left'}>
    <slot name="left"></slot>
  </div>
  <div class="right" class:mobile-shown={mobilePart === 'right'}>
    <slot name="right"></slot>
  </div>
</div>

<svelte:head>
  <style id="split-layout-styles">
    @media (min-width: 1400px) {
      #layout {
        --scrollable-content-width: calc(clamp(1000px, 100vw - 400px, 1200px));
      }

      /* XXX: If a page in /(app)/events/[id]/edit resets or changes the layout (with +page@...svelte) this will break scrolling */
      body {
        overflow: hidden;
      }
    }
  </style>
</svelte:head>

<style>
  @media (min-width: 1400px) {
    .split {
      --gap: 3rem;

      position: relative;
      display: grid;
      grid-template-columns: 40% calc(60% - var(--gap));
      column-gap: var(--gap);
    }

    .left {
      height: calc(100vh - 1rem - var(--distance-to-top));
      overflow: hidden auto;
      scrollbar-width: thin;
    }

    .right {
      height: calc(100vh - 1rem - var(--distance-to-top));
      overflow: hidden auto;
      scrollbar-width: thin;
    }
  }

  @media (max-width: 1400px) {
    .split {
      display: grid;
      grid-template-columns: 100%;
    }

    .split > div:not(.mobile-shown) {
      display: none;
    }
  }
</style>
