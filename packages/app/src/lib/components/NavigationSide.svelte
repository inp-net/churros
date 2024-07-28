<script lang="ts">
  import { page } from '$app/stores';
  import { type NavigationSide, fragment } from '$houdini';
  import type { LayoutRouteId } from '$houdini/types/src/routes/(app)/$houdini';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ChurrosLogo from '$lib/components/LogoChurros.svelte';
  import ModalReportIssue from '$lib/components/ModalReportIssue.svelte';
  import { allLoaded } from '$lib/loading';
  import { route } from '$lib/ROUTES';
  import { tooltip } from '$lib/tooltip';
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

  $: isCurrent = (route: LayoutRouteId) => $page.route.id === route;

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
    <a
      href="/"
      class:current={isCurrent('/(app)')}
      use:tooltip={{ content: 'Accueil', placement: 'left' }}
    >
      {#if isCurrent('/(app)')}
        <IconHomeFilled />
      {:else}
        <IconHome />
      {/if}
    </a>
    <a
      href={route('/search')}
      class:current={isCurrent('/(app)/search/[[q]]')}
      use:tooltip={{ content: 'Explorer', placement: 'left' }}
    >
      <IconSearch></IconSearch>
    </a>
    <a
      href={route('/events')}
      class:current={isCurrent('/(app)/events/[[week=date]]')}
      use:tooltip={{ content: 'Événements', placement: 'left' }}
    >
      {#if isCurrent('/(app)/events/[[week=date]]')}
        <IconEventsFilled />
      {:else}
        <IconEvents />
      {/if}
    </a>
    <a
      href={route('/services')}
      class:current={isCurrent('/(app)/services')}
      use:tooltip={{ content: 'Services', placement: 'left' }}
    >
      {#if isCurrent('/(app)/services')}
        <IconServicesFilled />
      {:else}
        <IconServices />
      {/if}
    </a>
    {#if $data && allLoaded($data)}
      <a
        href={route('/users/[uid]', $data?.uid)}
        class:current={isCurrent('/(app)/users/[uid]')}
        use:tooltip={{ content: 'Mon profil', placement: 'left' }}
      >
        {#if isCurrent('/(app)/users/[uid]')}
          <IconAccountFilled />
        {:else}
          <IconAccount />
        {/if}
      </a>
      <a
        href={route('/users/[uid]/edit', $data?.uid)}
        use:tooltip={{ content: 'Paramètres', placement: 'left' }}
      >
        {#if isCurrent('/(app)/users/[uid]/edit')}
          <IconSettingsFilled />
        {:else}
          <IconSettings />
        {/if}
      </a>
    {/if}
  </div>

  <div class="bottom">
    <ButtonGhost danger on:click={() => reportIssueDialogElement.showModal()}>
      <IconBugReport></IconBugReport>
    </ButtonGhost>
    <ButtonGhost href={route('GET /logout')}>
      <IconLogout></IconLogout>
    </ButtonGhost>
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
</style>
