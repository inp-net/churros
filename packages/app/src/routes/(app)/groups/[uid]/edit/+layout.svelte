<script lang="ts">
  import { page } from '$app/stores';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { isOnClubBoard } from '$lib/permissions';
  import { me } from '$lib/session';
  import type { PageData } from './$types';

  const TABS = {
    '': 'Infos',
    'members': 'Membres',
    'bank-accounts': 'Bancaire',
    'pages': 'Pages',
  } as const;

  export let data: PageData;

  $: ({ group } = data);

  $: pathLeaf =
    $page.route.id
      ?.replace(/\/$/, '')
      .split('/')
      .filter((p) => !p.includes('['))
      .pop() || '';

  $: currentTab = pathLeaf in TABS ? (pathLeaf as keyof typeof TABS) : '';

  const askeyofTABS = (x: unknown) => x as keyof typeof TABS;
</script>

<div class="content">
  <h1><ButtonBack go={currentTab === '' ? '..' : '../..'} /> Éditer {group.name}</h1>

  {#if $me?.admin || data.canEditGroup || $me?.groups.some(({ group: { uid }, canEditMembers, ...perms }) => uid === group.uid && (isOnClubBoard(perms) || canEditMembers))}
    <NavigationTabs
      tabs={['', 'members', 'pages', 'bank-accounts']
        .filter((tab) => (tab === 'pages' ? data.group.canListPages : true))
        .map((tab) => ({
          name: TABS[askeyofTABS(tab)],
          href: `/groups/${group.uid}/edit/${tab}`,
          active: currentTab === tab,
        }))}
    />
  {/if}

  <slot />
</div>

<style>
  h1 {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .content {
    width: 100%;
    max-width: 1000px;
    padding: 0 1rem;
    margin: 0 auto;
  }
</style>
