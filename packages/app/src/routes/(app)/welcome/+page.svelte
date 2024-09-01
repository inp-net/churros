<script lang="ts">
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { route } from '$lib/ROUTES';
  import party from 'party-js';
  import { onMount } from 'svelte';
  import { Gif } from 'svelte-tenor';
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

    <p>
      Ton compte a été créé avec succès ! Tu peux désormais utiliser toutes les fonctionnalités de
      l'application.
    </p>

    <h2>Quelques trucs à faire pour commencer</h2>

    <ul class="nobullet things">
      <li>
        <ButtonSecondary href={route('/notifications')}>Activer les notifs</ButtonSecondary>
      </li>
      <li>
        <ButtonSecondary href={route(`/users/[uid]/edit`, me.uid)}>
          Personnaliser ton profil
        </ButtonSecondary>
      </li>
      <li>
        <ButtonSecondary href={route('/events')}>Consulter les évènements à venir</ButtonSecondary>
      </li>
      <!-- TODO -->
      <!-- <li>
        <ButtonSecondary href={route('/search')}>Découvrir la liste des clubs</ButtonSecondary>
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
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
  }
</style>
