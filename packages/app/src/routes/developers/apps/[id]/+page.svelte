<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonCopyToClipboard from '$lib/components/ButtonCopyToClipboard.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonToggleShow from '$lib/components/ButtonToggleShow.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { formatDateTime } from '$lib/dates';
  import { me } from '$lib/session';
  import { subscribe } from '$lib/subscriptions';
  import { toasts } from '$lib/toasts';
  import { zeus } from '$lib/zeus';
  import { LineChart, ScaleTypes } from '@carbon/charts-svelte';
  import '@carbon/charts-svelte/styles.css';
  import { format } from 'date-fns';
  import { onMount, tick } from 'svelte';
  import IconUsers from '~icons/mdi/account-multiple-outline';
  import IconErrorCircle from '~icons/mdi/alert-circle-outline';
  import IconWarning from '~icons/mdi/alert-outline';
  import IconCalendar from '~icons/mdi/calendar-outline';
  import IconClose from '~icons/mdi/close';
  import IconReset from '~icons/mdi/refresh';
  import IconScrollLocked from '~icons/mdi/lock-outline';
  import IconScrollUnlocked from '~icons/mdi/lock-open-outline';
  import ButtonToggleActiveApp from '../ButtonToggleActiveApp.svelte';
  import FormApp from '../FormApp.svelte';
  import type { PageData } from './$types';
  import { _query } from './+page';

  export let data: PageData;
  let logSectionElement: HTMLElement;
  let logDetailsModalElement: HTMLDialogElement;
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

  $: logs = data.thirdPartyApp.logs.nodes;

  let clientSecret: string | undefined;
  let clientSecretShown = true;
  let shownLog: (typeof logs)[number] | undefined = undefined;
  let autoscrollLogs = true;
  let autoscrolling = false;

  let app = {
    name,
    description,
    allowedRedirectUris: allowedRedirectUris.join(' '),
    website,
    ownerGroup: owner,
  };

  onMount(() => {
    $subscribe(
      {
        thirdPartyApp: [
          { id: data.thirdPartyApp.id },
          {
            logs: [
              { first: 100 },
              {
                nodes: { happenedAt: true, message: true, action: true },
              },
            ],
          },
        ],
      },
      async (response) => {
        const freshData = await response;
        if ('errors' in freshData) return;
        if (!freshData.thirdPartyApp?.logs) return;
        data.thirdPartyApp.logs.nodes = freshData.thirdPartyApp.logs.nodes.filter(notNull);
        if (autoscrollLogs) {
          await tick();
          autoscrolling = true;
          await tick();
          logSectionElement.scrollTop = logSectionElement.scrollHeight;
          await tick();
          autoscrolling = false;
        }
      },
    );
  });

  function redact(textOrLength: string | number): string {
    return '\u2022'.repeat(typeof textOrLength === 'string' ? textOrLength.length : textOrLength);
  }

  function formatTimeSafe(date: Date): string {
    try {
      if (typeof date === 'string') 
        return format(new Date(date), 'HH:mm');
      
      return format(date, 'HH:mm');
    } catch {
      return '??:??';
    }
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

  function prettyLogMessage(log: { message: string; action: string }): {
    message: string;
    theme: 'info' | 'danger';
  } {
    switch (log.action) {
    case 'token/request': {
      const { code, redirect_uri } = JSON.parse(log.message);
      return { message: `Token demandé avec code ${code} pour ${redirect_uri}`, theme: 'info' };
    }
    case 'token/ok': {
      return { message: `Token obtenu`, theme: 'info' };
    }
    case 'token/error': {
      const { err } = JSON.parse(log.message);
      return { message: `Erreur lors de l'obtention du token: ${err}`, theme: 'danger' };
    }
    // No default
    }
    return { message: log.action + ' ' + log.message, theme: 'info' };
  }
</script>

<Modal bind:element={logDetailsModalElement}>
  <h1>
    Détails sur un log
    <ButtonGhost
      on:click={() => {
        logDetailsModalElement.close();
      }}><IconClose></IconClose></ButtonGhost
    >
  </h1>
  {#if shownLog}
    <dl>
      <dt>Date</dt>
      <dd>{formatDateTime(shownLog.happenedAt)}</dd>
      {#each Object.entries(JSON.parse(shownLog.message)) as [key, value]}
        <dt><pre>{key}</pre></dt>
        <dd>{value}</dd>
      {/each}
    </dl>
  {/if}
</Modal>

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
  <section class="logs" class:autoscroll={autoscrollLogs}>
    <h2>Logs</h2>
    <div
      class="logs-table"
      bind:this={logSectionElement}
      on:scroll={() => {
        if (autoscrolling) return;
        autoscrollLogs = logSectionElement.scrollHeight - logSectionElement.scrollTop <=
          logSectionElement.clientHeight + 100 ? true : false;
      }}
    >
      <table>
        {#each logs.reverse() as log}
          {@const { message, theme } = prettyLogMessage(log)}
          <tr
            class={theme}
            on:click={async () => {
              shownLog = log;
              await tick();
              logDetailsModalElement.showModal();
            }}
          >
            <td
              >{#if theme === 'danger'}<IconErrorCircle></IconErrorCircle>{/if}
            </td>
            <td class="time">{formatTimeSafe(log.happenedAt)}</td>
            <td>{message}</td>
          </tr>
        {/each}
      </table>
    </div>
    <div class="toolbar">
      <div class="info">
        <div class="pulsing-red-dot"></div>
        <span class="typo-field-label">Live</span>
      </div>
      <div class="actions">
        <ButtonGhost
          help="{autoscrollLogs ? 'Désactiver' : 'Activer'} le défilement automatique"
          on:click={() => {
            autoscrollLogs = !autoscrollLogs;
            if (autoscrollLogs) logSectionElement.scrollTop = logSectionElement.scrollHeight;
          }}
        >
          Défilement {#if autoscrollLogs}automatique{:else}manuel{/if}
          {#if autoscrollLogs}
            <IconScrollLocked></IconScrollLocked>
          {:else}
            <IconScrollUnlocked></IconScrollUnlocked>
          {/if}
        </ButtonGhost>
      </div>
    </div>
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

<style lang="scss">
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

  .logs {
    display: flex;
    flex-direction: column;
  }

  .logs h2 {
    margin-bottom: 1.5rem;
  }

  .logs .logs-table {
    max-height: 50vh;
    overflow: scroll;
    scroll-behavior: smooth;
  }

  .logs .toolbar {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0.5rem;
    border-top: var(--border-block) solid var(--border);
    transition: border-color 0.5s ease;
  }

  .logs.autoscroll .toolbar {
    border-color: var(--muted-border);
  }

  .logs .toolbar .info {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }

  .logs .toolbar .info span {
    font-weight: bold;
  }

  .logs td {
    padding: 0.25rem 0;
  }

  .logs td.time {
    font-family: var(--font-mono);
  }

  .logs td:not(:last-child) {
    padding-right: 1rem;
  }

  .logs tr {
    cursor: pointer;
  }

  .logs tr:hover,
  .logs tr:focus-visible {
    color: var(--hover-text);
    background: var(--hover-bg);
  }

  .logs tr.danger {
    font-weight: bold;
    color: var(--danger-text);
    background: var(--danger-bg);

    &:hover,
    &:focus-visible {
      color: var(--danger-link);
      background: var(--danger-bg);
    }
  }

  .logs .pulsing-red-dot {
    width: 1em;
    height: 1em;
    background: var(--danger-link);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }

    50% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }
</style>
