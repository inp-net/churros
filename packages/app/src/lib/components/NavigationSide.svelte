<script lang="ts">
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { type NavigationSide, NavtopPendingSignupsCountStore, fragment, graphql } from '$houdini';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonNavigation from '$lib/components/ButtonNavigation.svelte';
  import ChurrosLogo from '$lib/components/LogoChurros.svelte';
  import { allLoaded, onceAllLoaded } from '$lib/loading';
  import { route } from '$lib/ROUTES';
  import IconAccountFilled from '~icons/msl/account-circle';
  import IconAccount from '~icons/msl/account-circle-outline';
  import IconBugReport from '~icons/msl/bug-report-outline';
  import IconEvents from '~icons/msl/calendar-today-outline';
  import IconBackroomsFilled from '~icons/msl/dual-screen';
  import IconBackrooms from '~icons/msl/dual-screen-outline';
  import IconEventsFilled from '~icons/msl/event';
  import IconHomeFilled from '~icons/msl/home';
  import IconHome from '~icons/msl/home-outline';
  import IconLogout from '~icons/msl/logout';
  import IconSearch from '~icons/msl/search';
  import IconSettingsFilled from '~icons/msl/settings';
  import IconSettings from '~icons/msl/settings-outline';
  import IconServicesFilled from '~icons/msl/widgets';
  import IconServices from '~icons/msl/widgets-outline';

  export let user: NavigationSide | null;
  $: data = fragment(
    user,
    graphql(`
      fragment NavigationSide on User @loading {
        uid
        external
        canAccessDocuments
        canEditGroups
        admin
        studentAssociationAdmin
      }
    `),
  );

  let animatingChurrosLogo = false;

  beforeNavigate(() => {
    animatingChurrosLogo = true;
  });
  afterNavigate(() => {
    setTimeout(() => {
      animatingChurrosLogo = false;
    }, 1000);
  });

  const PendingSignupsCount = new NavtopPendingSignupsCountStore();
  $: if (
    onceAllLoaded(
      [$data?.admin, $data?.studentAssociationAdmin],
      (admin, stu) => admin || stu,
      false,
    )
  )
    PendingSignupsCount.fetch();
</script>

<nav>
  <div class="top">
    <ButtonNavigation
      href="/"
      routeID="/(app)"
      on:click={() => {
        animatingChurrosLogo = true;
        setTimeout(() => {
          animatingChurrosLogo = false;
        }, 1000);
      }}
    >
      <ChurrosLogo drawing={animatingChurrosLogo} />
    </ButtonNavigation>
  </div>
  <div class="middle">
    <ButtonNavigation
      href="/"
      routeID="/(app)"
      label="Accueil"
      tooltipsOn="left"
      icon={IconHome}
      iconFilled={IconHomeFilled}
    />

    <ButtonNavigation
      href="/search"
      routeID="/(app)/search/[[q]]"
      label="Explorer"
      tooltipsOn="left"
      icon={IconSearch}
    />

    <ButtonNavigation
      href={route('/events')}
      routeID="/(app)/events/[[week=date]]"
      label="Événements"
      tooltipsOn="left"
      icon={IconEvents}
      iconFilled={IconEventsFilled}
    />

    <ButtonNavigation
      href={route('/services')}
      routeID="/(app)/services"
      label="Services"
      tooltipsOn="left"
      icon={IconServices}
      iconFilled={IconServicesFilled}
    />

    {#if $data && allLoaded($data)}
      <ButtonNavigation
        href={route('/[uid=uid]', $data.uid)}
        routeID={null}
        label="Mon profil"
        tooltipsOn="left"
        icon={IconAccount}
        iconFilled={IconAccountFilled}
      />

      <ButtonNavigation
        href={route('/settings')}
        routeID="/(app)/settings"
        label="Paramètres"
        tooltipsOn="left"
        icon={IconSettings}
        iconFilled={IconSettingsFilled}
      />
      {#if $data.admin || $data.studentAssociationAdmin}
        <ButtonNavigation
          href={route('/backrooms')}
          routeID={[
            '/(app)/backrooms',
            '/(app)/signups',
            '/(app)/quick-signups/manage',
            '/(app)/services/manage',
            '/(app)/logs',
          ]}
          label="Backrooms"
          tooltipsOn="left"
          icon={IconBackrooms}
          iconFilled={IconBackroomsFilled}
          badge={($PendingSignupsCount?.data?.userCandidatesCount ?? 0) > 0}
        />
      {/if}
    {/if}
  </div>

  <div class="bottom">
    <ButtonGhost
      danger
      on:click={() => {
        window.dispatchEvent(new CustomEvent('NAVTOP_REPORT_ISSUE'));
      }}
    >
      <IconBugReport></IconBugReport>
    </ButtonGhost>
    {#if user}
      <ButtonGhost href={route('/logout')}>
        <IconLogout></IconLogout>
      </ButtonGhost>
    {/if}
  </div>
</nav>

<style>
  nav {
    position: sticky;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 90px;
    height: 100dvh;
    padding: 1rem;
    view-transition-name: navigation-side;
  }

  nav .top {
    width: 60px;
    height: 60px;
  }

  nav .top :global(svg) {
    width: 100%;
    height: 100%;
  }

  nav > div {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    font-size: 1.75em;
  }

  nav .middle {
    gap: 1em;
  }
</style>
