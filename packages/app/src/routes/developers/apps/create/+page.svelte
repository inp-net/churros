<script lang="ts">
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import { toasts } from '$lib/toasts';
  import { zeus } from '$lib/zeus';
  import IconBack from '~icons/mdi/arrow-left';
  import FormApp from '../FormApp.svelte';
  import type { Group } from '$lib/components/InputGroups.svelte';

  let loading = false;
  let app = {
    name: '',
    description: '',
    website: '',
    allowedRedirectUris: '',
    owner: undefined as Group | undefined,
  };

  async function createApp() {
    if (!app.owner) {
      await toasts.error(
        "Impossible de créer l'application",
        "Tu dois choisir un groupe responsable de l'application",
      );
      return;
    }
    const { registerApp } = await $zeus
      .mutate({
        registerApp: [
          {
            website: app.website,
            allowedRedirectUris: app.allowedRedirectUris.split(' '),
            name: app.name,
            description: app.description,
            ownerGroupUid: app.owner.uid,
          },
          {
            client_id: true,
            client_secret: true,
          },
        ],
      })
      .catch(async (error: unknown) => {
        await toasts.error("Impossible de créer l'application", error?.toString() ?? '');
        return { registerApp: { client_id: '', client_secret: '' } };
      });

    ({ client_id, client_secret } = registerApp);
  }

  let client_id = '';
  let client_secret = '';
</script>

<main>
  {#if client_id && client_secret}
    <h1>Application créée</h1>
    <p>Voici tes identifiants:</p>
    <dl>
      <dt><code>client_id</code></dt>
      <dd>{client_id}</dd>
      <dt><code>client_secret</code></dt>
      <dd>{client_secret}</dd>
      <dd>
        <strong
          >Attention, garde bien ce secret quelque part, on ne pourra pas te le re-donner.</strong
        >
      </dd>
    </dl>
    <section class="back">
      <ButtonInk href=".." icon={IconBack}>Mes applications</ButtonInk>
    </section>
  {:else}
    <h1>Créer une application</h1>
    <FormApp
      {loading}
      submitText="Créer"
      bind:app
      on:submit={async () => {
        loading = true;
        try {
          await createApp();
        } catch {
          loading = false;
        }
      }}
    >
      Un·e administrateur·rice devra valider votre demande avant que vous ne puissiez utiliser
      l'application.
    </FormApp>
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 800px;
    margin: 2rem auto;
  }

  section.back {
    display: flex;
    justify-content: center;
  }
</style>
