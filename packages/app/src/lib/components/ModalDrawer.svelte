<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Drawer } from 'vaul-svelte';
  const dispatch = createEventDispatcher<{ close: undefined }>();

  /** Don't render a trigger area */
  export let notrigger = false;
  export let open = false;
  export let removeBottomPadding = false;
</script>

<Drawer.Root bind:open shouldScaleBackground onClose={() => dispatch('close')}>
  {#if !notrigger}
    <Drawer.Trigger>
      {#if open}
        <slot name="open">
          <slot name="trigger"></slot>
        </slot>
      {:else}
        <slot name="trigger"></slot>
      {/if}
    </Drawer.Trigger>
  {/if}
  <Drawer.Portal>
    <Drawer.Overlay></Drawer.Overlay>
    <Drawer.Content data-remove-bottom-padding={removeBottomPadding}>
      {#if $$slots.header}
        <header>
          <slot name="header"></slot>
        </header>
      {/if}
      <div class="content-scrollable">
        <slot></slot>
      </div>
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
    padding: 2em 0;
    background: var(--bg);
    border-radius: var(--corner-radius) var(--corner-radius) 0 0;
  }

  :global([data-vaul-drawer][data-remove-bottom-padding='true']) {
    padding-bottom: 0;
  }

  header {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
  }

  .content-scrollable {
    min-height: 100px;
    max-height: 60dvh;
    overflow-y: auto;
    overscroll-behavior: contain;
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
