<script lang="ts">
  import { page } from '$app/stores';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import { createEventDispatcher } from 'svelte';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import InputText from './InputText.svelte';

  const dispatch = createEventDispatcher<{ confirm: undefined }>();

  let open: () => void;
  export let typeToConfirm = '';
  export let confirmationTyped = '';

  $: if ($page.state.NAVTOP_DELETING && open) open();
</script>

<ModalOrDrawer bind:open let:close>
  <h1 slot="header">Es-tu sur·e</h1>
  <p>La suppression est définitive</p>
  {#if typeToConfirm}
    <p>Tapes <strong>{typeToConfirm}</strong> pour confirmer</p>
    <InputText label="" bind:value={confirmationTyped}></InputText>
  {/if}
  <section class="confirm">
    <ButtonSecondary on:click={() => close()}>Annuler</ButtonSecondary>
    <ButtonPrimary
      on:click={() => {
        close();
        dispatch('confirm');
      }}
      disabled={Boolean(typeToConfirm) && typeToConfirm.trim() !== confirmationTyped.trim()}
      >Supprimer</ButtonPrimary
    >
  </section>
</ModalOrDrawer>
