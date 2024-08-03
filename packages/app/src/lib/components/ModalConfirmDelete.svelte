<script lang="ts">
  import Modal from './ModalDialog.svelte';
  import InputText from './InputText.svelte';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ confirm: undefined }>();

  let element: HTMLDialogElement;

  export const open = () => element.showModal();
  export let typeToConfirm = '';
  export let confirmationTyped = '';
</script>

<Modal bind:element>
  <h1>Es-tu sur·e</h1>
  <p>La suppression est définitive</p>
  {#if typeToConfirm}
    <p>Tapes <strong>{typeToConfirm}</strong> pour confirmer</p>
    <InputText label="" bind:value={confirmationTyped}></InputText>
  {/if}
  <section class="confirm">
    <ButtonSecondary on:click={() => element.close()}>Annuler</ButtonSecondary>
    <ButtonPrimary
      on:click={() => {
        element.close();
        dispatch('confirm');
      }}
      disabled={Boolean(typeToConfirm) && typeToConfirm.trim() !== confirmationTyped.trim()}
      >Supprimer</ButtonPrimary
    >
  </section>
</Modal>
