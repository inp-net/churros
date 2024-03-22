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
  import Modal from './Modal.svelte';
  import LogoChurros from './LogoChurros.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import { DISPLAY_CHANGELOG_CATEGORIES, ORDER_CHANGELOG_CATEGORIES } from '$lib/display';
  import { zeus } from '$lib/zeus';
  import { createEventDispatcher } from 'svelte';
  import { toasts } from '$lib/toasts';
  import { fragment, graphql, type ModalChangelog } from '$houdini';

  const dispatch = createEventDispatcher();

  export let open: boolean;
  export let changelog: ModalChangelog;
  $: Log = fragment(
    changelog,
    graphql`
      fragment ModalChangelog on ChangelogCombinedReleases {
        versions
        changes {
          added {
            html
            issues
          }
          fixed {
            html
            issues
          }
          improved {
            html
            issues
          }
          other {
            html
            issues
          }
          security {
            html
            issues
          }
          technical {
            html
            issues
          }
        }
      }
    `,
  );

  type ChangeCategory = keyof typeof log.changes;

  $: log = $Log;
  $: changesByCategory = Object.entries(log.changes) as Array<
    [ChangeCategory, (typeof log.changes)[ChangeCategory]]
  >;

  let element: HTMLDialogElement;

  function totalChangesCount(changes: typeof log.changes) {
    return Object.values(changes)
      .map((c) => c.length)
      .reduce((a, b) => a + b, 0);
  }

  function versionRange(versions: string[]): { first: string; last: string } {
    return {
      first: versions.at(-1) ?? '',
      last: versions[0] ?? '',
    };
  }

  async function acknowledge() {
    dispatch('acknowledge');
    window.umami.track('acknowledge-changelog', { versionRange: versionRange(log.versions) });
    const {
      me: { latestVersionSeenInChangelog },
    } = await $zeus.query({
      me: {
        latestVersionSeenInChangelog: true,
      },
    });
    if (latestVersionSeenInChangelog === '0.0.0')
      toasts.info("Tu peux toujours consulter les mises à jour dans 'les autres services' ;)");

    await $zeus.mutate({
      acknowledgeChangelog: [
        {
          version: versionRange(log.versions).last,
        },
        true,
      ],
    });
  }
</script>

<Modal
  open={open && totalChangesCount(log.changes) > 0}
  maxWidth="800px"
  bind:element
  on:close-by-outside-click={acknowledge}
>
  {@const { first, last } = versionRange(log.versions)}
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
  {#each changesByCategory as [category, changes]}
    {#if changes.length > 0}
      <h2 class={COLOR_THEME_BY_CHANGELOG_CATEGORY[category]}>
        {DISPLAY_CHANGELOG_CATEGORIES.get(category)}
      </h2>
      <ul style:list-style-type="'{BULLET_EMOJI_BY_CHANGELOG_CATEGORY[category]} '">
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
    color: var(--link);
  }

  h2::after {
    display: inline-block;
    width: 100%;
    height: 0.2em;
    content: '';
    background: var(--link);
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
