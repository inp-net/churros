<script lang="ts">
  import { page } from '$app/stores';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import LogoChurros from '$lib/components/LogoChurros.svelte';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';

  const redirectUri = $page.url.searchParams.get('redirect_uri') ?? '';
  const clientId = $page.url.searchParams.get('client_id') ?? '';
  let loading = false;
  export let data: PageData;

  const { name, description, website, owner, faviconUrl } = data.app;
</script>

<main>
  <section class="churros-logo">
    <LogoChurros wordmark />
  </section>
  <section class="logo">
    <img src={faviconUrl} alt="Logo de {name}" />
  </section>
  <h1>
    {name} souhaite accéder à ton compte Churros
  </h1>

  <section class="about">
    <p class="description">{description}</p>
  </section>

  <section class="accept">
    <ButtonPrimary
      {loading}
      on:click={async () => {
        loading = true;
        const { authorize: token } = await $zeus.mutate({
          authorize: [{ clientId, redirectUri }, true],
        });
        console.info(`Redirecting to ${redirectUri}`);
        window.location.href = redirectUri + '?token=' + token;
      }}>Autoriser</ButtonPrimary
    >
  </section>

  <section class="about">
    <p class="more">
      {name} est un service tierce développé par <a href="/groups/{owner.uid}">{owner.name}</a>, non
      affilié à Churros. Plus d'infos à
      <a href={website}>{new URL(website).hostname}</a>
    </p>
  </section>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    margin: auto;
    padding: 3rem;
    flex-grow: 1;
    border-radius: var(--radius-block);
    border: 1px solid var(--muted-border);
    max-width: 30rem;
    background: var(--bg);
  }

  h1 {
    text-align: center;
  }

  section.about > * {
    text-align: center;
  }

  section.about .more {
    opacity: 0.75;
  }

  section.churros-logo {
    height: 4rem;
    margin-bottom: 2rem;
    filter: saturate(0);
  }

  section.accept {
    display: flex;
    justify-content: center;
  }
</style>
