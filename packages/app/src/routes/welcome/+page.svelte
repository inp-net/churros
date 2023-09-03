<script lang="ts">
  import { page } from '$app/stores';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { Gif } from 'svelte-tenor';
  import { arrayBufferToBase64 } from '$lib/base64';
  import party from 'party-js';
  import { onMount } from 'svelte';
  import { zeus } from '$lib/zeus';
  import { env } from '$env/dynamic/public';

  $: me = $page.data.me!;

  onMount(() => {
    party.confetti(party.Rect.fromScreen(), { count: 100 });
  });
</script>

<svelte:window
  on:click={(event) => {
    party.confetti(event);
  }}
/>
<div class="container">
  <div class="gif">
    <Gif
      gif={{
        id: '16043627',
        description: 'Hello There Private From Penguins Of Madagascar GIF',
        width: 220,
        height: 220,
        gif: 'https://media.tenor.com/pvFJwncehzIAAAAM/hello-there-private-from-penguins-of-madagascar.gif',
      }}
    />
  </div>

  <h1>Bienvenue sur Churros!</h1>

  <p>
    Ton compte a été créé avec succès ! Tu peux désormais utiliser toutes les fonctionnalités de
    l'application.
  </p>

  <h2>Quelques trucs à faire pour commencer</h2>

  <ul class="nobullet things">
    <li>
      <ButtonSecondary
        on:click={async () => {
          if ((await Notification.requestPermission()) === 'granted') {
            const sw = await navigator.serviceWorker.ready;
            if (!sw) return;

            const subscription = await sw.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: env.PUBLIC_VAPID_KEY,
            });
            if (!subscription) return;

            const { expirationTime, endpoint } = subscription;
            await $zeus.mutate({
              upsertNotificationSubscription: [
                {
                  // eslint-disable-next-line unicorn/no-null
                  expiresAt: expirationTime ? new Date(expirationTime) : null,
                  name: '',
                  endpoint,
                  keys: {
                    auth: await arrayBufferToBase64(
                      subscription.getKey('auth') ?? new ArrayBuffer(0)
                    ),
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
          }
        }}>Activer les notifs</ButtonSecondary
      >
    </li>
    <li><ButtonSecondary href="/users/{me.uid}">Personnaliser ton profil</ButtonSecondary></li>
    <li><ButtonSecondary href="/events/">Consulter les évènements à venir</ButtonSecondary></li>
    <li><ButtonSecondary href="/groups/">Découvrir la liste des clubs</ButtonSecondary></li>
  </ul>
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 1000px;
    padding: 0 1rem;
    margin: 0 auto;
    margin-top: 2rem;
  }

  .gif {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .gif :global(img) {
    height: 10rem;
    border-radius: var(--radius-block);
    object-fit: cover;
  }

  .things {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
  }
</style>
