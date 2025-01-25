<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { formatDateRelativeSmart } from '$lib/dates';
  import { LoadingText, loading, mapAllLoading, onceAllLoaded } from '$lib/loading';
  import { route } from '$lib/ROUTES';
  import { infinitescroll } from '$lib/scroll';
  import { isFuture, isWithinInterval } from 'date-fns';
  import IconAdd from '~icons/msl/add';
  import IconInfo from '~icons/msl/info-outline';
  import IconWarning from '~icons/msl/warning-outline';
  import type { PageData } from './$houdini';
  import FormAnnouncement from './FormAnnouncement.svelte';
  import { navtopPushState } from '$lib/navigation';
  import Split from '$lib/components/Split.svelte';

  export let data: PageData;
  $: ({ LayoutAnnouncementsList } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<ModalOrDrawer tall title="Créer une annonce" statebound="NAVTOP_CREATING_ANNOUNCEMENT" let:close>
  <FormAnnouncement
    announcement={null}
    on:saved={async ({ detail }) => {
      await goto(route('/announcements/[id]/edit', detail.localID));
      close?.();
    }}
  />
</ModalOrDrawer>

<MaybeError result={$LayoutAnnouncementsList} let:data={{ announcements }}>
  <Split mobilePart={$page.route.id === '/(app)/announcements' ? 'left' : 'right'}>
    <div
      slot="left"
      class="contents"
      use:infinitescroll={async () => LayoutAnnouncementsList.loadNextPage()}
    >
      <Submenu>
        <SubmenuItem
          clickable
          on:click={() => navtopPushState('NAVTOP_CREATING_ANNOUNCEMENT')}
          icon={IconAdd}
        >
          Nouvelle annonce
        </SubmenuItem>
        {#each announcements.edges as { node }}
          <SubmenuItem
            icon={null}
            href={route('/announcements/[id]/edit', loading(node.localID, ''))}
          >
            <div slot="subtext">
              {#if onceAllLoaded([node.startsAt, node.endsAt], (start, end) => isWithinInterval( new Date(), { start, end }, ), false)}
                <LoadingText class="primary" tag="strong" value="Active"></LoadingText>
                <span class="sep"> · </span>
              {/if}
              <LoadingText
                value={mapAllLoading([node.startsAt, node.endsAt], (start, end) =>
                  isFuture(start)
                    ? `Commence ${formatDateRelativeSmart(start)}`
                    : isFuture(end)
                      ? `Se termine ${formatDateRelativeSmart(end)}`
                      : `Terminée ${formatDateRelativeSmart(end)}`,
                )}
              ></LoadingText>
            </div>
            <div class="icon" slot="icon" class:warning={node.warning}>
              {#if node.warning}
                <IconWarning />
              {:else}
                <IconInfo />
              {/if}
            </div>
            <LoadingText value={node.title} />
          </SubmenuItem>
        {/each}
      </Submenu>
    </div>
    <slot slot="right" />
  </Split>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
