<script lang="ts">
  import { page } from '$app/stores';
  import { theme } from '$lib/theme';
  import IconCalendar from '~icons/mdi/calendar';
  import IconBell from '~icons/mdi/bell';
  import IconBellLine from '~icons/mdi/bell-outline';
  import IconCalendarLine from '~icons/mdi/calendar-blank-outline';
  import IconHome from '~icons/mdi/home';
  import IconHomeLine from '~icons/mdi/home-outline';
  import IconMoon from '~icons/mdi/weather-night';
  import IconSearch from '~icons/mdi/card-search';
  import IconSearchLine from '~icons/mdi/card-search-outline';
  import IconSun from '~icons/mdi/white-balance-sunny';
  import IconUserAdd from '~icons/mdi/account-plus';
  import IconUserAddLine from '~icons/mdi/account-plus-outline';
  import IconUserGroup from '~icons/mdi/account-group';
  import IconUserGroupLine from '~icons/mdi/account-group-outline';
  import IconTicketLine from '~icons/mdi/ticket-outline';
  import IconTicketConfirmation from '~icons/mdi/ticket-confirmation';
  import Item from './Item.svelte';
</script>

<nav>
  <ul>
    <li>
      <Item
        href="/"
        selected={$page.url.pathname === '/'}
        icon={IconHomeLine}
        selectedIcon={IconHome}
      >
        Accueil
      </Item>
    </li>
    <li>
      <Item
        href="/clubs/"
        selected={$page.url.pathname.startsWith('/clubs/') ||
          $page.url.pathname.startsWith('/club/')}
        icon={IconUserGroupLine}
        selectedIcon={IconUserGroup}
      >
        Clubs
      </Item>
    </li>
    <li>
      <Item
        href="/week/"
        selected={$page.url.pathname.startsWith('/week/')}
        icon={IconCalendarLine}
        selectedIcon={IconCalendar}
      >
        Calendrier
      </Item>
    </li>
    <li>
      <Item
        href="/search/"
        selected={$page.url.pathname.startsWith('/search/')}
        icon={IconSearchLine}
        selectedIcon={IconSearch}
      >
        Recherche
      </Item>
    </li>
    {#if $page.data.me}
      <li>
        <Item
          href="/bookings/"
          selected={$page.url.pathname.startsWith('/bookings/')}
          icon={IconTicketLine}
          selectedIcon={IconTicketConfirmation}
        >
          Mes places
        </Item>
      </li>
    {/if}
    {#if $page.data.me?.canEditUsers}
      <li>
        <Item
          href="/users/"
          selected={$page.url.pathname.startsWith('/users/')}
          icon={IconUserAddLine}
          selectedIcon={IconUserAdd}
        >
          Utilisateurs
        </Item>
      </li>
    {/if}
    {#if $page.data.me}
      <li>
        <Item
          href="/notifications/"
          selected={$page.url.pathname.startsWith('/notifications/')}
          icon={IconBellLine}
          selectedIcon={IconBell}
        >
          Notifications
        </Item>
      </li>
    {/if}
    <li>
      <button
        title="Activer le thème sombre"
        on:click={() => {
          $theme = $theme === 'dark' ? 'light' : 'dark';
        }}
      >
        {#if $theme === 'dark'}
          <IconSun aria-label="Désactiver" />
        {:else}
          <IconMoon aria-label="Activer" />
        {/if}
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
