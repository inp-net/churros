<script lang="ts">
  import { env } from '$env/dynamic/public';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { arrayBufferToBase64 } from '$lib/base64';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$houdini';
  import { onMount } from 'svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import CardNotification from '$lib/components/CardNotification.svelte';
  import Alert from '$lib/components/Alert.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import { toasts } from '$lib/toasts';
  import { graphql } from '$houdini';

  export let data: PageData;
  $: ({ PageNotificationsInitial } = data);
  let subscriptionName = '';
  let subscription: PushSubscription | null;

  const Notifications = graphql(`
    query PageNotifications($endpoint: ID!) {
      notifications(subscriptionEndpoint: $endpoint) {
        edges {
          node {
            id
            title
            body
            goto
            imageFile
            timestamp
            channel
            group {
              uid
              name
              pictureFile
            }
            actions {
              name
              value
              computedValue
            }
          }
        }
      }
    }
  `);

  onMount(async () => {
    let sw: ServiceWorkerRegistration;
    try {
      sw = await navigator.serviceWorker.ready;
      subscription = await sw.pushManager.getSubscription();
    } catch {
      unsupported = true;
      return;
    }

    if (subscription?.endpoint)
      await Notifications.fetch({ variables: { endpoint: subscription?.endpoint } });
  });

  let subscribed = false;
  let loading = false;
  let unsupported = false;

  async function checkIfSubscribed(): Promise<void> {
    if (Notification.permission !== 'granted') {
      subscribed = false;
      return;
    }

    const sw = await navigator.serviceWorker.ready;
    const subscription = await sw.pushManager.getSubscription();
    subscribed = Boolean(
      $PageNotificationsInitial.data?.notificationSubscriptions.some(
        ({ endpoint }) => endpoint === subscription?.endpoint,
      ),
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
        toasts.error(
          'Impossible de désactiver les notifications',
          "L'appareil n'est pas abonné aux notifications",
        );
        return;
      }

      subscribed = false;
    }
  }

  async function subscribeToNotifications(): Promise<void> {
    loading = true;
    try {
      const status = await Notification.requestPermission();
      toasts.debug('got permission status', status);
      if (status === 'default') throw "T'a refusé les notifications";
      if (status === 'denied')
        throw 'Ton navigateur a refusé les notifications. Réinitialise les permissions de churros.inpt.fr dans Chrome ou Safari';

      toasts.debug('permission granted. aqcuiring sw');
      const sw = await navigator.serviceWorker.ready;
      toasts.debug('checking if browser supports sw');
      if (!sw) {
        unsupported = true;
        loading = false;
        return;
      }

      toasts.debug('support OK. subscribing');

      const subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: env.PUBLIC_VAPID_KEY,
      });
      if (!subscription) {
        unsupported = true;
        loading = false;
        return;
      }

      toasts.debug(`got sub`, JSON.stringify(subscription));

      const { expirationTime, endpoint } = subscription;
      toasts.debug('start mutation', JSON.stringify({ expirationTime, endpoint }));
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
                subscription.getKey('p256dh') ?? new ArrayBuffer(0),
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
      toasts.debug('mutation OK. marking as subscribed');
      subscribed = true;
    } catch (error) {
      toasts.debug('caught', error?.toString());
      throw error?.toString();
    } finally {
      loading = false;
    }
  }
</script>

<MaybeError result={$Notifications} let:data>
  <div class="content" class:subscribed>
    {#await checkIfSubscribed()}
      <h1>
        <LoadingSpinner />
        Chargement…
      </h1>
    {:then}
      {#if unsupported}
        <h1>Navigateur non supporté.</h1>
        <p>Ce navigateur ne supporte pas les notifcations Web Push.</p>
      {:else if !subscribed}
        <h1>Les notifications sont désactivées</h1>
        <input type="hidden" bind:value={subscriptionName} placeholder="Nom de l'appareil" />
        <ButtonPrimary
          {loading}
          on:click={async () => {
            try {
              await subscribeToNotifications();
            } catch (error) {
              toasts.error("Impossible d'activer les notifications", error?.toString());
            }
          }}>Activer</ButtonPrimary
        >
      {:else}
        <h1>
          Notifications

          <div class="actions">
            <ButtonSecondary on:click={async () => unsubscribeFromNotifications()}
              >Désactiver</ButtonSecondary
            >
            <ButtonSecondary
              danger
              on:click={async () => {
                if (subscription) {
                  await $zeus.mutate({
                    testNotification: [{ subscriptionEndpoint: subscription.endpoint }, true],
                  });
                }
              }}>Tester</ButtonSecondary
            >
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
      {/if}
    {:catch error}
      <Alert theme="danger">Impossible d'activer les notifications: {error}</Alert>
    {/await}
  </div>
</MaybeError>

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

  .content:not(.subscribed) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    margin: 0 0.5rem;
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
