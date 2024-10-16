<script lang="ts">
  import { page } from '$app/stores';
  import IconHelp from '~icons/msl/help-outline';
  import { env } from '$env/dynamic/public';
  import { graphql } from '$houdini';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { allLoaded, loaded, type MaybeLoading } from '$lib/loading';
  import { toasts } from '$lib/toasts';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageGroupEditBankAccounts } = data);

  let phone = '';
  let password = '';
  let lydiaAccounts: Array<{ name: string; api_token_id: string; api_token: string }> = [];
  let openHelp: () => void;

  const DeleteLydiaAccount = graphql(`
    mutation DeleteLydiaAccount($id: LocalID!) {
      deleteLydiaAccount(id: $id) {
        ...MutationErrors
        ... on MutationDeleteLydiaAccountSuccess {
          data {
            id
          }
        }
      }
    }
  `);

  const searchLydiaAccounts = async (
    alreadyLinkedAccounts: Array<{ name: MaybeLoading<string> }>,
  ) => {
    if (!allLoaded(alreadyLinkedAccounts)) return;
    const response = await fetch(`${env.PUBLIC_LYDIA_API_URL}/api/auth/login.json`, {
      method: 'POST',
      body: new URLSearchParams({
        phone,
        password,
      }),
    });
    if (!response.ok) throw new Error('Mauvais identifiants');

    let { business_list } = await response.json();
    business_list = business_list.filter(
      (business: { name: string; api_token_id: string; api_token: string }) =>
        // If the lydia account is already linked to the group, don't show it
        !alreadyLinkedAccounts.some((lydiaAccount) => lydiaAccount.name === business.name),
    );
    lydiaAccounts = business_list;
  };

  const addLydiaAccount = async (
    name: string,
    api_token_id: string,
    api_token: string,
    groupUid: MaybeLoading<string>,
  ) => {
    if (!loaded(groupUid)) return;
    const RegisterLydiaAccount = graphql(`
      mutation RegisterLydiaAccount(
        $name: String!
        $api_token_id: String!
        $api_token: String!
        $group: String!
      ) {
        upsertLydiaAccount(
          name: $name
          privateToken: $api_token_id
          vendorToken: $api_token
          groupUid: $group
        ) {
          id
          name
        }
      }
    `);

    await RegisterLydiaAccount.mutate({
      name,
      api_token_id,
      api_token,
      group: groupUid,
    });

    await PageGroupEditBankAccounts.fetch({
      variables: { uid: $page.params.uid },
    });

    toasts.success('Compte Lydia ajouté');
    lydiaAccounts = lydiaAccounts.filter((account) => account.api_token_id !== api_token_id);
  };
</script>

<MaybeError result={$PageGroupEditBankAccounts} let:data={{ group }}>
  <div class="contents">
    <Submenu>
      {#each group.lydiaAccounts as { name, id }}
        <SubmenuItem icon={null}>
          <LoadingText value={name} />
          <ButtonSecondary
            slot="right"
            danger
            on:click={async () => {
              if (!loaded(id)) return;
              await DeleteLydiaAccount.mutate({ id });
              await PageGroupEditBankAccounts.fetch({
                variables: {
                  uid: $page.params.uid,
                },
              });
            }}>Supprimer</ButtonSecondary
          >
        </SubmenuItem>
      {/each}
    </Submenu>
    <form
      class="add-account"
      on:submit|preventDefault={async () => searchLydiaAccounts(group.lydiaAccounts)}
    >
      <legend>
        Ajouter un compte Lydia
        <ButtonGhost on:click={openHelp}>
          <IconHelp />
        </ButtonGhost>
        <ModalOrDrawer let:close bind:open={openHelp}>
          <p>
            Pour ajouter un compte Lydia pro, vous devez d'abord créer un compte Lydia pour votre
            club.
          </p>
          <p>Pour cela, vous pouvez utiliser l'application Lydia Pro sur votre téléphone.</p>
          <p>
            Une fois le compte créé, vous pouvez l'ajouter ici en vous connectant avec vos
            identifiants Lydia.
            <strong class="danger">(Aucun mot de passe n'est enregistré sur nos serveurs.)</strong>
          </p>
          <section class="submits">
            <ButtonSecondary on:click={close}>OK</ButtonSecondary>
          </section>
        </ModalOrDrawer>
      </legend>
      <InputText type="tel" label="Numéro de téléphone" required bind:value={phone} />
      <InputText type="password" label="Mot de passe Lydia" required bind:value={password} />
      <section class="submits">
        <ButtonPrimary submits>Rechercher</ButtonPrimary>
      </section>
    </form>
    {#if lydiaAccounts.length > 0}
      <h2 class="typo-field-label">Comptes disponibles</h2>
      <Submenu>
        {#each lydiaAccounts as { name, api_token_id, api_token } (api_token_id)}
          <SubmenuItem icon={null} subtext={api_token}>
            {name}
            <ButtonSecondary
              slot="right"
              on:click={async () => addLydiaAccount(name, api_token_id, api_token, group.uid)}
              >Ajouter</ButtonSecondary
            >
          </SubmenuItem>
        {/each}
      </Submenu>
    {/if}
  </div>
</MaybeError>

<style>
  .contents {
    padding: 1rem;
  }

  .submits {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-top: 1rem;
    margin-bottom: 2rem;
  }

  h2 {
    margin-top: 1rem;
    font-weight: normal;
  }

  legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1ch;
    align-items: center;
  }
</style>
