<script lang="ts">
  import { infinitescroll } from '$lib/scroll';

  /** Function to load next page when we reach the bottom, using use:infinitescroll. */
  export let nextPage: undefined | (() => Promise<unknown>) = undefined;
</script>

<nav use:infinitescroll={async () => nextPage?.()}>
  <slot></slot>
</nav>

<style>
  nav {
    display: flex;
    flex-direction: column;
    container-name: submenu;
    container-type: inline-size;
  }

  nav > :global(*:not(h2, h3, h4)) {
    border-bottom: var(--border-block) solid var(--bg3);
  }

  nav > :global(h2) {
    padding: 1em 0;
  }
</style>
