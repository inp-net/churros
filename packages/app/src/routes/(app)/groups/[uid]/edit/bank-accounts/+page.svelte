<script lang="ts">
  import { page } from '$app/stores';
  import { env } from '$env/dynamic/public';
  import { graphql } from '$houdini';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { allLoaded, loaded, type MaybeLoading } from '$lib/loading';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageGroupEditBankAccounts } = data);

  let loading = false;
  let phone = '';
  let password = '';
  let lydiaAccounts: Array<{ name: string; api_token_id: string; api_token: string }> = [];

  const searchLydiaAccounts = async (
    alreadyLinkedAccounts: Array<{ name: MaybeLoading<string> }>,
  ) => {
    if (loading) return;
    if (!allLoaded(alreadyLinkedAccounts)) return;
    try {
      loading = true;
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
    } finally {
      loading = false;
    }
  };

  const addLydiaAccount = async (
    name: string,
    api_token_id: string,
    api_token: string,
    groupUid: MaybeLoading<string>,
  ) => {
    if (loading) return;
    if (!loaded(groupUid)) return;
    try {
      loading = true;

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
    } finally {
      loading = false;
    }
  };
</script>

<MaybeError result={$PageGroupEditBankAccounts} let:data={{ group }}>
  <h2>Mes comptes</h2>
  <ul class="nobullet accounts">
    {#each group.lydiaAccounts as { name } (name)}
      <li>
        <p>{name}</p>
        <p />
        <div class="actions">
          <ButtonSecondary danger>Supprimer</ButtonSecondary>
        </div>
      </li>
    {/each}
  </ul>

  <hr />

  <form
    class="add-account"
    on:submit|preventDefault={async () => searchLydiaAccounts(group.lydiaAccounts)}
  >
    <legend class="typo-title">Ajouter un compte Lydia</legend>
    <p>
      Pour ajouter un compte Lydia pro, vous devez d'abord créer un compte Lydia pour votre club.
      Pour cela, vous pouvez utiliser l'application Lydia Pro sur votre téléphone. Une fois le
      compte créé, vous pouvez l'ajouter ici en vous connectant avec vos identifiants Lydia. (Aucun
      mot de passe n'est enregistré sur nos serveurs.)
    </p>

    <InputText type="tel" label="Numéro de téléphone" required bind:value={phone} />
    <InputText type="password" label="Mot de passe Lydia" required bind:value={password} />
    <section class="submits">
      <ButtonPrimary {loading} submits>Rechercher</ButtonPrimary>
    </section>
  </form>

  {#if lydiaAccounts.length > 0}
    <form class="accounts-found">
      <h2>Comptes disponibles</h2>
      <ul class="accounts">
        {#each lydiaAccounts as { name, api_token_id, api_token } (api_token_id)}
          <li>
            <InputText type="text" label="Nom" value={name} readonly />
            <InputText type="text" label="Token" value={api_token} readonly />
            <ButtonPrimary
              {loading}
              on:click={async () => addLydiaAccount(name, api_token_id, api_token, group.uid)}
              >Ajouter</ButtonPrimary
            >
          </li>
        {/each}
      </ul>
    </form>
  {/if}
</MaybeError>

<style>
  form.add-account {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
  }

  section.submits {
    display: flex;
    justify-content: center;
  }

  li {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: space-between;
  }

  .accounts {
    display: flex;
    flex-flow: column;
    gap: 0.5rem;
    max-height: 45vh;
    margin-top: 2rem;
    overflow: auto;
  }
</style>
