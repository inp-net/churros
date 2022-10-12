<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let href: string;
  export let selected = false;
  export let icon: typeof SvelteComponent;
  export let selectedIcon: typeof SvelteComponent;
</script>

<a {href} aria-current={selected ? 'page' : undefined}>
  <svelte:component this={selected ? selectedIcon : icon} aria-hidden="true" />
  <slot />
</a>

<style lang="scss">
  a {
    display: flex;
    gap: 0.5em;
    align-items: center;
    padding: 0.5em;

    &:hover,
    &:active {
      outline: 4px solid var(--ring);
    }
  }

  [aria-current='page'] {
    background: var(--ring);
  }
</style>
