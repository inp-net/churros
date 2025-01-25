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
  export let title = 'Es-tu sûr·e ?';

  $: if ($page.state.NAVTOP_DELETING && open) open();
</script>

<ModalOrDrawer narrow bind:open let:close {title}>
  <div class="content">
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
  </div>
</ModalOrDrawer>

<style>
  .content {
    text-align: center;
  }
</style>
