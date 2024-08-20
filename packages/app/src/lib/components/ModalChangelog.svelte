<script lang="ts" context="module">
  export const COLOR_THEME_BY_CHANGELOG_CATEGORY: Record<
    (typeof ORDER_CHANGELOG_CATEGORIES)[number],
    'danger' | 'warning' | 'success' | 'primary' | 'muted' | ''
  > = {
    added: 'success',
    fixed: 'danger',
    improved: 'warning',
    other: '',
    security: 'danger',
    technical: 'muted',
  };

  export const BULLET_EMOJI_BY_CHANGELOG_CATEGORY: Record<
    (typeof ORDER_CHANGELOG_CATEGORIES)[number],
    string
  > = {
    added: /* sparkles */ '✨',
    fixed: /* check mark */ '✅',
    improved: /* thumbs up */ '👍',
    other: /* arrow */ '➡️',
    security: /* shield */ '🛡️',
    technical: /* gear */ '⚙️',
  };

  export const CHANGELOG_MODAL_IGNORED_CATEGORIES = ['technical'];
</script>

<script lang="ts">
  import { fragment, graphql, type ModalChangelog } from '$houdini';
  import { DISPLAY_CHANGELOG_CATEGORIES, ORDER_CHANGELOG_CATEGORIES } from '$lib/display';
  import { createEventDispatcher } from 'svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import LogoChurros from './LogoChurros.svelte';
  import Modal from './ModalOrDrawer.svelte';
  import { track } from '$lib/analytics';

  const dispatch = createEventDispatcher();

  export let open: () => void;

  graphql(`
    fragment ModalChangelogChange on ReleaseChange {
      authors
      issues
      mergeRequests
      reporters
      html
    }
  `);

  graphql(`
    fragment ModalChangelogRelease on ChangelogRelease {
      version
      date
      description
      changes {
        added {
          ...ModalChangelogChange @mask_disable
        }
        fixed {
          ...ModalChangelogChange @mask_disable
        }
        improved {
          ...ModalChangelogChange @mask_disable
        }
        other {
          ...ModalChangelogChange @mask_disable
        }
        security {
          ...ModalChangelogChange @mask_disable
        }
        technical {
          ...ModalChangelogChange @mask_disable
        }
      }
    }
  `);

  export let log: ModalChangelog | null;
  $: data = fragment(
    log,
    graphql(`
      fragment ModalChangelog on QueryCombinedChangelogResult {
        ... on Error {
          message
        }

        ... on QueryCombinedChangelogSuccess {
          data {
            ...ModalChangelogRelease @mask_disable
          }
        }
      }
    `),
  );
  $: changes = $data && 'data' in $data ? $data.data : [];

  $: if (totalChangesCount(changes) > 0) open?.();

  let element: HTMLDialogElement;

  function flattenVersions(versions: typeof changes) {
    const byCategory = Object.fromEntries(
      ORDER_CHANGELOG_CATEGORIES.map((c) => [c, []]),
    ) as unknown as (typeof changes)[number]['changes'];

    for (const version of versions) {
      for (const category of ORDER_CHANGELOG_CATEGORIES) {
        if (CHANGELOG_MODAL_IGNORED_CATEGORIES.includes(category)) continue;
        byCategory[category].push(...version.changes[category]);
      }
    }

    return [...Object.entries(byCategory)] as Array<
      [(typeof ORDER_CHANGELOG_CATEGORIES)[number], (typeof changes)[number]['changes']['added']]
    >;
  }

  function totalChangesCount(versions: typeof changes) {
    return flattenVersions(versions).reduce((acc, [_, changes]) => acc + changes.length, 0);
  }

  function versionRange(versions: typeof changes): { first: string; last: string } {
    return {
      first: versions.at(-1)?.version ?? '',
      last: versions[0]?.version ?? '',
    };
  }

  async function acknowledge() {
    dispatch('acknowledge');
    track('acknowledge-changelog', versionRange(changes));

    await graphql(`
      mutation AcknowledgeChangelog($version: String!) {
        acknowledgeChangelog(version: $version)
      }
    `).mutate({
      version: versionRange(changes).last,
    });
  }
</script>

<Modal notrigger bind:open on:close-by-outside-click={acknowledge}>
  {@const { first, last } = versionRange(changes)}
  <section class="centered">
    <LogoChurros wordmark />
    <h1>Quoi de neuf?</h1>
    <p class="muted">
      {#if first === last}
        Version <strong>{first}</strong>
      {:else}
        Versions <strong>{first}</strong> à <strong>{last}</strong>
      {/if}
    </p>
  </section>
  {#each flattenVersions(changes) as [category, changesOfCategory]}
    {#if changesOfCategory.length > 0}
      <h2 class={COLOR_THEME_BY_CHANGELOG_CATEGORY[category]}>
        {DISPLAY_CHANGELOG_CATEGORIES.get(category)}
      </h2>
      <ul style:list-style-type="'{BULLET_EMOJI_BY_CHANGELOG_CATEGORY[category]} '">
        {#each changesOfCategory as change}
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
  .centered {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    align-items: center;
    justify-content: center;
    padding: 3rem;
  }

  .centered :global(svg) {
    width: 100%;
    max-width: 300px;
    margin-bottom: 1em;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
  }

  h2 {
    margin: 2rem 0 1rem;
    line-height: 0.7;
  }

  h2::after {
    display: inline-block;
    width: 100%;
    height: 0.2em;
    content: '';
    background: currentcolor;
    border-radius: var(--radius-block);
  }

  li::marker {
    display: inline-block;
    padding-right: 0.5em;
    font-size: 1.2rem;
    scale: 150%;
  }

  ul {
    padding-left: 2ch;
  }
</style>
