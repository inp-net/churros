<script lang="ts">
  import { formatDate } from '$lib/dates';
  import { DISPLAY_CHANGELOG_CATEGORIES, ORDER_CHANGELOG_CATEGORIES } from '$lib/display';
  import type { PageData } from './$types';

  export let data: PageData;

  function changesByCategory(version: (typeof data.combinedChangelog)[number]) {
    type Key = (typeof ORDER_CHANGELOG_CATEGORIES)[number];

    return [...Object.entries(version.changes)] as Array<[Key, (typeof version.changes)[Key]]>;
  }
</script>

<main>
  <h1>Changelog</h1>

  {#each data.combinedChangelog as version}
    <h2 id="v{version.version}">Version {version.version}</h2>
    {#if version.date}
      <p class="date">{formatDate(version.date)}</p>
    {/if}
    {#each changesByCategory(version) as [category, changes]}
      {#if changes.length > 0}
        <h3>{DISPLAY_CHANGELOG_CATEGORIES.get(category)}</h3>
        <ul>
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
      {/if}
    {/each}
  {/each}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    max-width: 1000px;
    margin: 0 auto;
  }

  h1 {
    text-align: center;
  }

  h2 {
    margin-top: 3rem;
  }

  h3 {
    margin: 1rem 0 0.5rem;
  }
</style>
