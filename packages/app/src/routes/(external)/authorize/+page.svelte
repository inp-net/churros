<script lang="ts">
  import { page } from '$app/stores';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import LogoChurros from '$lib/components/LogoChurros.svelte';
  import { toasts } from '$lib/toasts';
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

  <p class="description">{description}</p>

  <section class="accept">
    <ButtonPrimary
      {loading}
      on:click={async () => {
        loading = true;
        const { authorize } = await $zeus.mutate({
          authorize: [
            { clientId, redirectUri },
            {
              '__typename': true,
              '...on MutationAuthorizeSuccess': {
                data: true,
              },
              '...on OAuth2Error': {
                code: true,
                message: true,
              },
              '...on Error': {
                message: true,
              },
            },
          ],
        });
        if (authorize.__typename === 'Error') {
          await toasts.error('Une erreur est survenue', authorize.message);
          loading = false;
          return;
        }

        console.info(`Redirecting to ${redirectUri}`);
        window.location.href = `${redirectUri}?${new URLSearchParams({
          ...(authorize.__typename === 'OAuth2Error'
            ? { error: authorize.code, error_description: authorize.message }
            : { code: authorize.data }),
          state: data.csrfState,
        }).toString()}`;
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
    flex-grow: 1;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    max-width: 30rem;
    padding: 3rem;
    margin: auto;
    background: var(--bg);
    border: 1px solid var(--muted-border);
    border-radius: var(--radius-block);
  }

  h1,
  .description {
    text-align: center;
  }

  section.about {
    margin-top: 3rem;
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

  section.logo {
    display: flex;
    justify-content: center;
    max-height: 8rem;
  }

  section.accept {
    display: flex;
    justify-content: center;
  }
</style>
