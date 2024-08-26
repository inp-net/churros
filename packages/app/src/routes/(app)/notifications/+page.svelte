<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { graphql } from '$houdini';
  import { arrayBufferToBase64 } from '$lib/base64';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import CardNotification from '$lib/components/CardNotification.svelte';
  import LoadingChurros from '$lib/components/LoadingChurros.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { toasts } from '$lib/toasts';
  import { zeus } from '$lib/zeus';
  import { onMount } from 'svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageNotificationsInitial } = data);
  const subscriptionName = '';
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

  let noSubscription = false;

  onMount(async () => {
    let sw: ServiceWorkerRegistration;
    try {
      sw = await navigator.serviceWorker.ready;
      subscription = await sw.pushManager.getSubscription();
    } catch {
      unsupported = true;
      return;
    }

    await checkIfSubscribed();

    if (subscription?.endpoint)
      await Notifications.fetch({ variables: { endpoint: subscription?.endpoint } });
    else noSubscription = true;
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

      const result = await graphql(`
        mutation UnsubscribeFromNotifications($endpoint: String!) {
          unsubscribeFromNotifications(endpoint: $endpoint) {
            ...MutationErrors
            ... on MutationUnsubscribeFromNotificationsSuccess {
              data {
                id
              }
            }
          }
        }
      `).mutate({
        endpoint: subscription.endpoint,
      });

      if (
        toasts.mutation(
          result,
          'unsubscribeFromNotifications',
          '',
          'Impossible de désactiver les notifications',
        )
      ) {
        subscribed = false;
        noSubscription = true;
      }
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
      const result = await graphql(`
        mutation SubscribeToNotifications(
          $name: String!
          $authKey: String!
          $p256dhKey: String!
          $endpoint: String!
          $expiresAt: DateTime
        ) {
          subscribeToNotifications(
            name: $name
            endpoint: $endpoint
            keys: { auth: $authKey, p256dh: $p256dhKey }
            expiresAt: $expiresAt
          ) {
            ...MutationErrors
            ... on MutationSubscribeToNotificationsSuccess {
              data {
                id
                expiresAt
                endpoint
              }
            }
          }
        }
      `).mutate({
        name: subscriptionName,
        authKey: await arrayBufferToBase64(subscription.getKey('auth') ?? new ArrayBuffer(0)),
        p256dhKey: await arrayBufferToBase64(subscription.getKey('p256dh') ?? new ArrayBuffer(0)),
        endpoint,
        expiresAt: expirationTime ? new Date(expirationTime) : null,
      });
      if (
        toasts.mutation(
          result,
          'subscribeToNotifications',
          '',
          "Impossible d'activer les notifications",
        )
      ) {
        subscribed = true;
        noSubscription = false;
      }
    } catch (error) {
      toasts.debug('caught', error?.toString());
      throw error?.toString();
    } finally {
      loading = false;
    }
  }
</script>

<MaybeError result={$PageNotificationsInitial}>
  {#await checkIfSubscribed()}
    <h1>
      <LoadingChurros />
    </h1>
  {:then}
    {#if noSubscription || !subscribed}
      <div class="content disabled">
        <p>Tu n'a pas activé les notifications</p>
        <ButtonPrimary {loading} on:click={async () => subscribeToNotifications()}>
          Activer
        </ButtonPrimary>
      </div>
    {:else}
      <MaybeError result={$Notifications} let:data>
        <div class="content subscribed" class:subscribed>
          {#if unsupported}
            <h1>Navigateur non supporté.</h1>
            <p>Ce navigateur ne supporte pas les notifcations Web Push.</p>
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
        </div>
      </MaybeError>
    {/if}
  {:catch error}
    <Alert theme="danger">Impossible d'activer les notifications: {error}</Alert>
  {/await}
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
