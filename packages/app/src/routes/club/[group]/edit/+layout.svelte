<script lang="ts">
  import { page } from '$app/stores';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { me } from '$lib/session';
  import type { PageData } from './$types';

  const TABS = {
    '': 'Infos',
    members: 'Membres',
    'bank-accounts': 'Bancaire',
  } as const;

  export let data: PageData;

  $: ({ group } = data);

  $: pathLeaf = $page.url.pathname.replace(/\/$/, '').split('/').pop() || '';

  $: currentTab = pathLeaf in TABS ? (pathLeaf as keyof typeof TABS) : '';

  const askeyofTABS = (x: unknown) => x as keyof typeof TABS;
</script>

<div class="content">
  <h1><ButtonBack go={currentTab === '' ? '..' : '../..'} /> Éditer {group.name}</h1>

  {#if $me?.admin || $me?.canEditGroups || $me?.groups.some(({ group: { uid }, president, treasurer, vicePresident, secretary, canEditMembers }) => uid === group.uid && (president || vicePresident || secretary || treasurer || canEditMembers))}
    <NavigationTabs
      tabs={['', 'members', 'bank-accounts'].map((tab) => ({
        name: TABS[askeyofTABS(tab)],
        href: currentTab === tab ? '.' : currentTab === '' ? `./${tab}` : `../${tab}`,
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
    max-width: 1000px;
    padding: 0 1rem;
    margin: 0 auto;
  }
</style>
