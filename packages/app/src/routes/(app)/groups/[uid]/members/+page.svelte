<script lang="ts">
  import GroupMember from '$lib/components/GroupMember.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import { schoolYearRangeOf } from '$lib/dates';
  import { loaded } from '$lib/loading';
  import { infinitescroll } from '$lib/scroll';
  import { tooltip } from '$lib/tooltip';
  import { withPrevious } from '$lib/typing';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageGroupMembers } = data);
</script>

<MaybeError result={$PageGroupMembers} let:data={{ group }}>
  <div class="content">
    <p class="count">
      <LoadingText value={group.membersCount} /> membres
    </p>
    <div
      class="infinite-scroll-wrapper"
      use:infinitescroll={async () => {
        await PageGroupMembers.loadNextPage();
      }}
    >
      <Submenu>
        {#each withPrevious(group.members.edges.map((e) => e.node)) as [membership, previous]}
          {#if loaded(membership.createdAt) && (!previous || loaded(previous.createdAt))}
            {@const joinedRange = schoolYearRangeOf(membership.createdAt)}
            {@const previousJoinedRange =
              previous && loaded(previous.createdAt)
                ? schoolYearRangeOf(previous.createdAt)
                : undefined}
            {#if !previousJoinedRange || joinedRange[0] !== previousJoinedRange[0]}
              <h2
                class="joined-year"
                use:tooltip={`A rejoint dans l'année scolaire ${joinedRange.join('–')}`}
              >
                {joinedRange.join('–')}
              </h2>
            {/if}
          {/if}
          <GroupMember side="user" {membership} />
        {/each}
      </Submenu>
    </div>
  </div>
</MaybeError>

<style>
  .content {
    padding: 1rem;
  }
</style>
