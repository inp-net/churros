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
