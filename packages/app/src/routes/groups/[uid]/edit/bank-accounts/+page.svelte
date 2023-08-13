<script lang="ts">
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';

  import { PUBLIC_LYDIA_API_URL } from '$env/static/public';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';

  export let data: PageData;

  $: ({ group, lydiaAccountsOfGroup } = data);

  let loading = false;
  let phone = '';
  let password = '';
  let lydiaAccounts: Array<{ name: string; api_token_id: string; api_token: string }> = [];

  const searchLydiaAccounts = async () => {
    if (loading) return;
    try {
      loading = true;
      const response = await fetch(`${PUBLIC_LYDIA_API_URL}/api/auth/login.json`, {
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
          !lydiaAccountsOfGroup.some((lydiaAccount) => lydiaAccount.name === business.name)
      );
      lydiaAccounts = business_list;
    } finally {
      loading = false;
    }
  };

  const addLydiaAccount = async (name: string, api_token_id: string, api_token: string) => {
    if (loading) return;
    try {
      loading = true;
      const { upsertLydiaAccount } = await $zeus.mutate({
        upsertLydiaAccount: [
          {
            name,
            privateToken: api_token_id,
            vendorToken: api_token,
            groupUid: group.uid,
          },
          {
            id: true,
            name: true,
            __typename: true,
          },
        ],
      });

      if (upsertLydiaAccount.__typename === 'LydiaAccount')
        lydiaAccounts = lydiaAccounts.filter((lydiaAccount) => lydiaAccount.name !== name);
      lydiaAccountsOfGroup = [
        ...lydiaAccountsOfGroup,
        {
          id: upsertLydiaAccount.id,
          name: upsertLydiaAccount.name,
        },
      ];
    } finally {
      loading = false;
    }
  };
</script>

<h2>Mes comptes</h2>
<ul class="nobullet accounts">
  {#each lydiaAccountsOfGroup as { name } (name)}
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

<form class="add-account" on:submit|preventDefault={searchLydiaAccounts}>
  <legend class="typo-title">Ajouter un compte Lydia</legend>
  <p>
    Pour ajouter un compte Lydia pro, vous devez d'abord créer un compte Lydia pour votre club. Pour
    cela, vous pouvez utiliser l'application Lydia Pro sur votre téléphone. Une fois le compte créé,
    vous pouvez l'ajouter ici en vous connectant avec vos identifiants Lydia. (Aucun mot de passe
    n'est enregistré sur nos serveurs.)
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
            on:click={async () => addLydiaAccount(name, api_token_id, api_token)}
            >Ajouter</ButtonPrimary
          >
        </li>
      {/each}
    </ul>
  </form>
{/if}

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
