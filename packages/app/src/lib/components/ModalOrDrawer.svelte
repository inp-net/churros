<script lang="ts">
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import { page } from '$app/stores';
  import ModalDialog from '$lib/components/ModalDialog.svelte';
  import ModalDrawer from '$lib/components/ModalDrawer.svelte';
  import { isMobile } from '$lib/mobile';
  import { createEventDispatcher } from 'svelte';
  import IconClose from '~icons/msl/close';

  const dispatch = createEventDispatcher<{ close: undefined }>();

  /** Signals that the content is quite tall */
  export let tall = false;

  /** Signals that the content is quite narrow */
  export let narrow = false;

  /** Set a title. Uses the header slot. Also adds a close button to the right */
  export let title = '';

  /** Don't render a trigger area */
  export let notrigger = false;

  /** Signals that the drawer (mobile) should not have bottom padding */
  export let removeBottomPadding = false;

  /** Ties the open/closed state of the modal to a $page.state boolean property */
  export let statebound: keyof App.PageState | undefined = undefined;

  $: if (statebound) {
    if ($page.state[statebound]) open?.();
    else implicitClose?.();
  }

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
  <ModalDrawer
    on:close={() => dispatch('close')}
    {notrigger}
    {removeBottomPadding}
    bind:open={drawerOpen}
  >
    <slot {close}></slot>
    <svelte:fragment slot="header">
      {#if $$slots.header}
        <slot {close} name="header"></slot>
      {:else if title}
        <header class="using-title">
          <h2>{title}</h2>
          <ButtonGhost help="Fermer" on:click={close}>
            <IconClose />
          </ButtonGhost>
        </header>
      {/if}
    </svelte:fragment>
  </ModalDrawer>
{:else}
  <ModalDialog
    on:close-by-outside-click={() => dispatch('close')}
    {tall}
    {narrow}
    bind:element={dialogElement}
    bind:open={openDialog}
  >
    {#if $$slots.header || title}
      <header class:using-title={Boolean(title)}>
        {#if $$slots.header}
          <slot {close} name="header"></slot>
        {:else}
          <h2>{title}</h2>
          <ButtonGhost help="Fermer" on:click={close}>
            <IconClose />
          </ButtonGhost>
        {/if}
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

  header.using-title {
    width: 100%;
  }

  header.using-title :global(.button-ghost) {
    font-size: 1.2em;
  }
</style>
