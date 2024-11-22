<script lang="ts">
  import type { PageData } from './$houdini';
  import { page } from '$app/stores';
  import IconAdd from '~icons/msl/add';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { route } from '$lib/ROUTES';
  import { refroute } from '$lib/navigation';
  import { mutate } from '$lib/mutations';
  import {
    onceLoaded,
    mapLoading,
    LoadingText,
    loading,
    mapAllLoading,
    allLoaded,
    onceAllLoaded,
  } from '$lib/loading';
  import Submenu from '$lib/components/Submenu.svelte';
  import { infinitescroll } from '$lib/scroll';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import IconWarning from '~icons/msl/warning-outline';
  import IconInfo from '~icons/msl/info-outline';
  import { formatDateRelativeSmart } from '$lib/dates';
  import { isFuture, isWithinInterval } from 'date-fns';

  export let data: PageData;
  $: ({ PageAnnouncementsList } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageAnnouncementsList} let:data={{ announcements }}>
  <div class="contents" use:infinitescroll={async () => PageAnnouncementsList.loadNextPage()}>
    <Submenu>
      <SubmenuItem href={route('/announcements/create')} icon={IconAdd}>
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
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
