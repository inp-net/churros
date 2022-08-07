<script lang="ts">
  import { theme } from '$lib/theme';
  import MajesticonsMoon from '~icons/majesticons/moon';
  import MajesticonsSearch from '~icons/majesticons/search-line';
  import MajesticonsHome from '~icons/majesticons/home-line';
  import MajesticonsSun from '~icons/majesticons/sun';
  import MajesticonsUserGroup from '~icons/majesticons/user-group-line';
  import MajesticonsCalendar from '~icons/majesticons/calendar';
</script>

<nav>
  <ul>
    <li><a href="/" sveltekit:prefetch><MajesticonsHome />Accueil</a></li>
    <li><a href="/clubs/" sveltekit:prefetch><MajesticonsUserGroup />Clubs</a></li>
    <li><a href="/calendar/" sveltekit:prefetch><MajesticonsCalendar />Calendrier</a></li>
    <li>
      <a href="/search/" sveltekit:prefetch><MajesticonsSearch />Recherche</a>
    </li>
    <li>
      <button
        on:click={() => {
          $theme = $theme === 'dark' ? 'light' : 'dark';
        }}
      >
        {#if $theme === 'dark'}<MajesticonsSun />{:else}<MajesticonsMoon />{/if}
      </button>
    </li>
  </ul>
</nav>

<style lang="scss">
  nav {
    padding: 0 1em;
  }

  a {
    display: inline-flex;
    gap: 0.25em;
    align-items: center;
  }
</style>
