<script lang="ts">
  import { page } from '$app/stores';
  import { AddGroupMemberStore } from '$houdini';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import PickGroup from '$lib/components/PickGroup.svelte';
  import { mutateAndToast } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import type { PageData } from './$houdini';
  import Header from './Header.svelte';
  import { writable } from 'svelte/store';

  export let data: PageData;

  let { LayoutProfile } = data;

  // We handle $LayoutProfile data manually because of a weird Houdini bug
  // that causes `AbortError`s otherwise.
  // Probably due to high parallelism that overwhelms Houdini's store update handling
  // Found by @pisentt, July 2025
  const me = writable($LayoutProfile.data?.me);
  const profile = writable($LayoutProfile.data?.profile);
  $: unsubscribeFromData = data.LayoutProfile.subscribe(({ data }) => {
    if (!data) return;

    unsubscribeFromData?.();
    $profile = data.profile;
    $me = data.me;
  });
</script>

{#if $me}
  <PickGroup
    title="Ajouter à"
    value={null}
    statebound="NAVTOP_CREATING_GROUP_MEMBER"
    options={$me.canAddMembersTo}
    on:finish={async ({ detail }) => {
      await mutateAndToast(
        new AddGroupMemberStore(),
        {
          group: detail,
          user: $page.params.uid,
        },
        {
          success: `${$page.params.uid} ajouté à ${detail}`,
          error: `Impossible d'ajouter ${$page.params.uid} à ${detail}`,
        },
      );
    }}
  ></PickGroup>
{/if}

<div class="contents">
  <Header me={$me} profile={$profile} />

  <div class="tabs">
    {#if $profile.__typename === 'Group'}
      <NavigationTabs
        tabs={[
          {
            name: 'Membres',
            href: route('/[uid=uid]', $page.params.uid, {
              tab: 'members',
            }),
          },
          {
            name: 'Infos',
            href: route('/[uid=uid]', $page.params.uid, {
              tab: 'infos',
            }),
          },
          {
            name: 'Voir aussi',
            href: route('/[uid=uid]', $page.params.uid, {
              tab: 'see-also',
            }),
          },
        ]}
      />
    {:else if $profile.__typename === 'User'}
      <NavigationTabs
        tabs={[
          {
            name: 'Groupes',
            href: route('/[uid=uid]', $page.params.uid, {
              tab: 'groups',
            }),
          },
          {
            name: 'Infos',
            href: route('/[uid=uid]', $page.params.uid, {
              tab: 'infos',
            }),
          },
          {
            name: 'Famille',
            href: route('/[uid=uid]', $page.params.uid, {
              tab: 'family',
            }),
          },
        ]}
      />
    {:else if $profile.__typename === 'StudentAssociation'}
      <NavigationTabs
        tabs={[
          {
            name: 'Bureaux',
            href: route('/[uid=uid]', $page.params.uid, {
              tab: 'boards',
            }),
          },
          {
            name: 'Clubs & Assos',
            href: route('/[uid=uid]', $page.params.uid, {
              tab: 'groups',
            }),
          },
          {
            name: 'Services',
            href: route('/[uid=uid]', $page.params.uid, {
              tab: 'services',
            }),
          },
        ]}
      />
    {:else if $profile.__typename === 'School'}
      <NavigationTabs
        tabs={[
          {
            name: 'Infos',
            href: route('/[uid=uid]', $page.params.uid, {
              tab: 'infos',
            }),
          },
          {
            name: 'Filières',
            href: route('/[uid=uid]', $page.params.uid, {
              tab: 'majors',
            }),
          },
          {
            name: 'Services',
            href: route('/[uid=uid]', $page.params.uid, {
              tab: 'services',
            }),
          },
        ]}
      />
    {:else if $profile.__typename === 'Major'}
      <NavigationTabs
        tabs={[
          {
            name: 'Infos',
            href: route('/[uid=uid]', $page.params.uid, {
              tab: 'infos',
            }),
          },
          {
            name: 'Matières',
            href: route('/[uid=uid]', $page.params.uid, {
              tab: 'subjects',
            }),
          },
        ]}
      />
    {/if}
  </div>

  <slot />
</div>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 0 1rem;
  }

  .tabs {
    flex-grow: 1;
  }
</style>
