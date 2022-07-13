<script lang="ts">
  import { navigating, page, session } from '$app/stores'
  import { derived } from 'svelte/store'

  let timeout: unknown
  const showLoader = derived(
    navigating,
    ($navigating, set) => {
      if (timeout !== undefined) clearTimeout(timeout as number)
      if ($navigating) {
        timeout = setTimeout(() => {
          set(true)
        }, 200)
      } else {
        set(false)
      }
    },
    false
  )
</script>

{#if $showLoader}Loading...{/if}

<div class="top-bar">
  <div>
    <a href="/" sveltekit:prefetch>Accueil</a>
  </div>
  <div>
    {#if $session.me && $session.token}
      <a href="/me" sveltekit:prefetch>{$session.me.name}</a>
      <a href="/logout?{new URLSearchParams({ token: $session.token })}"> Se déconnecter </a>
    {:else}
      <a href="/login?{new URLSearchParams({ to: $page.url.pathname })}" sveltekit:prefetch>
        Se connecter
      </a>
      <a href="/register" sveltekit:prefetch>S'inscrire</a>
    {/if}
  </div>
</div>

<style lang="scss">
  .top-bar {
    position: sticky;
    top: 0;
    display: flex;
    justify-content: space-between;
    padding: 1em;
    color: white;
    background-color: rgb(224 223 223);
    border-block-end: 1px solid rgb(128 128 128);
    box-shadow: 0 0 0.5em rgb(0 0 0 / 10%);

    a {
      color: black;
    }
  }
</style>
