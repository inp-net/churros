<script lang="ts">
  import ModalDialog from '$lib/components/ModalDialog.svelte';
  import ModalDrawer from '$lib/components/ModalDrawer.svelte';
  import { isMobile } from '$lib/mobile';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ close: undefined }>();

  const mobile = isMobile();

  /** Close the modal without triggering a close event */
  export const implicitClose = () => {
    if (mobile) 
      drawerOpen = false;
     else 
      dialogElement?.close();
    
  };

  export const open = () => {
    if (mobile) 
      drawerOpen = true;
     else 
      openDialog();
    
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
  <ModalDrawer bind:open={drawerOpen}><slot {close}></slot></ModalDrawer>
{:else}
  <ModalDialog bind:element={dialogElement} bind:open={openDialog}
    ><slot {close}></slot></ModalDialog
  >
{/if}
