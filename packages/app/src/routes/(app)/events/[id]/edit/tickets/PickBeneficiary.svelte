<script lang="ts">
  import { graphql, type PickBeneficiary$data } from '$houdini';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputRadios from '$lib/components/InputRadios.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import { loaded, loading, type MaybeLoading } from '$lib/loading';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ pick: string | null }>();

  export let open: () => void;

  export let currentAccount: MaybeLoading<string | null>;
  export let accounts: PickBeneficiary$data[];
  graphql(`
    fragment PickBeneficiary on LydiaAccount @loading {
      id
      name
    }
  `);

  $: options = accounts
    .map((account) => [account.id, account.name] as const)
    .filter(([value]) => loaded(value)) as Array<[string, MaybeLoading<string>]>;
</script>

<ModalOrDrawer bind:open let:close>
  <header slot="header" let:close>
    <h2>Compte Lydia Pro bénéficiaire</h2>
    <ButtonSecondary
      danger
      on:click={() => {
        close();
        dispatch('pick', null);
      }}>Désassocier</ButtonSecondary
    >
  </header>
  <div class="content">
    <InputRadios
      {options}
      value={loading(currentAccount, null)}
      on:change={(e) => {
        close();
        dispatch('pick', e.detail);
      }}
    ></InputRadios>
  </div>
</ModalOrDrawer>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 3rem;
  }

  .content {
    padding: 0 1rem;
  }
</style>
