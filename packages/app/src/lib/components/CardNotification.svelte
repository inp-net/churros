<script lang="ts">
  import type { NotificationType } from '$lib/zeus';
  import type { GraphQLTypes } from '$lib/zeus';
  import { formatDistanceToNow } from 'date-fns';
  import { fr } from 'date-fns/locale';

  import IconShotgunOpened from '~icons/mdi/lock-open-outline';
  import IconShotgunOpeningSoon from '~icons/mdi/clock-alert-outline';
  import IconShotgunClosingSoon from '~icons/mdi/clock-alert-outline';
  import IconShotgunClosed from '~icons/mdi/lock-outline';
  import IconGodsonRequestReceived from '~icons/mdi/account-multiple-plus';
  import IconGodsonRequestAccepted from '~icons/mdi/check';
  import IconGodsonRequestRefused from '~icons/mdi/close';
  import IconNewArticle from '~icons/mdi/newspaper-variant-outline';
  import IconPermissionsChanged from '~icons/mdi/key-change';
  import IconOther from '~icons/mdi/help-circle-outline';

  export let type: NotificationType;
  export let title: string;
  export let body: string;
  export let timestamp: number;
  export let action: Array<GraphQLTypes['Link']>;
  const date = formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: fr });
</script>

<div class="card-notification">
  <div class="icon">
    {#if type === 'ShotgunOpened'}
      <IconShotgunOpened />
    {:else if type === 'ShotgunOpeningSoon'}
      <IconShotgunOpeningSoon />
    {:else if type === 'ShotgunClosingSoon'}
      <IconShotgunClosingSoon />
    {:else if type === 'ShotgunClosed'}
      <IconShotgunClosed />
    {:else if type === 'GodparentRequestReceived'}
      <IconGodsonRequestReceived />
    {:else if type === 'GodparentRequestAccepted'}
      <IconGodsonRequestAccepted />
    {:else if type === 'GodparentRequestRefused'}
      <IconGodsonRequestRefused />
    {:else if type === 'NewArticle'}
      <IconNewArticle />
    {:else if type === 'PermissionsChanged'}
      <IconPermissionsChanged />
    {:else}
      <IconOther />
    {/if}
  </div>
  <div class="body">
    <div class="body-title">{title}</div>
    <div class="body-body">{body}</div>
    <div class="timestamp">{date}</div>
  </div>
  <div class="action" class:mono={action.length === 1} class:duo={action.length === 2}>
    {#each action as { name, value }, i}
      <a class="action-label" class:up={i === 0} class:down={i === 1} href={value}>{name}</a>
    {/each}
  </div>
</div>

<style>
  .card-notification {
    --size: 8rem;

    display: flex;
    flex-flow: column wrap;
    align-items: center;
    justify-content: center;
    width: calc(2.58 * var(--size));
    height: var(--size);
    padding: calc(0.05 * var(--size));
    border: var(--border-block) solid var(--border);
    border-top-left-radius: var(--radius-block);
    border-bottom-left-radius: var(--radius-block);
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(0.5 * var(--size));
    height: var(--size);
    margin-bottom: 0.25rem;
    text-align: center;
    object-fit: contain;
  }

  .icon > :global(.icon) {
    width: 2em;
    height: 2em;
  }

  .body {
    display: flex;
    flex-flow: column wrap;
    align-items: left;
    justify-content: center;
    width: calc(2 * var(--size));
    height: var(--size);
  }

  .body-title {
    font-size: 1.2em;
    font-weight: bold;
  }

  .body-body {
    font-size: 1em;
  }

  .timestamp {
    font-size: 0.8em;
    color: var(--muted-text);
  }

  .action {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
  }

  .mono {
    border: var(--border-block) solid var(--border);
    border-top-right-radius: var(--radius-block);
    border-bottom-right-radius: var(--radius-block);
  }

  .mono:hover,
  .mono:focus-visible {
    color: var(--hover-text);
    background: var(--hover-bg);
    border-color: var(--hover-border);
  }

  .action-label {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    font-weight: bold;
    text-align: center;
  }

  .duo .action-label {
    width: var(--size);
    height: calc(0.5 * var(--size));
  }

  .mono .action-label {
    width: var(--size);
    height: var(--size);
  }

  .duo .up {
    border: var(--border-block) solid var(--border);
    border-bottom-width: calc(var(--border-block) / 2);
    border-top-right-radius: var(--radius-block);
  }

  .duo .down {
    border: var(--border-block) solid var(--border);
    border-top-width: calc(var(--border-block) / 2);
    border-bottom-right-radius: var(--radius-block);
  }

  .duo .action-label:hover,
  .duo .action-label:focus-visible {
    color: var(--hover-text);
    background: var(--hover-bg);
    border-color: var(--hover-border);
  }
</style>
