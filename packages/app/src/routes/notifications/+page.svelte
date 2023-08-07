<script lang="ts">
  import { PUBLIC_VAPID_KEY } from '$env/static/public';
  import { arrayBufferToBase64 } from '$lib/base64';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import { _notificationsQuery } from './+page';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import CardNotification from '$lib/components/CardNotification.svelte';

  export let data: PageData;
  let subscriptionName = '';
  let subscription: PushSubscription | null;

  onMount(async () => {
    const sw = await navigator.serviceWorker.ready;
    subscription = await sw.pushManager.getSubscription();
    if (!subscription) return;

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
      await $zeus.mutate({
        upsertNotificationSubscription: [
          {
            // eslint-disable-next-line unicorn/no-null
            expiresAt: expirationTime ? new Date(expirationTime) : null,
            name: subscriptionName,
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

<h1>
  Notifications

  <div class="actions">
    {#await checkIfSubscribed() then}
      {#if subscribed}
        <ButtonSecondary on:click={async () => unsubscribeFromNotifications()}
          >Désactiver</ButtonSecondary
        >
      {:else}
        <input type="hidden" bind:value={subscriptionName} placeholder="Nom de l'appareil" />
        <ButtonSecondary on:click={async () => subscribeToNotifications()}>Activer</ButtonSecondary>
      {/if}
      <ButtonSecondary
        danger
        on:click={async () => {
          await $zeus.mutate({ testNotification: true });
        }}>Tester</ButtonSecondary
      >
    {/await}
  </div>
</h1>

{#if subscribed}
  <ul class="notifications nobullet">
    {#each data.notifications.edges.map(({ node }) => node) as { id, ...notif } (id)}
      <li>
        <CardNotification {...notif} href={notif.goto} />
      </li>
    {:else}
      <li class="empty">Aucune notification reçue pour le moment.</li>
    {/each}
  </ul>
{/if}

<style lang="scss">
  h1 {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-bottom: 2rem;
    text-align: center;
  }

  ul.notifications {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    justify-content: center;
    max-width: 600px;
    margin: 0 auto;
    margin-top: 2rem;

    li.empty {
      width: 100%;
      padding: 1rem;
      background: var(--muted-bg);
      border-radius: var(--radius-block);
    }
  }
</style>
