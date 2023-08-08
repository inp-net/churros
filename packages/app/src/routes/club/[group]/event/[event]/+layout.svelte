<script lang="ts">
  import { page } from '$app/stores';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { me } from '$lib/session';
  import type { PageData } from './$types';

  $: ({ group, event } = $page.params);

  export let data: PageData;
  const TABS = {
    '': 'Infos',
    edit: 'Modifier',
    registrations: 'Places',
    scan: 'Vérifier',
  } as const;

  function manager():
    | undefined
    | { canEdit: boolean; canEditPermissions: boolean; canVerifyRegistrations: boolean } {
    return $me?.managedEvents.find((m) => m.event.id === data.event.id);
  }

  const shownTabs = ['', 'edit', 'registrations', 'scan'].filter((tab) => {
    switch (tab) {
      case '': {
        return true;
      }

      case 'edit': {
        return Boolean($me?.admin || manager()?.canEdit || manager()?.canEditPermissions);
      }

      case 'scan': {
        return Boolean($me?.admin || manager()?.canVerifyRegistrations);
      }

      case 'registrations': {
        return Boolean($me?.admin || manager());
      }

      default: {
        return false;
      }
    }
  }) as Array<keyof typeof TABS>;

  let pathLeaf = '';
  $: pathLeaf = $page.url.pathname.replace(/\/$/, '').split('/').pop() || '';

  let currentTab: keyof typeof TABS = '';
  $: {
    currentTab = pathLeaf in TABS ? (pathLeaf as keyof typeof TABS) : '';
  }

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const tabHref = (tab: string) => `/club/${group}/event/${event}/${tab}`;
</script>

{#if shownTabs.length > 1}
  <NavigationTabs
    --text={currentTab === 'scan' ? 'white' : 'var(--text)'}
    tabs={shownTabs.map((tab) => ({
      name: TABS[tab],
      href: currentTab === tab ? '.' : tabHref(tab),
    }))}
  />
{/if}

<slot />
