<script lang="ts">
  import { Drawer } from 'vaul-svelte';
  export let open = false;
</script>

<Drawer.Root bind:open shouldScaleBackground>
  <Drawer.Trigger>
    {#if open}
      <slot name="open">
        <slot name="trigger"></slot>
      </slot>
    {:else}
      <slot name="trigger"></slot>
    {/if}
  </Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Overlay></Drawer.Overlay>
    <Drawer.Content>
      <slot></slot>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>

<style>
  :global([data-vaul-overlay]) {
    position: fixed;
    inset: 0;
    z-index: 999;
    background-color: var(--backdrop);
  }

  :global([data-vaul-drawer]) {
    --corner-radius: 20px;

    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1000;
    min-height: 100px;
    max-height: 80dvh;
    padding: 2em 0;
    background: var(--bg);
    border-radius: var(--corner-radius) var(--corner-radius) 0 0;
  }

  :global([data-vaul-drawer])::before {
    position: absolute;
    top: 0.5rem;
    left: 50%;
    width: 25%;
    height: 0.25rem;
    content: '';
    background-color: var(--muted);
    border-radius: 9999px;
    translate: -50%;
  }
</style>
