<script lang="ts">
  import ButtonNavigation from '$lib/components/ButtonNavigation.svelte';
  import { theme } from '$lib/theme';
  import IconAccount from '~icons/msl/account-circle';
  import IconAccountOutline from '~icons/msl/account-circle-outline';
  import IconCalendar from '~icons/msl/calendar-month';
  import IconCalendarOutline from '~icons/msl/calendar-today-outline';
  import IconHome from '~icons/msl/home';
  import IconHomeOutline from '~icons/msl/home-outline';
  import IconSearch from '~icons/msl/search';
  import IconDotsCircle from '~icons/msl/view-comfy-alt';
  import IconDotsCircleOutline from '~icons/msl/view-comfy-alt-outline';
  export let transparent = false;
</script>

<nav class:transparent class={$theme}>
  <ButtonNavigation
    href="/"
    routeID="/(app)"
    label="Accueil"
    icon={IconHomeOutline}
    iconFilled={IconHome}
  />

  <ButtonNavigation
    href="/groups"
    routeID="/(app)/groups"
    label="Clubs"
    icon={IconSearch}
    iconFilled={IconSearch}
  />
  <ButtonNavigation
    href="/events"
    routeID="/(app)/events/[[week=date]]"
    label="Événements"
    icon={IconCalendarOutline}
    iconFilled={IconCalendar}
  />

  <ButtonNavigation
    href="/services"
    routeID="/(app)/services"
    label="Services"
    icon={IconDotsCircleOutline}
    iconFilled={IconDotsCircle}
  />

  <ButtonNavigation
    href="/me"
    routeID="/(app)/users/[uid]"
    label="Moi"
    icon={IconAccountOutline}
    iconFilled={IconAccount}
  />
</nav>

<svelte:window
  on:keydown={(e) => {
    if (!(e instanceof KeyboardEvent)) return;
    if (e.key === 'Escape') e.preventDefault();
  }}
/>

<style>
  nav {
    z-index: 101;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
    height: 4rem;
    font-size: 1.5rem;
    background: var(--nav-bottom-background, var(--bg));
    background-repeat: repeat-x;
    background-size: auto 100%;
    border-top: var(--border-block) solid rgb(0 0 0 / 5%);
  }

  nav.noel {
    background-color: var(--bg);
    background-image: url('/noel-bottombar.png');
    background-size: cover;
    border-top: none;
  }

  nav.gd7t {
    background-color: transparent;
    background-image: url('/gd7t-bottom.png');
    background-position: center;
    background-size: 100% 100%;
    backdrop-filter: blur(10px);
    border-top: none;
  }

  nav.transparent {
    color: white;
    background: transparent;

    --text: white;
  }

  @media (min-width: 900px) {
    nav {
      display: none;
    }
  }
</style>
