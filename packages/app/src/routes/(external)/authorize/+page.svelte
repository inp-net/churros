<script lang="ts">
  import { page } from '$app/stores';
  import { CURRENT_VERSION } from '$lib/buildinfo';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import LogoChurros from '$lib/components/LogoChurros.svelte';
  import { isPWA } from '$lib/pwa';
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
  {#if faviconUrl}
    <section class="logo">
      <img src={faviconUrl} alt="Logo de {name}" />
    </section>
  {/if}
  <h1>
    {name} souhaite accéder à ton compte Churros
  </h1>

  <p class="description">{description}</p>

  <section class="actions">
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

        const redirectTo = new URL(redirectUri);
        redirectTo.search = new URLSearchParams({
          ...(authorize.__typename === 'OAuth2Error'
            ? { error: authorize.code, error_description: authorize.message }
            : { code: authorize.data }),
          state: data.csrfState,
        }).toString();

        if (isPWA()) window.open(redirectTo.toString(), '_blank');
        else window.location.href = redirectTo.toString();
      }}>Autoriser</ButtonPrimary
    >
    <ButtonSecondary
      href="{redirectUri}?{new URLSearchParams({
        state: data.csrfState,
        error: 'access_denied',
      })}">Annuler</ButtonSecondary
    >
  </section>

  <section class="about">
    {#if owner.uid !== 'inp-net-inp'}
      <p class="more">
        {name} est un service tierce développé par <a href="/groups/{owner.uid}">{owner.name}</a>,
        non affilié à Churros. {#if website}Plus d'infos à
          <a href={website}>{new URL(website).hostname}</a>{/if}
      </p>
    {/if}
    <p class="technical muted">
      <code>Churros v{CURRENT_VERSION}</code>
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

  section.about .technical {
    margin-top: 1em;
    font-size: 0.8rem;
    font-weight: normal;
  }

  section.churros-logo {
    height: 4rem;
    margin-bottom: 2rem;
    filter: saturate(0);
  }

  section.logo {
    display: flex;
    justify-content: center;
    height: 4rem;
  }

  section.logo img {
    height: 100%;
    object-fit: contain;
    border-radius: var(--border-block);
  }

  section.actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
  }
</style>
