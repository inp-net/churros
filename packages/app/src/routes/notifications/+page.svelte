<script lang="ts">
  import { PUBLIC_VAPID_KEY } from '$env/static/public';
    import { arrayBufferToBase64 } from '$lib/base64';
  import Button from '$lib/components/buttons/Button.svelte';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';

  export let data: PageData;

  let subscribed = false;

  async function checkIfSubscribed(): Promise<void> {
    if (!Notification.permission === 'granted') {
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

  async function subscribeToNotifications(): Promise<void> {
    if ((await Notification.requestPermission()) === 'granted') {
      console.log('Waiting for service worker');
      const sw = await navigator.serviceWorker.ready;
      const subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: PUBLIC_VAPID_KEY
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
