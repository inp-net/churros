<script lang="ts">
  import { page } from '$app/stores';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import type { PageData } from './$types';

  $: ({ group, uid } = $page.params);

  export let data: PageData;
  $: ({ ...permissions } = data.event);

  const TABS = {
    '': 'Infos',
    'registrations': 'Places',
    'scan': 'Vérifier',
  } as const;

  let tabsToShow: Record<keyof typeof TABS, boolean>;
  $: tabsToShow = {
    '': true,
    'registrations': permissions.canSeeBookings,
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

  const tabHref = (tab: string) => `/events/${group}/${uid}/${tab}`;
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

<slot />

<style>
  section.tabs {
    margin: 0 1.5rem;
  }
</style>
