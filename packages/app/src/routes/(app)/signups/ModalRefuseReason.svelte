<script lang="ts">
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import { loading, type MaybeLoading } from '$lib/loading';
  import { decide } from './shared';

  export let open: () => void;
  export let email: MaybeLoading<string> | undefined;
  export let why = '';
</script>

<ModalOrDrawer bind:open title="Refus de l'inscription de {loading(email, '…')}" let:close>
  <InputLongText autofocus label="Raison du refus" bind:value={why} />
  <section class="submit">
    <ButtonPrimary
      on:click={async () => {
        await decide(email, false, why);
        close();
      }}
    >
      Refuser
    </ButtonPrimary>
  </section>
</ModalOrDrawer>

<style>
  .submit {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2rem;
  }
</style>
