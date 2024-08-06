<script lang="ts">
  import ModalDialog from '$lib/components/ModalDialog.svelte';
  import ModalDrawer from '$lib/components/ModalDrawer.svelte';
  import { isMobile } from '$lib/mobile';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ close: undefined }>();

  /** Signals that the content is quite tall */
  export let tall = false;

  /** Signals that the drawer (mobile) should not have bottom padding */
  export let removeBottomPadding = false;

  const mobile = isMobile();

  /** Close the modal without triggering a close event */
  export const implicitClose = () => {
    if (mobile) drawerOpen = false;
    else dialogElement?.close();
  };

  /** Open the modal. (usage: `bind:open={a variable name, that you declared}`, then use that variable) */
  export const open = () => {
    if (mobile) drawerOpen = true;
    else openDialog();
  };

  const close = () => {
    implicitClose();
    dispatch('close');
  };
  let drawerOpen: boolean;
  let dialogElement: HTMLDialogElement;
  let openDialog: () => void;
</script>

{#if mobile}
  <ModalDrawer {removeBottomPadding} bind:open={drawerOpen}>
    <slot {close}></slot>
    <slot name="header" slot="header" {close}></slot>
  </ModalDrawer>
{:else}
  <ModalDialog {tall} bind:element={dialogElement} bind:open={openDialog}>
    {#if $$slots.header}
      <header>
        <slot name="header"></slot>
      </header>
    {/if}
    <slot {close}></slot>
  </ModalDialog>
{/if}

<style>
  header {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
  }
</style>
