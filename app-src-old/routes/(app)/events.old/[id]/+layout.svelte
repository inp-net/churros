<script lang="ts">
  import { page } from '$app/stores';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { route, type KIT_ROUTES } from '$lib/ROUTES';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ LayoutEventPage } = data);
  $: permissions = $LayoutEventPage.data?.event ?? {
    canScanBookings: false,
    canSeeAllBookings: false,
    canEdit: false,
  };

  const TABS = {
    '': 'Infos',
    'edit': 'Modifier',
    'bookings': 'Places',
    'scan': 'Vérifier',
  } as const;

  const TABS_HREFS = {
    '': '/events/[id]',
    'edit': '/events/[id]/edit',
    'bookings': '/events/[id]/bookings',
    'scan': '/events/[id]/scan',
  } satisfies Record<keyof typeof TABS, keyof KIT_ROUTES['PAGES']>;

  let tabsToShow: Record<keyof typeof TABS, boolean>;
  $: tabsToShow = {
    '': true,
    'edit': permissions.canEdit,
    'bookings': permissions.canSeeAllBookings,
    'scan': permissions.canScanBookings,
  };

  $: shownTabs = Object.entries(tabsToShow)
    .filter(([_, show]) => show)
    .map(([t]) => t) as Array<keyof typeof TABS>;

  let pathLeaf = '';
  $: pathLeaf = $page.url.pathname.replace(/\/$/, '').split('/').pop() || '';

  let currentTab: keyof typeof TABS = '';
  $: {
    currentTab = pathLeaf in TABS ? (pathLeaf as keyof typeof TABS) : '';
  }

  function tabHref(tab: keyof typeof TABS) {
    return route(TABS_HREFS[tab], $page.params.id);
  }
</script>

<section class="tabs">
  {#if shownTabs.length > 1}
    <NavigationTabs
      --text={currentTab === 'scan' ? 'white' : 'var(--text)'}
      tabs={shownTabs.map((tab) => ({
        name: TABS[tab],
        href: currentTab === tab ? '.' : tabHref(tab),
      }))}
    />
  {/if}
</section>

<div class="content">
  <slot />
</div>

<style>
  section.tabs {
    margin: 0 1.5rem;
  }

  .content {
    margin: 0 auto;
  }
</style>
