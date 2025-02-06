<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql, PendingValue } from '$houdini';
  import AvatarMajor from '$lib/components/AvatarMajor.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import Split from '$lib/components/Split.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { formatDateRelativeSmart } from '$lib/dates';
  import { countThing } from '$lib/i18n';
  import { loaded, loading, LoadingText, mapAllLoading } from '$lib/loading';
  import { isMobile } from '$lib/mobile';
  import { route } from '$lib/ROUTES';
  import { infinitescroll } from '$lib/scroll';
  import { fade } from 'svelte/transition';
  import IconDetails from '~icons/msl/chevron-right';
  import type { PageData } from './$houdini';
  import ModalRefuseReason from './ModalRefuseReason.svelte';
  import { decide, decided, decidingOn, IconAccept, IconRefuse, reloadCandidates } from './shared';

  export let data: PageData;
  $: ({ LayoutManageSignups } = data);

  const mobile = isMobile();

  let openRefusalReason: () => void;

  graphql(`
    fragment LayoutManageSignups_UserCandidate on UserCandidate {
      id
      fullName
      email
      createdAt
      major {
        ...AvatarMajor
      }
    }
  `);

  let refusing: {
    email: string;
    why: string;
  } = {
    email: '',
    why: '',
  };

  $: if (
    $LayoutManageSignups.data &&
    loaded($LayoutManageSignups.data.userCandidates.totalCount) &&
    $page.route.id === '/(app)/signups'
  ) {
    dispatchEvent(
      new CustomEvent('NAVTOP_UPDATE_TITLE', {
        detail: `${countThing('inscription', $LayoutManageSignups.data.userCandidates.totalCount)} en attente`,
      }),
    );
  }
</script>

<svelte:window on:NAVTOP_RELOAD={reloadCandidates} />

<ModalRefuseReason bind:open={openRefusalReason} {...refusing} />

<MaybeError result={$LayoutManageSignups} let:data={{ userCandidates }}>
  <Split mobilePart={$page.route.id === '/(app)/signups' ? 'left' : 'right'}>
    <div
      slot="left"
      class="contents"
      use:infinitescroll={async () => LayoutManageSignups.loadNextPage()}
    >
      <Submenu>
        {#each userCandidates.edges.filter(({ node }) => !$decided.includes(loading(node.email, ''))) as { node: candidate }}
          {@const deciding = $decidingOn.find((e) => e.email === loading(candidate.email, ''))}
          <SubmenuItem
            clickable
            on:click={async () => {
              if (!loaded(candidate.email)) return;
              await goto(route('/signups/edit/[email]', candidate.email));
            }}
            icon={null}
            subtext={mapAllLoading(
              [candidate.email, candidate.createdAt],
              (email, created) => `${created ? formatDateRelativeSmart(created) : ''} · ${email}`,
            )}
          >
            <svelte:fragment slot="icon">
              {#if candidate.major}
                <AvatarMajor major={candidate.major} />
              {/if}
            </svelte:fragment>
            {#if deciding}
              <div
                transition:fade={{ duration: 50 }}
                class="deciding-spinner"
                class:success={deciding.accepted}
                class:danger={!deciding.accepted}
              >
                {#if deciding.accepted}
                  Accepté·e
                {:else}
                  Refusé·e
                {/if}
              </div>
            {/if}
            <LoadingText value={candidate.fullName} />
            <div class="actions" slot="right" class:deciding>
              <ButtonGhost
                help="Refuser l'inscription"
                --text="var(--danger)"
                on:click={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!loaded(candidate.email)) return;
                  refusing = {
                    email: candidate.email,
                    // Retain the refusal reason if we're re-opening the dialog just after closing it
                    why: refusing.email === candidate.email ? refusing.why : '',
                  };
                  openRefusalReason?.();
                }}
              >
                <IconRefuse />
              </ButtonGhost>

              <ButtonGhost
                help="Accepter l'inscription"
                --text="var(--success)"
                on:click={async (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  await decide(candidate.email, true);
                }}
              >
                <IconAccept />
              </ButtonGhost>
              {#if mobile}
                <ButtonGhost>
                  <IconDetails />
                </ButtonGhost>
              {/if}
            </div>
          </SubmenuItem>
        {:else}
          <SubmenuItem icon={null}>Aucune inscription en attente</SubmenuItem>
        {/each}
        {#if userCandidates.pageInfo.hasNextPage}
          <div data-infinitescroll-bottom>
            <SubmenuItem icon={null} subtext={PendingValue}>
              <LoadingText />
            </SubmenuItem>
          </div>
        {/if}
      </Submenu>
    </div>
    <slot slot="right"></slot>
  </Split>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  .actions {
    display: flex;
    gap: 0 1rem;
    align-items: center;
    justify-content: end;
    font-size: 1.2em;
    transition: opacity 0.5s;
  }

  .actions.deciding {
    pointer-events: none;
    opacity: 0.5;
  }

  .deciding-spinner {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-weight: bold;
    background-color: color-mix(in srgb, var(--bg) 75%, transparent);
  }
</style>
