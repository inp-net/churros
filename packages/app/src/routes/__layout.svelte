<script lang="ts">
  import { navigating, page, session } from '$app/stores'
  import { derived } from 'svelte/store'
  import '../app.scss'

  let timeout: unknown
  const showLoader = derived(
    navigating,
    ($navigating, set) => {
      if (!$navigating) {
        set(false)
        if (timeout !== undefined) clearTimeout(timeout as number)
      } else {
        timeout = setTimeout(() => set(true), 200)
      }
    },
    false
  )
</script>

{#if $showLoader}Loading...{/if}

<p>
  {#if $page.url.pathname !== '/'}
    <a href="/" sveltekit:prefetch>Accueil</a>
  {/if}
  {#if $session.me && $session.token}
    <a href="/me" sveltekit:prefetch>{$session.me.name}</a>
    <a href="/logout?{new URLSearchParams({ token: $session.token })}"> Se déconnecter </a>
  {:else}
    <a href="/login?{new URLSearchParams({ then: $page.url.pathname })}" sveltekit:prefetch>
      Se connecter
    </a>
    <a href="/register" sveltekit:prefetch>S'inscrire</a>
  {/if}
</p>

<slot />
