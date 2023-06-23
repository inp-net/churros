<script lang="ts">
  import { PUBLIC_VAPID_KEY } from '$env/static/public';
  import { arrayBufferToBase64 } from '$lib/base64';
  import dateFnsFrenchLocale from 'date-fns/locale/fr/index.js';
  import Button from '$lib/components/buttons/Button.svelte';
  import { zeus } from '$lib/zeus';
  import { formatDistance } from 'date-fns';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import { _notificationsQuery } from './+page';

  export let data: PageData;
  let subscription: PushSubscription | null;

  onMount(async () => {
    const sw = await navigator.serviceWorker.ready;
    subscription = await sw.pushManager.getSubscription();
    if (!subscription) {
      return;
    }
    const { notifications } = await $zeus.query({
      notifications: [
        {
          subscriptionEndpoint: subscription.endpoint,
        },
        _notificationsQuery,
      ],
    });
    data.notifications = notifications;
  });

  let subscribed = false;

  async function checkIfSubscribed(): Promise<void> {
    if (Notification.permission !== 'granted') {
      subscribed = false;
      return;
    }

    const sw = await navigator.serviceWorker.ready;
    const subscription = await sw.pushManager.getSubscription();
    subscribed = data.notificationSubscriptions.some(
      ({ endpoint }) => endpoint === subscription?.endpoint
    );
  }

  async function unsubscribeFromNotifications(): Promise<void> {
    if ((await Notification.requestPermission()) === 'granted') {
      const sw = await navigator.serviceWorker.ready;
      const subscription = await sw.pushManager.getSubscription();
      if (!subscription) return;
      const { deleteNotificationSubscription } = await $zeus.mutate({
        deleteNotificationSubscription: [
          {
            endpoint: subscription.endpoint,
          },
          true,
        ],
      });

      if (!deleteNotificationSubscription) {
        console.error('subscription does not exist on the server');
        return;
      }
      subscribed = false;
    }
  }

  async function subscribeToNotifications(): Promise<void> {
    if ((await Notification.requestPermission()) === 'granted') {
      console.log('Waiting for service worker');
      const sw = await navigator.serviceWorker.ready;
      const subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: PUBLIC_VAPID_KEY,
      });
      const { expirationTime, endpoint } = subscription;
      console.log(JSON.stringify(subscription));
      const { upsertNotificationSubscription } = await $zeus.mutate({
        upsertNotificationSubscription: [
          {
            expiresAt: expirationTime ? new Date(expirationTime) : null,
            endpoint,
            keys: {
              auth: await arrayBufferToBase64(subscription.getKey('auth') ?? new ArrayBuffer(0)),
              p256dh: await arrayBufferToBase64(
                subscription.getKey('p256dh') ?? new ArrayBuffer(0)
              ),
            },
          },
          {
            id: true,
            expiresAt: true,
            endpoint: true,
          },
        ],
      });
      subscribed = true;
    }
  }
</script>

<h1>Notifications</h1>

{#await checkIfSubscribed() then}
  {#if subscribed}
    <Button on:click={async () => unsubscribeFromNotifications()}
      >Désactiver les notifications</Button
    >
  {:else}
    <Button on:click={async () => subscribeToNotifications()}>Activer les notifications</Button>
  {/if}
{/await}

{#if subscribed}
  <ul class="notifications">
    {#each data.notifications.edges.map(({ node }) => node) as { id, title, body, timestamp, actions } (id)}
      <li class="notification" data-id={id}>
        <h2>{title}</h2>
        <p>{body}</p>
        {#if timestamp}
          <p>
            {formatDistance(new Date(timestamp), new Date(), {
              locale: dateFnsFrenchLocale,
              addSuffix: true,
            })}
          </p>
        {/if}
        <ul class="actions">
          {#each actions as { name, value }}
            <li><a href={value}>{name}</a></li>
          {/each}
        </ul>
      </li>
    {/each}
  </ul>
{/if}
