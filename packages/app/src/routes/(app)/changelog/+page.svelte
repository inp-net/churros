<script lang="ts">
  import { formatDate } from '$lib/dates';
  import { DISPLAY_CHANGELOG_CATEGORIES, ORDER_CHANGELOG_CATEGORIES } from '$lib/display';
  import {
    COLOR_THEME_BY_CHANGELOG_CATEGORY,
    BULLET_EMOJI_BY_CHANGELOG_CATEGORY,
  } from '$lib/components/ModalChangelog.svelte';
  import type { PageData } from './$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import { me } from '$lib/session';

  export let data: PageData;
  $: ({ PageChangelog } = data);
  $: upcomingChangelog =
    $PageChangelog.data?.upcomingChangelog && 'data' in $PageChangelog.data.upcomingChangelog
      ? $PageChangelog.data.upcomingChangelog.data
      : undefined;
  $: combinedChangelog =
    $PageChangelog.data?.combinedChangelog && 'data' in $PageChangelog.data.combinedChangelog
      ? $PageChangelog.data.combinedChangelog.data
      : [];

  type Category = (typeof ORDER_CHANGELOG_CATEGORIES)[number];

  function changesByCategory(
    version: Omit<(typeof combinedChangelog)[number], 'description'>,
  ): Array<[Category, (typeof combinedChangelog)[number]['changes'][Category]]> {
    const isDev = $me?.groups.some((g) => g.group.uid === 'devs');
    // @ts-expect-error classic case of Object.entries being too dumb. using a "as" cast causes a syntax error for the Svelte parser for some reason
    return Object.entries(version.changes)
      .map(([category, changes]) => [category, category !== 'technical' || isDev ? changes : []])
      .filter(([_, changes]) => changes.length > 0);
  }
</script>

<main>
  <h1>Changelog</h1>

  {#if upcomingChangelog && changesByCategory(upcomingChangelog).length > 0}
    <Alert theme="default">
      <details>
        <summary> Prochainement </summary>
        {#each changesByCategory(upcomingChangelog) as [category, changes]}
          <h3 class={COLOR_THEME_BY_CHANGELOG_CATEGORY[category]}>
            {DISPLAY_CHANGELOG_CATEGORIES.get(category)}
          </h3>
          <ul style:list-style-type="'{BULLET_EMOJI_BY_CHANGELOG_CATEGORY[category]} '">
            {#each changes as change}
              <li>
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html change.html}
                {#if change.issues.length > 0}
                  ({#each change.issues as issue}
                    <a href="https://git.inpt.fr/inp-net/churros/-/issues/{issue}">#{issue}</a>
                  {/each})
                {/if}
              </li>
            {/each}
          </ul>
        {/each}
      </details>
    </Alert>
  {/if}

  {#each combinedChangelog as version}
    <h2 id="v{version.version}">
      Version {version.version}
      {#if version.date}
        <span class="date">{formatDate(version.date)}</span>
      {/if}
    </h2>
    <section class="description data-user-html">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html version.description}
    </section>
    {#each changesByCategory(version) as [category, changes]}
      <h3 class={COLOR_THEME_BY_CHANGELOG_CATEGORY[category]}>
        {DISPLAY_CHANGELOG_CATEGORIES.get(category)}
      </h3>
      <ul style:list-style-type="'{BULLET_EMOJI_BY_CHANGELOG_CATEGORY[category]} '">
        {#each changes as change}
          <li>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html change.html}
            {#if change.issues.length > 0}
              ({#each change.issues as issue}
                <a href="https://git.inpt.fr/inp-net/churros/-/issues/{issue}">#{issue}</a>
              {/each})
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      {#if !version.description}
        <p class="muted">
          Pas grand chose d'intéréssant pour cette version… <a
            href="https://git.inpt.fr/inp-net/churros/-/tags/v{version.version}"
            >Détails techniques</a
          >
        </p>
      {/if}
    {/each}
  {/each}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    text-align: center;
  }

  details[open] summary ~ * {
    animation: sweep 0.25s ease-in-out;
  }

  @keyframes sweep {
    0% {
      margin-left: -10px;
      opacity: 0;
    }

    100% {
      margin-left: 0;
      opacity: 1;
    }
  }

  h2 {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
    align-items: center;
    margin-top: 3rem;
  }

  .date {
    font-size: 1rem;
    font-weight: normal;
  }

  h3 {
    margin: 1rem 0 0.5rem;
    line-height: 0.7;
    color: var(--link);
  }

  h3::after {
    display: inline-block;
    width: 100%;
    height: 0.2em;
    content: '';
    background: var(--link);
    border-radius: var(--radius-block);
  }

  ul {
    padding-left: 2ch;
  }
</style>
