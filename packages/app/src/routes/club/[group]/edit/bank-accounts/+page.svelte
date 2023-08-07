<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';

  import { PUBLIC_LYDIA_API_URL } from '$env/static/public';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';

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
    console.log(name, api_token_id, api_token);
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
            __typename: true,
          },
        ],
      });

      if (upsertLydiaAccount.__typename === 'LydiaAccount')
        lydiaAccounts = lydiaAccounts.filter((lydiaAccount) => lydiaAccount.name !== name);
    } finally {
      loading = false;
    }
  };
</script>

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
    <ButtonPrimary submits>Rechercher</ButtonPrimary>
  </section>
</form>

{#if lydiaAccounts.length > 0}
  <form class="accounts-found">
    <fieldset>
      <legend>Comptes</legend>
      {#each lydiaAccounts as { name, api_token_id, api_token } (api_token_id)}
        <div>
          <label>
            Nom du compte
            <input type="text" value={name} readonly />
          </label>
          <label>
            Token
            <input type="text" value={api_token} readonly />
          </label>
          <Button
            type="button"
            theme="primary"
            on:click={async () => addLydiaAccount(name, api_token_id, api_token)}>Ajouter</Button
          >
        </div>
      {/each}
    </fieldset>
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
</style>
