<script>
  import { session, page, navigating } from "$app/stores";
  import { derived, get } from "svelte/store";
  import "../app.scss";

  const showLoader = derived(
    navigating,
    ($navigating, set) => {
      if (!$navigating) {
        set(false);
      } else {
        setTimeout(() => {
          if (get(navigating)) set(true);
        }, 200);
      }
    },
    false
  );
</script>

{#if $showLoader}Loading...{/if}

<p>
  {#if $page.url.pathname !== "/"}
    <a href="/" sveltekit:prefetch>Accueil</a>
  {/if}
  {#if $session.me && $session.token}
    <a href="/me" sveltekit:prefetch>{$session.me.name}</a>
    <a href="/logout?{new URLSearchParams({ token: $session.token })}">
      Se déconnecter
    </a>
  {:else}
    <a
      href="/login?{new URLSearchParams({ then: $page.url.pathname })}"
      sveltekit:prefetch
    >
      Se connecter
    </a>
    <a href="/register" sveltekit:prefetch>S'inscrire</a>
  {/if}
</p>

<slot />
