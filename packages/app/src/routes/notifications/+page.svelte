<script lang="ts">
  import { PUBLIC_STORAGE_URL, PUBLIC_VAPID_KEY } from '$env/static/public';
  import { arrayBufferToBase64 } from '$lib/base64';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import { _notificationsQuery } from './+page';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import CardNotification from '$lib/components/CardNotification.svelte';
  import Alert from '$lib/components/Alert.svelte';

  export let data: PageData;
  let subscriptionName = '';
  let subscription: PushSubscription | null;

  onMount(async () => {
    let sw: ServiceWorkerRegistration;
    try {
      sw = await navigator.serviceWorker.ready;
      subscription = await sw.pushManager.getSubscription();
    } catch (error) {
      unsupported = true;
      return;
    }

    const { notifications } = await $zeus.query({
      notifications: [
        {
          subscriptionEndpoint: subscription?.endpoint
        },
        _notificationsQuery
      ]
    });
    data.notifications = notifications;
  });

  let subscribed = false;
  let loading = false
  let unsupported = false;

  async function checkIfSubscribed(): Promise<void> {
    await logOnServer('checking if subscribed')

    if (Notification.permission !== 'granted') {
      subscribed = false;
      return;
    }

    await logOnServer('is subscribed, push manager supported')

    const sw = await navigator.serviceWorker.ready;
    await logOnServer('got service worker')
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
            endpoint: subscription.endpoint
          },
          true
        ]
      });

      if (!deleteNotificationSubscription) {
        console.error('subscription does not exist on the server');
        return;
      }

      subscribed = false;
    }
  }

  async function logOnServer(message: string) {
    await fetch(new URL(`../log?message=${encodeURIComponent(message)}`, PUBLIC_STORAGE_URL));
  }

  async function subscribeToNotifications(): Promise<void> {
    loading = true
    if ((await Notification.requestPermission()) === 'granted') {
      await logOnServer('subscribing to notifications')
      await logOnServer(`has sw: ${'serviceWorker' in navigator}`)
      const sw = await navigator.serviceWorker.ready;
      await logOnServer('finished waiting on service worker…')
      if (!sw) {
        unsupported = true;
        loading = false
        return;
      }
      await logOnServer('got service worker')
      const subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: PUBLIC_VAPID_KEY
      });
      if (!subscription) {
        unsupported = true;
        loading = false
        return;
      }
      await logOnServer('got subscription')
      const { expirationTime, endpoint } = subscription;
      await logOnServer(`got subscription details: ${expirationTime}, ${endpoint}`)
      await $zeus.mutate({
        upsertNotificationSubscription: [
          {
            // eslint-disable-next-line unicorn/no-null
            expiresAt: expirationTime ? new Date(expirationTime) : null,
            name: subscriptionName,
            endpoint,
            keys: {
              auth: await arrayBufferToBase64(subscription.getKey('auth') ?? new ArrayBuffer(0)),
              p256dh: await arrayBufferToBase64(subscription.getKey('p256dh') ?? new ArrayBuffer(0))
            }
          },
          {
            id: true,
            expiresAt: true,
            endpoint: true
          }
        ]
      });
      subscribed = true;
    }
    loading = false
  }
</script>

<h1>
  Notifications

  <div class="actions">
    {#await checkIfSubscribed()}
    <p class="loading">Chargement…</p>
    {:then}
      {#if subscribed}
        <ButtonSecondary on:click={async () => unsubscribeFromNotifications()}
          >Désactiver</ButtonSecondary
        >
      {:else}
        <input type="hidden" bind:value={subscriptionName} placeholder="Nom de l'appareil" />
        <ButtonSecondary {loading} on:click={async () => subscribeToNotifications()}>Activer</ButtonSecondary>
      {/if}
      <ButtonSecondary
        danger
        on:click={async () => {
          await $zeus.mutate({ testNotification: [{subscriptionEndpoint: subscription?.endpoint }, true] });
        }}>Tester</ButtonSecondary
      >
    {:catch error}
      <Alert theme="danger">Impossible d'activer les notifications: {error}</Alert>
    {/await}
  </div>
</h1>

{#if unsupported}
  <p>Navigateur non supporté.</p>
  <p class="typo-details">Ce navigateur ne supporte pas les notifcations Web Push.</p>
{:else if subscribed}
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
