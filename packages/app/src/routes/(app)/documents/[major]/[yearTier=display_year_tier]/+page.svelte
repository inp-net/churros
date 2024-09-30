<script lang="ts">
  import { page } from '$app/stores';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import groupBy from 'lodash.groupby';
  import IconLink from '~icons/mdi/link';
  import WipMigrationNotice from '../WIPMigrationNotice.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  const minors = Object.values(
    Object.fromEntries(data.subjectsOfMajor.flatMap(({ minors }) => minors).map((m) => [m.uid, m])),
  );

  function subjectsOfMinor(minor: undefined | { uid: string }) {
    return data.subjectsOfMajor
      .filter(({ minors }) =>
        minor === undefined ? minors.length === 0 : minors.some((m) => m.uid === minor.uid),
      )
      .sort(
        (a, b) =>
          (a.semester ?? 0) - (b.semester ?? 0) ||
          a.unit?.name?.localeCompare(b.unit?.name ?? '') ||
          a.name.localeCompare(b.name),
      );
  }

  function subjectsOfMinorByUnit(minor: undefined | { uid: string }) {
    return Object.entries(
      groupBy(subjectsOfMinor(minor), (s) => s.unit?.shortName || s.unit?.name || 'Sans UE'),
    );
  }

  // TODO
  // $: displayPreferredMinor = minors.length > 1 && $me?.minor && minors.some((m) => m.uid === $me?.minor?.uid);
</script>

<Breadcrumbs root="/documents">
  <Breadcrumb href="..">{data.major.shortName}</Breadcrumb>
  <Breadcrumb>{$page.params.yearTier.toUpperCase().replaceAll('-', ' ')}</Breadcrumb>
</Breadcrumbs>

<WipMigrationNotice></WipMigrationNotice>

{#if subjectsOfMinor(undefined).length > 0}
  {#each subjectsOfMinorByUnit(undefined) as [unitShortName, subjectsOfUnit] (unitShortName)}
    {@const { unit } = subjectsOfUnit[0]}
    {#if unit}
      <h3 class="typo-field-label">{unit.shortName || unit.name}</h3>
    {/if}
    <Submenu>
      {#each subjectsOfUnit as subject (subject.id)}
        <SubmenuItem href="./{subject.uid}" icon={null}>
          {subject.name}
        </SubmenuItem>
      {/each}
    </Submenu>
  {/each}
{/if}

<!-- {#each minors.filter((m) => m.uid !== $me?.minor?.uid) as minor} -->
{#each minors as minor}
  {#if minors.length > 1}
    <div class="minor-anchor" id={minor.uid}></div>
    <h2>{minor.name} <a href="#{minor.uid}" class="jump-to-anchor"><IconLink></IconLink></a></h2>
  {/if}

  {#each subjectsOfMinorByUnit(minor) as [unitShortName, subjectsOfUnit] (unitShortName)}
    {@const { unit } = subjectsOfUnit[0]}
    {#if unit}
      <h3 class="typo-field-label">{unit.shortName || unit.name}</h3>
    {/if}
    <Submenu>
      {#each subjectsOfUnit as subject (subject.id)}
        <SubmenuItem href="./{subject.uid}" icon={null}>
          {subject.name}
        </SubmenuItem>
      {/each}
    </Submenu>
  {/each}
{/each}

<style lang="scss">
  h2:not(.migration-notice) {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    margin-top: 2.5rem;
    margin-bottom: 0.5rem;

    * {
      flex-shrink: 0;
    }
  }

  h3 {
    margin-top: 1rem;
  }

  .minor-anchor {
    position: relative;
    top: 0;
    display: block;
    visibility: hidden;
  }
</style>
