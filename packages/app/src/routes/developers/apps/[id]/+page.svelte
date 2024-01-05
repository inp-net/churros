<script lang="ts">
  import { env } from '$env/dynamic/public';
  import IconReset from '~icons/mdi/refresh';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { toasts } from '$lib/toasts';
  import type { PageData } from './$types';
  import FormApp, { type ThirdPartyApp } from '../FormApp.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import { zeus } from '$lib/zeus';
  import { _query } from './+page';
  import { formatDateTime } from '$lib/dates';
  import { me } from '$lib/session';
  import ButtonToggleActiveApp from '../ButtonToggleActiveApp.svelte';

  export let data: PageData;
  let loading = false;
  let {
    name,
    description,
    allowedRedirectUris,
    createdAt,
    faviconUrl,
    clientId,
    active,
    owner,
    website,
  } = data.thirdPartyApp;

  let app: ThirdPartyApp = {
    name,
    description,
    allowedRedirectUris: allowedRedirectUris.join(' '),
    website,
    ownerGroup: owner,
  };

  async function updateApp() {
    if (!app.ownerGroup) return;
    const { editApp } = await $zeus.mutate({
      editApp: [
        {
          id: data.thirdPartyApp.id,
          allowedRedirectUris: app.allowedRedirectUris.split(' '),
          description: app.description,
          name: app.name,
          ownerGroupUid: app.ownerGroup.uid,
          website: app.website,
        },
        _query,
      ],
    });

    if (active && !editApp.active) {
      await toasts.warn(
        'Validation nécéssaire',
        "L'application est de nouveau en attente de validation",
      );
    }

    ({ name, description, allowedRedirectUris, createdAt, faviconUrl, active, owner, website } =
      editApp);
  }
</script>

<main>
  <h1>
    <ButtonBack go="../"></ButtonBack>
    <img src={faviconUrl} alt="" class="favicon" />
    {name}
  </h1>
  <section class="metadata">
    <div class="status">
      <Badge theme={active ? 'success' : 'warning'}
        >{#if active}
          Active
        {:else}
          En attente de validation
        {/if}</Badge
      >
    </div>
    {#if $me?.admin}
      <ButtonToggleActiveApp {...data.thirdPartyApp}></ButtonToggleActiveApp>
    {/if}
    <div class="date">Créée le {formatDateTime(createdAt)}</div>
  </section>
  <section class="details">
    <dl>
      <dt><code> client_id </code></dt>
      <dd><code>{clientId}</code></dd>
      <dt><code>client_secret</code></dt>
      <dd>
        <ButtonSecondary
          icon={IconReset}
          danger
          on:click={async () => {
            await toasts.error('Pas encore implémenté', `Contactez ${env.PUBLIC_CONTACT_EMAIL}`);
          }}>Réinitialiser</ButtonSecondary
        >
      </dd>
    </dl>
  </section>
  <section class="edit">
    <h2>Modifier</h2>
    <FormApp
      submitText="Modifier"
      on:submit={async () => {
        loading = true;
        try {
          await updateApp();
        } finally {
          loading = false;
        }
      }}
      {loading}
      bind:app
    >
      Si les URIs de redirection sont modifiées, un·e administrateur·rice devra valider les
      changements, et l'application sera désactivée jusqu'à validation.
    </FormApp>
  </section>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 800px;
    margin: 2rem auto;
  }

  h1 {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .metadata {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .favicon {
    height: 1.2em;
  }
</style>
