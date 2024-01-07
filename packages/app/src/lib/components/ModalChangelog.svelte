<script lang="ts">
  import Modal from './Modal.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import { DISPLAY_CHANGELOG_CATEGORIES, ORDER_CHANGELOG_CATEGORIES } from '$lib/display';
  import { zeus } from '$lib/zeus';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let open: boolean;
  export let log: Array<{
    date?: Date | undefined;
    version: string;
    changes: Record<
      (typeof ORDER_CHANGELOG_CATEGORIES)[number],
      Array<{
        html: string;
        issues: number[];
      }>
    >;
  }>;
  let element: HTMLDialogElement;

  function flattenVersions(versions: typeof log) {
    const byCategory = Object.fromEntries(
      ORDER_CHANGELOG_CATEGORIES.map((c) => [c, []]),
    ) as unknown as (typeof log)[number]['changes'];

    for (const version of versions) {
      for (const category of ORDER_CHANGELOG_CATEGORIES) {
        byCategory[category].push(...version.changes[category]);
      }
    }

    return [...Object.entries(byCategory)] as Array<
      [(typeof ORDER_CHANGELOG_CATEGORIES)[number], (typeof log)[number]['changes']['added']]
    >;
  }

  function versionRange(versions: typeof log): { first: string; last: string } {
    return {
      first: versions[versions.length - 1].version,
      last: versions[0].version,
    };
  }

  function acknowledge() {
    dispatch('acknowledge');
    void $zeus.mutate({
      acknowledgeChangelog: [
        {
          version: versionRange(log).last,
        },
        true,
      ],
    });
  }
</script>

<Modal {open} maxWidth="800px" bind:element on:close-by-outside-click={acknowledge}>
  {@const { first, last } = versionRange(log)}
  <p class="muted">
    {#if first === last}
      Version <strong>{first}</strong>
    {:else}
      Versions <strong>{first}</strong> à <strong>{last}</strong>
    {/if}
  </p>
  {#each flattenVersions(log) as [category, changes]}
    {#if changes.length > 0}
      <h2>{DISPLAY_CHANGELOG_CATEGORIES.get(category)}</h2>
      <ul>
        {#each changes as change}
          <li>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html change.html}
            {#if change.issues.length > 0}
              ({#each change.issues as issue}
                <a href="/reports/{issue}">#{issue}</a>
              {/each})
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  {/each}

  <section class="actions">
    <ButtonSecondary
      on:click={() => {
        element.close();
        acknowledge();
      }}>Fermer</ButtonSecondary
    >
  </section>
</Modal>

<style>
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }

  h2 {
    margin: 1rem 0;
  }
</style>
