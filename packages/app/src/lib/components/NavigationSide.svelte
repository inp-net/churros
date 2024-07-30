<script lang="ts">
  import { page } from '$app/stores';
  import { type NavigationSide, fragment } from '$houdini';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonNavigation from '$lib/components/ButtonNavigation.svelte';
  import ChurrosLogo from '$lib/components/LogoChurros.svelte';
  import ModalReportIssue from '$lib/components/ModalReportIssue.svelte';
  import { allLoaded } from '$lib/loading';
  import { route } from '$lib/ROUTES';
  import { graphql } from 'graphql';
  import IconAccountFilled from '~icons/msl/account-circle';
  import IconAccount from '~icons/msl/account-circle-outline';
  import IconBugReport from '~icons/msl/bug-report-outline';
  import IconEvents from '~icons/msl/calendar-today-outline';
  import IconEventsFilled from '~icons/msl/event';
  import IconHomeFilled from '~icons/msl/home';
  import IconHome from '~icons/msl/home-outline';
  import IconLogout from '~icons/msl/logout';
  import IconSearch from '~icons/msl/search';
  import IconSettingsFilled from '~icons/msl/settings';
  import IconSettings from '~icons/msl/settings-outline';
  import IconServicesFilled from '~icons/msl/view-comfy-alt';
  import IconServices from '~icons/msl/view-comfy-alt-outline';

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

  let reportIssueDialogElement: HTMLDialogElement;
</script>

<ModalReportIssue bind:element={reportIssueDialogElement} />

<nav>
  <div class="top">
    <a href="/">
      <ChurrosLogo />
    </a>
  </div>
  <div class="middle">
    <ButtonNavigation
      href="/"
      routeID="/(app)"
      label="Accueil"
      icon={IconHome}
      iconFilled={IconHomeFilled}
    />

    <ButtonNavigation
      href="/search"
      routeID="/(app)/search/[[q]]"
      label="Explorer"
      icon={IconSearch}
    />

    <ButtonNavigation
      href={route('/events')}
      routeID="/(app)/events/[[week=date]]"
      label="Événements"
      icon={IconEvents}
      iconFilled={IconEventsFilled}
    />

    <ButtonNavigation
      href={route('/services')}
      routeID="/(app)/services"
      label="Services"
      icon={IconServices}
      iconFilled={IconServicesFilled}
    />

    {#if $data && allLoaded($data)}
      <ButtonNavigation
        href={route('/users/[uid]', $data?.uid)}
        routeID="/(app)/users/[uid]"
        label="Mon profil"
        icon={IconAccount}
        iconFilled={IconAccountFilled}
      />

      <ButtonNavigation
        href={route('/users/[uid]/edit', $data?.uid)}
        routeID="/(app)/users/[uid]/edit"
        label="Paramètres"
        icon={IconSettings}
        iconFilled={IconSettingsFilled}
      />
    {/if}
  </div>

  <div class="bottom">
    <ButtonGhost danger on:click={() => reportIssueDialogElement.showModal()}>
      <IconBugReport></IconBugReport>
    </ButtonGhost>
    {#if $page.data.token}
      <ButtonGhost href="{route('GET /logout')}?token={encodeURIComponent($page.data.token)}">
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
