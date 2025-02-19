<script lang="ts">
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { route } from '$lib/ROUTES';
  import party from 'party-js';
  import { onMount } from 'svelte';
  import { Gif } from 'svelte-tenor';
  import IconUser from '~icons/msl/account-circle-outline';
  import IconEvents from '~icons/msl/calendar-today-outline';
  import IconNotifications from '~icons/msl/notifications-outline';
  import IconServices from '~icons/msl/widgets-outline';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageWelcome } = data);

  onMount(() => {
    party.confetti(party.Rect.fromScreen(), { count: 100 });
  });
</script>

<svelte:window
  on:click={(event) => {
    party.confetti(event);
  }}
/>
<MaybeError result={$PageWelcome} let:data={{ me }}>
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
    <p class="username">
      <strong>Ton nom d'utilisateur·ice est <LoadingText class="primary" value={me.uid} /> </strong>
    </p>

    <p>
      Ton compte a été créé avec succès ! Tu peux désormais utiliser toutes les fonctionnalités de
      l'application.
    </p>

    <h2>Quelques trucs à faire pour commencer</h2>

    <ul class="nobullet things">
      <li>
        <a href={route('/notifications')}>
          <div class="icon"><IconNotifications /></div>
          Activer les notifs
        </a>
      </li>
      <li>
        <a href={route(`/users/[uid]/edit`, me.uid)}>
          <div class="icon"><IconUser /></div>
          Personnaliser ton profil
        </a>
      </li>
      <li>
        <a href={route('/events')}>
          <div class="icon"><IconEvents /></div>
          Voir les évènements à venir
        </a>
      </li>
      <li>
        <a href={route('/services')}>
          <div class="icon"><IconServices /></div>
          Explorer les services disponibles
        </a>
      </li>
      <!-- TODO -->
      <!-- <li>
        <a href={route('/search')}>Découvrir la liste des clubs</a>
      </li> -->
    </ul>
  </div>
</MaybeError>

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
    object-fit: cover;
    border-radius: var(--radius-block);
  }

  .things {
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.5rem;
  }

  .things a {
    display: flex;
    flex-flow: column;
    gap: 0.5em;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 1em;
    font-size: 1.2em;
    text-align: center;
    text-decoration: none;
    background: var(--bg2);
    border: var(--border-block) solid transparent;
    border-radius: var(--radius-block);
  }

  .things a:is(:hover, :focus-visible) {
    background: var(--primary-bg);
    border-color: var(--primary);
  }

  .things .icon {
    font-size: 2em;
  }

  .username {
    font-size: 1.7em;
    line-height: 1.1;
  }

  .username :global(> .primary) {
    text-decoration: underline;
    text-decoration-thickness: 0.125em;
  }
</style>
