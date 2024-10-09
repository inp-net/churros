<script lang="ts">
  import { page } from '$app/stores';
  import { env } from '$env/dynamic/public';
  import { graphql } from '$houdini';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputPassword from '$lib/components/InputPassword.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { countThing } from '$lib/i18n';
  import { allLoaded, loaded, mapLoading, type MaybeLoading } from '$lib/loading';
  import { toasts } from '$lib/toasts';
  import { z } from 'zod';
  import IconHelp from '~icons/msl/help-outline';
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
    if (!response.ok) {
      toasts.error('Impossible de se connecter à Lydia, vérifie tes identifiants');
      return;
    }

    const data = await response.json();

    await z
      .object({
        business_list: z.array(
          z.object({
            name: z.string(),
            api_token_id: z.string(),
            api_token: z.string(),
          }),
        ),
      })
      .parseAsync(data)
      .then(({ business_list }) => {
        lydiaAccounts = business_list.filter(
          (business: { name: string; api_token_id: string; api_token: string }) =>
            // If the lydia account is already linked to the group, don't show it
            !alreadyLinkedAccounts.some((lydiaAccount) => lydiaAccount.name === business.name),
        );
      })
      .catch(async () => {
        toasts.debug('Got response from Lydia:', JSON.stringify(data, null, 2), {
          lifetime: Number.POSITIVE_INFINITY,
        });
        toasts.error(
          'Impossible de récupérer les comptes Lydia',
          await z
            .object({ message: z.string() })
            .parseAsync(data)
            .then((res) => res.message)
            .catch(() => ''),
        );
      });
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
          ...MutationErrors
          ... on MutationUpsertLydiaAccountSuccess {
            data {
              id
              name
            }
          }
        }
      }
    `);

    const result = await RegisterLydiaAccount.mutate({
      name,
      api_token_id,
      api_token,
      group: groupUid,
    });

    await PageGroupEditBankAccounts.fetch({
      variables: { uid: $page.params.uid },
    });

    toasts.mutation(
      result,
      'upsertLydiaAccount',
      'Compte Lydia ajouté',
      "Impossible d'ajouter le compte Lydia",
    );
    lydiaAccounts = lydiaAccounts.filter((account) => account.api_token_id !== api_token_id);
  };
</script>

<MaybeError result={$PageGroupEditBankAccounts} let:data={{ group }}>
  <div class="contents">
    <Submenu>
      {#each group.lydiaAccounts as { name, id, eventsCount }}
        <SubmenuItem
          icon={null}
          subtext={mapLoading(eventsCount, (count) => countThing('évènement lié', count))}
        >
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
      {:else}
        <SubmenuItem icon={null}>
          <span class="muted">Aucune compte lié pour l'instant.</span>
        </SubmenuItem>
      {/each}
    </Submenu>
    <form
      class="add-account"
      on:submit|preventDefault={async () => searchLydiaAccounts(group.lydiaAccounts)}
    >
      <legend class="typo-field-label">
        Ajouter un compte Lydia
        <ButtonGhost on:click={openHelp}>
          <IconHelp />
        </ButtonGhost>
        <ModalOrDrawer narrow let:close bind:open={openHelp} title="Ajouter un compte Lydia">
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
          <section class="actions">
            <ButtonSecondary on:click={close}>OK</ButtonSecondary>
          </section>
        </ModalOrDrawer>
      </legend>
      <InputText type="tel" label="Numéro de téléphone" required bind:value={phone} />
      <InputPassword hint="" label="Mot de passe Lydia" required bind:value={password} />

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

  .actions {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1rem 0;
  }

  form.add-account {
    margin-top: 2rem;
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
