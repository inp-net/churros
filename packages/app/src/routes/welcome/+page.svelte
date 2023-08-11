<script lang="ts">
  import { page } from '$app/stores';
  import party from 'party-js';
  import { onMount } from 'svelte';
  import { Gif } from 'svelte-tenor';

  $: me = $page.data.me!;

  onMount(() => {
    party.confetti(party.Rect.fromScreen(), { count: 100 });
  });
</script>

<h1>Bienvenue sur Centraverse !</h1>

<svelte:window
  on:click={(event) => {
    party.confetti(event);
  }}
/>

<p>
  Votre compte a été créé avec succès ! Vous pouvez désormais utiliser toutes les fonctionnalités de
  l'application.
</p>

<h2>Quelques trucs à faire pour commencer</h2>

<ul>
  <li><a href="/users/{me.uid}/">Personnaliser votre profil</a></li>
  <li><a href="/events/">Consulter les évènements à venir</a></li>
  <li><a href="/groups/">Découvrir la liste des clubs</a></li>
  <li>Rejoindre les groupes d'actualités de votre école</li>
</ul>

<p class="text-center">
  <Gif
    gif={{
      id: '16043627',
      description: 'Hello There Private From Penguins Of Madagascar GIF',
      width: 220,
      height: 220,
      gif: 'https://media.tenor.com/pvFJwncehzIAAAAM/hello-there-private-from-penguins-of-madagascar.gif',
    }}
  />
</p>

<style lang="scss">
  p :global(.gif) {
    border-radius: var(--radius-block);
  }
</style>
