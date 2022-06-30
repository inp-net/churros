<script>
  import { session, page } from "$app/stores";
  import "../app.scss";
</script>

<p>
  {#if $page.url.pathname !== "/"} <a href="/">Accueil</a> {/if}
  {#if $session.me && $session.token}
    <a href="/me">{$session.me.name}</a>
    <a href="/logout?{new URLSearchParams({ token: $session.token })}"
      >Se déconnecter</a
    >
  {:else}
    <a href="/login?{new URLSearchParams({ then: $page.url.pathname })}">
      Se connecter
    </a>
    <a href="/register">S'inscrire</a>
  {/if}
</p>

<slot />
