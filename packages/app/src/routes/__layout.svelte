<script>
  import { session, page } from "$app/stores";
  import "../app.scss";
</script>

<p>
  {#if $session.me && $session.token}
    {$session.me.name}
    <a href="/logout?{new URLSearchParams({ token: $session.token })}"
      >Se déconnecter</a
    >
  {:else}
    <a href="/login?{new URLSearchParams({ then: $page.url.pathname })}"
      >Se connecter</a
    >
  {/if}
</p>

<slot />
