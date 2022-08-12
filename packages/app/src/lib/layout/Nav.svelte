<script lang="ts">
  import { page } from '$app/stores';
  import { theme } from '$lib/theme';
  import MajesticonsCalendar from '~icons/majesticons/calendar';
  import MajesticonsCalendarLine from '~icons/majesticons/calendar-line';
  import MajesticonsHome from '~icons/majesticons/home';
  import MajesticonsHomeLine from '~icons/majesticons/home-line';
  import MajesticonsMoon from '~icons/majesticons/moon';
  import MajesticonsSearch from '~icons/majesticons/search-circle';
  import MajesticonsSearchLine from '~icons/majesticons/search-circle-line';
  import MajesticonsSun from '~icons/majesticons/sun';
  import MajesticonsUserGroup from '~icons/majesticons/user-group';
  import MajesticonsUserGroupLine from '~icons/majesticons/user-group-line';
  import Item from './Item.svelte';
</script>

<nav>
  <ul>
    <li>
      <Item
        href="/"
        selected={$page.url.pathname === '/'}
        icon={MajesticonsHomeLine}
        selectedIcon={MajesticonsHome}
      >
        Accueil
      </Item>
    </li>
    <li>
      <Item
        href="/clubs/"
        selected={$page.url.pathname.startsWith('/clubs/') ||
          $page.url.pathname.startsWith('/club/')}
        icon={MajesticonsUserGroupLine}
        selectedIcon={MajesticonsUserGroup}
      >
        Clubs
      </Item>
    </li>
    <li>
      <Item
        href="/calendar/"
        selected={$page.url.pathname.startsWith('/calendar/')}
        icon={MajesticonsCalendarLine}
        selectedIcon={MajesticonsCalendar}
      >
        Calendrier
      </Item>
    </li>
    <li>
      <Item
        href="/search/"
        selected={$page.url.pathname.startsWith('/search/')}
        icon={MajesticonsSearchLine}
        selectedIcon={MajesticonsSearch}
      >
        Recherche
      </Item>
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
  ul {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
