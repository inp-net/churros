<script lang="ts">
  import type { NotificationChannel } from '$lib/zeus';
  import { formatDistanceToNow } from 'date-fns';
  import fr from 'date-fns/locale/fr/index.js';
  import { ICONS_NOTIFICATION_CHANNELS } from '$lib/display';

  export let href: string;
  export let channel: NotificationChannel;
  export let title: string;
  export let body: string;
  export let timestamp: Date | undefined = undefined;
  export let actions: Array<{ name: string; value: string }>;
  const date = timestamp
    ? formatDistanceToNow(timestamp, { addSuffix: true, locale: fr })
    : undefined;
</script>

<article class="card-notification" class:has-actions={actions.length > 0}>
  <a {href} class="content">
    <div class="icon">
      <svelte:component
        this={ICONS_NOTIFICATION_CHANNELS[channel] || ICONS_NOTIFICATION_CHANNELS.Other}
      ></svelte:component>
    </div>
    <div class="body">
      <div class="body-title">{title}</div>
      <div class="body-body">{body}</div>
      <div class="timestamp">{date}</div>
    </div>
  </a>
  <div class="action" class:mono={actions.length === 1} class:duo={actions.length >= 2}>
    {#each actions.slice(0, 2) as { name, value }, i}
      <a class="action-label" class:up={i === 0} class:down={i === 1} href={value}>{name}</a>
    {/each}
  </div>
</article>

<style lang="scss">
  .card-notification {
    display: flex;
  }

  .content {
    display: flex;
    flex-flow: row wrap;
    column-gap: 1.5rem;
    align-items: center;
    width: 100%;
    height: var(--size);
    padding: 1rem 1.5rem;
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }

  .content:hover,
  .content:focus-visible {
    color: var(--hover-text);
    background: var(--hover-bg);
    border-color: var(--hover-border);
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
    font-weight: normal;
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
    width: 100%;
    padding: 1.25rem;
    font-weight: bold;
    text-align: center;
  }

  .duo .action-label {
    height: 50%;
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

  .card-notification.has-actions .content {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .card-notification.has-actions .content:not(:hover, :focus-visible) {
    border-right: none;
  }

  .content:hover + .action,
  .content:focus-visible + .action {
    border-left: none;

    &.duo .action-label {
      border-left: none;
    }
  }
</style>
