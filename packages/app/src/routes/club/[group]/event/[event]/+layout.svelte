<script lang="ts">
  import { page } from '$app/stores';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';

  const TABS = {
    '': 'Infos',
    edit: 'Modifier',
    registrations: 'Places',
    scan: 'Vérifier',
  } as const;

  const TABS_ORDER: Array<keyof typeof TABS> = ['', 'edit', 'registrations', 'scan'];

  let pathLeaf = '';
  $: pathLeaf = $page.url.pathname.replace(/\/$/, '').split('/').pop() || '';

  let currentTab: keyof typeof TABS = '';
  $: {
    currentTab = pathLeaf in TABS ? (pathLeaf as keyof typeof TABS) : '';
  }
</script>

<NavigationTabs
  tabs={TABS_ORDER.map((tab) => ({
    name: TABS[tab],
    href: currentTab === tab ? '.' : currentTab === '' ? `./${tab}` : `../${tab}`,
  }))}
/>

<slot />
