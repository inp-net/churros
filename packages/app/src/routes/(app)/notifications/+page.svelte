<script lang="ts">
  import { graphql } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import CardNotification from '$lib/components/CardNotification.svelte';
  import LoadingChurros from '$lib/components/LoadingChurros.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import {
    checkIfSubscribed,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  } from '$lib/notifications';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageNotificationsInitial } = data);
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

  let loading = false;
  let unsupported = false;
</script>

<MaybeError result={$PageNotificationsInitial} let:data={{ notificationSubscriptions }}>
  {#await checkIfSubscribed(notificationSubscriptions)}
    <h1>
      <LoadingChurros />
    </h1>
  {:then subscribed}
    {#if !subscribed}
      <div class="content disabled">
        <p>Tu n'a pas activé les notifications</p>
        <ButtonPrimary
          {loading}
          on:click={async () => {
            loading = true;
            try {
              const status = await subscribeToNotifications();
              if (status === 'unsupported') 
                unsupported = true;
               else if (status === 'ok') 
                await PageNotificationsInitial.fetch();
              
            } finally {
              loading = false;
            }
          }}
        >
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
                <ButtonSecondary
                  on:click={async () => {
                    loading = true;
                    try {
                      await unsubscribeFromNotifications();
                    } finally {
                      loading = false;
                    }
                  }}>Désactiver</ButtonSecondary
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
