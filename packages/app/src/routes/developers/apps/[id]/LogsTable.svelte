<script lang="ts">
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { formatDateTime, formatDate } from '$lib/dates';
  import { tooltip } from '$lib/tooltip';
  import { zeus } from '$lib/zeus';
  import { format, isSameDay } from 'date-fns';
  import throttle from 'lodash.throttle';
  import { tick } from 'svelte';
  import IconErrorCircle from '~icons/mdi/alert-circle-outline';
  import IconClose from '~icons/mdi/close';
  import IconScrollUnlocked from '~icons/mdi/lock-open-outline';
  import IconScrollLocked from '~icons/mdi/lock-outline';

  export let logs: Array<{ id: string; happenedAt: Date; message: string; action: string }>;
  export let live = false;
  export let autoscroll = true;
  export const scrollToBottom = async () => {
    if (autoscroll) {
      await tick();
      autoscrolling = true;
      await tick();
      logSectionElement.scrollTop = logSectionElement.scrollHeight;
      await tick();
      autoscrolling = false;
    }
  };

  let autoscrolling = false;
  let logSectionElement: HTMLElement;
  let logDetailsModalElement: HTMLDialogElement;
  let shownLog: undefined | (typeof logs)[number] = undefined;

  const getUserFromId = throttle(async (id: string) => {
    const { user } = await $zeus.query({
      user: [
        { id },
        {
          fullName: true,
          uid: true,
          pictureFile: true,
        },
      ],
    });
    return user;
  }, 500);

  function formatTimeSafe(date: Date): string {
    try {
      if (typeof date === 'string') return format(new Date(date), 'HH:mm');

      return format(date, 'HH:mm');
    } catch {
      return '??:??';
    }
  }

  function prettyLogMessage(log: { message: string; action: string }): {
    message: string;
    theme: 'info' | 'danger' | 'muted';
    code?: string;
  } {
    switch (log.action) {
      case 'token/request': {
        const { code, redirect_uri } = JSON.parse(log.message);
        return { message: `Token demandé pour ${redirect_uri}`, theme: 'muted', code };
      }
      case 'token/ok': {
        const { code } = JSON.parse(log.message);
        return { message: `Token obtenu`, theme: 'info', code };
      }
      case 'token/error': {
        const { err, authorizationCode } = JSON.parse(log.message);
        return {
          message: `Erreur lors de l'obtention du token: ${err}`,
          theme: 'danger',
          code: authorizationCode,
        };
      }
      case 'authorize/error': {
        const { message } = JSON.parse(log.message);
        return { message: `Erreur lors de l'autorisation: ${message}`, theme: 'danger' };
      }
      case 'authorize/ok': {
        const { code } = JSON.parse(log.message);
        return { message: `Autorisation accordée, code donné`, theme: 'info', code };
      }
      // No default
    }
    return { message: log.action + ' ' + log.message, theme: 'info' };
  }

  function flattenObject(obj: Record<string, unknown>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object') {
        // prefix keys with parent key
        Object.assign(
          result,
          ...Object.entries(flattenObject(value as Record<string, unknown>)).map(([k, v]) => ({
            [`${key}.${k}`]: v,
          })),
        );
        // Object.assign(result, flattenObject(value as Record<string, unknown>));
      } else {
        result[key] = String(value);
      }
    }
    return result;
  }
</script>

<Modal bind:element={logDetailsModalElement}>
  <h1 class="modal-header">
    Détails sur un log
    <ButtonGhost
      on:click={() => {
        logDetailsModalElement.close();
      }}><IconClose></IconClose></ButtonGhost
    >
  </h1>
  {#if shownLog}
    {@const obj = JSON.parse(shownLog.message)}
    <p>
      {formatDateTime(shownLog.happenedAt)}
    </p>
    {#if 'formData' in obj}
      <h3>Données passées dans la requête en form-data</h3>
      <dl class="formdata">
        {#each Object.entries(obj.formData) as [key, value]}
          <dt class="formdata-key"><pre>{key}</pre></dt>
          <dd>{value}</dd>
        {/each}
      </dl>
      <hr />
      <h3>Autres données de débug</h3>
    {/if}
    <dl>
      {#each Object.entries(flattenObject(obj)) as [key, value]}
        {#if !key.startsWith('formData.')}
          <dt><pre>{key}</pre></dt>
          <dd>
            {value}

            {#if key === 'userId'}
              {#await getUserFromId(value)}
                <span class="equals"> = </span>
                <LoadingSpinner></LoadingSpinner>
              {:then user}
                <span class="equals"> = </span>
                {#if user}
                  <AvatarPerson target="_blank" small href="/users/{user.uid}" {...user}
                  ></AvatarPerson>
                {:else}
                  <LoadingSpinner></LoadingSpinner>
                {/if}
              {/await}
            {/if}
          </dd>
        {/if}
      {/each}
    </dl>
  {/if}
</Modal>
<section class="logs" class:autoscroll>
  <h2>Logs</h2>

  <div
    class="logs-table"
    bind:this={logSectionElement}
    on:scroll={() => {
      if (autoscrolling) return;
      autoscroll =
        logSectionElement.scrollHeight - logSectionElement.scrollTop <=
        logSectionElement.clientHeight + 100
          ? true
          : false;
    }}
  >
    <table>
      {#each logs as log (log.id)}
        {@const previousLog = logs[logs.findIndex((l) => l.id === log.id) - 1]}
        {@const { message, theme, code } = prettyLogMessage(log)}
        <tr
          class={theme}
          on:click={async () => {
            shownLog = log;
            await tick();
            logDetailsModalElement.showModal();
          }}
        >
          <td class="icon"
            >{#if theme === 'danger'}<IconErrorCircle></IconErrorCircle>{/if}
          </td>
          <td class="time" use:tooltip={formatDateTime(log.happenedAt)}
            >{formatTimeSafe(log.happenedAt)}</td
          >
          <td class="requestid" use:tooltip={code ? `Requête pour le code ${code}` : undefined}>
            {#if code}
              {code.replace(/^churros_/, '').slice(0, 5)}
            {/if}
          </td>
          <td class="message">{message}</td>
        </tr>
        {#if previousLog && !isSameDay(log.happenedAt, previousLog.happenedAt)}
          <tr class="different-day-separator">
            <td colspan="100">{formatDate(log.happenedAt)}</td>
          </tr>
        {/if}
      {/each}
    </table>
  </div>
  <div class="toolbar">
    <div class="info">
      {#if live}
        <div class="pulsing-red-dot"></div>
        <span class="typo-field-label">Live</span>
      {/if}
    </div>
    <div class="actions">
      <ButtonGhost
        help="{autoscroll ? 'Désactiver' : 'Activer'} le défilement automatique"
        on:click={() => {
          autoscroll = !autoscroll;
          if (autoscroll) logSectionElement.scrollTop = logSectionElement.scrollHeight;
        }}
      >
        Défilement {#if autoscroll}automatique{:else}manuel{/if}
        {#if autoscroll}
          <IconScrollLocked></IconScrollLocked>
        {:else}
          <IconScrollUnlocked></IconScrollUnlocked>
        {/if}
      </ButtonGhost>
    </div>
  </div>
</section>

<style>
  .logs {
    display: flex;
    flex-direction: column;
  }

  h2 {
    margin-bottom: 1.5rem;
  }

  .logs-table {
    max-height: 50vh;
    overflow: scroll;
    scroll-behavior: smooth;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0.5rem;
    border-top: var(--border-block) solid var(--border);
    transition: border-color 0.5s ease;
  }

  .logs.autoscroll .toolbar {
    border-color: var(--muted-border);
  }

  .toolbar .info {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }

  .toolbar .info span {
    font-weight: bold;
  }

  table {
    height: fit-content;
  }

  tr {
    height: 100%;
  }

  tr.danger {
    font-weight: bold;
    color: var(--danger-text);
    background: var(--danger-bg);

    &:hover,
    &:focus-visible {
      color: var(--danger-link);
      background: var(--danger-bg);
    }
  }

  td {
    padding: 0.25rem 0;
  }

  td.icon {
    display: flex;
    align-items: center;
    width: 3em;
    height: 100%;
  }

  td.icon :global(svg) {
    margin: auto;
  }

  td.time,
  td.requestid {
    font-family: var(--font-mono);
  }

  td:not(:last-child) {
    padding-right: 1rem;
  }

  tr:not(.different-day-separator) {
    cursor: pointer;
  }

  tr:not(.different-day-separator):hover,
  tr:not(.different-day-separator):focus-visible {
    color: var(--hover-text);
    background: var(--hover-bg);
  }

  .different-day-separator td {
    overflow: hidden;
    text-align: center;
  }

  .different-day-separator td::after,
  .different-day-separator td::before {
    position: relative;
    display: inline-block;
    width: 50%;
    height: var(--border-block);
    vertical-align: middle;
    content: '';
    background: var(--muted-border);
  }

  .different-day-separator td::before {
    right: 0.5em;
    margin-left: -50%;
  }

  .different-day-separator td::after {
    left: 0.5em;
    margin-right: -50%;
  }

  .pulsing-red-dot {
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

  h1.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  dd {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
    align-items: center;
  }

  dd .equals {
    font-family: var(--font-mono);
    font-weight: bold;
  }

  dt.formdata-key {
    text-transform: none;
  }

  dl.formdata {
    display: grid;
    grid-template-columns: min-content max-content;
    align-items: center;
  }
</style>
