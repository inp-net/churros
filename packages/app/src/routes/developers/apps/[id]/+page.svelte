<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonCopyToClipboard from '$lib/components/ButtonCopyToClipboard.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonToggleShow from '$lib/components/ButtonToggleShow.svelte';
  import { formatDateTime } from '$lib/dates';
  import { me } from '$lib/session';
  import { toasts } from '$lib/toasts';
  import { zeus } from '$lib/zeus';
  import IconUsers from '~icons/mdi/account-multiple-outline';
  import IconWarning from '~icons/mdi/alert-outline';
  import IconCalendar from '~icons/mdi/calendar-outline';
  import IconReset from '~icons/mdi/refresh';
  import ButtonToggleActiveApp from '../ButtonToggleActiveApp.svelte';
  import FormApp from '../FormApp.svelte';
  import type { PageData } from './$types';
  import { _query } from './+page';
  import { LineChart, ScaleTypes } from '@carbon/charts-svelte';
  import '@carbon/charts-svelte/styles.css';

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
    secretLength,
  } = data.thirdPartyApp;

  let clientSecret: string | undefined;
  let clientSecretShown = true;

  let app = {
    name,
    description,
    allowedRedirectUris: allowedRedirectUris.join(' '),
    website,
    ownerGroup: owner,
  };

  function redact(textOrLength: string | number): string {
    return '\u2022'.repeat(typeof textOrLength === 'string' ? textOrLength.length : textOrLength);
  }

  async function rotateSecret() {
    toasts.info('Es-tu sûr·e?', "L'ancien secret ne sera plus valide", {
      async action({ data: { id }, id: toastId }) {
        ({ rotateAppSecret: clientSecret } = await $zeus
          .mutate({
            rotateAppSecret: [{ id }, true],
          })
          .catch((error) => {
            toasts.error('Impossible de regénérer le secret', error.message);
            throw error;
          }));
        await toasts.remove(toastId);
        await toasts.success('Secret regénéré');
      },
      labels: {
        action: 'Confirmer',
        close: 'Annuler',
      },
      lifetime: Number.POSITIVE_INFINITY,
      data: {
        id: data.thirdPartyApp.id,
      },
    });
  }

  function notNull<T>(value: T | null | undefined): value is T {
    return value !== null;
  }

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

    app = {
      ...app,
      ...editApp,
      allowedRedirectUris: allowedRedirectUris.join(' '),
      ownerGroup: owner,
    };
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
    <div class="users">
      <IconUsers></IconUsers>
      {data.thirdPartyApp.usersCount} utilisateur·ice·s
    </div>
    <div class="date"><IconCalendar></IconCalendar> Créée le {formatDateTime(createdAt)}</div>
  </section>
  {#if !active}
    <section class="inactive">
      <IconWarning></IconWarning>
      <p class="explain">
        L'application n'est pas validée, donc seules les URIs de redirection locales (localhost,
        etc) fonctionnent
      </p>
    </section>
  {/if}
  <section class="details">
    <dl>
      <dt><code> client_id </code></dt>
      <dd>
        <code>{clientId}</code>
        <ButtonCopyToClipboard text={clientId}></ButtonCopyToClipboard>
      </dd>
      <dt><code>client_secret</code></dt>
      <dd>
        {#if clientSecret}
          <code>{clientSecretShown ? clientSecret : redact(clientSecret)}</code>
          <ButtonToggleShow bind:shown={clientSecretShown}></ButtonToggleShow>
          <ButtonCopyToClipboard text={clientSecret}></ButtonCopyToClipboard>
          <Alert theme="danger"
            >Attention, garde bien ce secret, on ne peut pas te le re-donner ensuite.</Alert
          >
        {:else}
          <code>
            {redact(secretLength)}
          </code>
          <ButtonSecondary icon={IconReset} danger on:click={rotateSecret}
            >Regénérer</ButtonSecondary
          >
        {/if}
      </dd>
    </dl>
  </section>
  <section class="stats">
    <h2>Statistiques</h2>
    <LineChart
      data={data.thirdPartyApp?.apiUsage?.nodes.filter(notNull).map((node) => ({
        group: node.queryName,
        ...node,
      })) ?? []}
      options={{
        title: "Requêtes d'API",
        axes: {
          bottom: {
            title: 'Temps',
            mapsTo: 'date',
            scaleType: ScaleTypes.TIME,
          },
          left: {
            title: "Nombre d'appels",
            mapsTo: 'count',
            scaleType: ScaleTypes.LINEAR,
          },
        },
      }}
    />
    <LineChart
      data={data.thirdPartyApp?.rateLimitHits?.nodes.filter(notNull).map((node) => ({
        group: node.queryName,
        ...node,
      })) ?? []}
      options={{
        title: "Limites d'appels atteintes",
        axes: {
          bottom: {
            title: 'Temps',
            mapsTo: 'date',
            scaleType: ScaleTypes.TIME,
          },
          left: {
            title: "Pénalité d'attente (ms)",
            mapsTo: 'count',
            scaleType: ScaleTypes.LINEAR,
          },
        },
      }}
    ></LineChart>
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

  :global(.stats) {
    --cds-charts-font-family: var(--font-main) !important;
  }

  /* stylelint-disable-next-line selector-class-pattern */
  :global(.stats .cds--cc--title p.title) {
    font-family: var(--font-main);
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

  .inactive {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  .inactive p {
    flex-grow: 1;
    width: min-content;
  }

  .favicon {
    height: 1.2em;
  }
</style>
