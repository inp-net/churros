<script lang="ts">
  import { fragment, graphql, type NavigationBottomMe } from '$houdini';
  import { ButtonNavigation, ButtonSecondary } from '$lib/components';
  import { route } from '$lib/ROUTES';
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

  export let me: NavigationBottomMe | null;
  $: data = fragment(
    me,
    graphql(`
      fragment NavigationBottomMe on User {
        uid
      }
    `),
  );
</script>

<nav class:transparent>
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

  {#if $data}
    <ButtonNavigation
      href={route('/users/[uid]', $data.uid)}
      routeID="/(app)/users/[uid]"
      label="Moi"
      icon={IconAccountOutline}
      iconFilled={IconAccount}
    />
  {:else}
    <ButtonSecondary href={route('/login')}>Connexion</ButtonSecondary>
  {/if}
</nav>

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
    view-transition-name: navigation-bottom;
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
