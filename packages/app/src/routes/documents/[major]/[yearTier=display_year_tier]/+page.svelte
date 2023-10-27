<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import IconLink from '~icons/mdi/link';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import CardSubject from '$lib/components/CardSubject.svelte';
  import { me } from '$lib/session';
  import type { PageData } from './$types';
  import groupBy from 'lodash.groupby';
  import WipMigrationNotice from '../WIPMigrationNotice.svelte';

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

  $: displayPreferredMinor =
    minors.length > 1 && $me?.minor && minors.some((m) => m.uid === $me?.minor?.uid);

  // eslint-disable-next-line no-console
  $: console.log($me?.major);
</script>

<Breadcrumbs root="/documents">
  <Breadcrumb href="..">{data.major.shortName}</Breadcrumb>
  <Breadcrumb>{$page.params.yearTier.toUpperCase().replaceAll('-', ' ')}</Breadcrumb>
</Breadcrumbs>

<WipMigrationNotice></WipMigrationNotice>

{#if displayPreferredMinor && $me?.minor}
  <div class="minor-anchor" id={$me.minor.uid}></div>
  <h2>
    {$me.minor.name}
    <a href="#{$me.minor.uid}" class="jump-to-anchor"><IconLink></IconLink></a>
  </h2>
  <ul class="nobullet">
    {#each subjectsOfMinorByUnit($me.minor) as [unitShortName, subjects] (unitShortName)}
      {@const { unit } = subjects[0]}
      {#if unit}
        <h3 class="typo-field-label">{unit.shortName || unit.name}</h3>
      {/if}
      {#each subjects as subject (subject.uid)}
        <li>
          <CardSubject href="./{subject.uid}" {...subject} unit={undefined}></CardSubject>
        </li>
      {/each}
    {:else}
      <li class="empty muted">Aucune matière dans ta filière??? Contactes net7.</li>
    {/each}
  </ul>
  <hr />
{:else if (!$me?.minor || $me?.major.uid !== data.major.uid) && browser && localStorage.getItem('ignoreDefineYourMinor') !== 'true'}
  <div class="define-your-minor">
    <p class="muted">
      Marre de scroll pour avoir son parcours? Définis ton parcours dans <a href="/me"
        >ton&nbsp;profil</a
      >
    </p>
    <ButtonSecondary
      on:click={() => {
        localStorage.setItem('ignoreDefineYourMinor', 'true');
      }}>Ignorer</ButtonSecondary
    >
  </div>
  <hr />
{/if}

{#if subjectsOfMinor(undefined).length > 0}
  <ul class="nobullet minorless-subjects">
    {#each subjectsOfMinorByUnit(undefined) as [unitShortName, subjectsOfUnit] (unitShortName)}
      {@const { unit } = subjectsOfUnit[0]}
      {#if unit}
        <h3 class="typo-field-label">{unit.shortName || unit.name}</h3>
      {/if}
      {#each subjectsOfUnit as subject (subject.id)}
        <li>
          <CardSubject href="./{subject.uid}" {...subject} unit={undefined}></CardSubject>
        </li>
      {/each}
    {/each}
  </ul>
{/if}

{#each minors.filter((m) => m.uid !== $me?.minor?.uid) as minor}
  {#if minors.length > 1}
    <div class="minor-anchor" id={minor.uid}></div>
    <h2>{minor.name} <a href="#{minor.uid}" class="jump-to-anchor"><IconLink></IconLink></a></h2>
  {/if}

  <ul class="nobullet">
    {#each subjectsOfMinorByUnit(minor) as [unitShortName, subjectsOfUnit] (unitShortName)}
      {@const { unit } = subjectsOfUnit[0]}
      {#if unit}
        <h3 class="typo-field-label">{unit.shortName || unit.name}</h3>
      {/if}
      {#each subjectsOfUnit as subject (subject.id)}
        <li>
          <CardSubject href="./{subject.uid}" {...subject} unit={undefined}></CardSubject>
        </li>
      {/each}
    {/each}
  </ul>
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

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .define-your-minor {
    width: 100%;
    padding: 1rem;
    margin-top: 2rem;
    text-align: center;
    border: var(--border-block) dashed var(--border);
    border-radius: var(--radius-block);

    p {
      margin-bottom: 0.5rem;
    }
  }

  .minorless-subjects {
    margin-top: 2rem;
  }

  .minor-anchor {
    position: relative;
    top: -120px;
    display: block;
    visibility: hidden;
  }

  hr {
    margin: 3rem auto;
  }
</style>
