<script lang="ts">
  import { pushState } from '$app/navigation';
  import { page } from '$app/stores';
  import GroupMember from '$lib/components/GroupMember.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalSearchUser from '$lib/components/ModalSearchUser.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { schoolYearRangeOf } from '$lib/dates';
  import { loaded } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import { infinitescroll } from '$lib/scroll';
  import { tooltip } from '$lib/tooltip';
  import { withPrevious } from '$lib/typing';
  import IconAdd from '~icons/msl/add';
  import type { PageData } from './$houdini';
  import ModalGroupMemberDetails from './ModalGroupMemberDetails.svelte';
  import { AddGroupMember } from './mutations';
  import { queryParam } from 'sveltekit-search-params';
  import { graphql } from '$houdini';
  import InputSearchQuery from '$lib/components/InputSearchQuery.svelte';

  export let data: PageData;
  $: ({ PageGroupMembers } = data);

  $: editingMember = $PageGroupMembers.data?.group.members.edges.find(
    (e) => e.node.user.uid === $page.state.EDITING_GROUP_MEMBER,
  )?.node;

  const searchQuery = queryParam('q');

  const SearchResults = graphql(`
    query PageGroupMembersSearchUsers($group: String!, $q: String!) {
      group(uid: $group) {
        searchMembers(q: $q) {
          membership {
            user {
              uid
            }
            createdAt
            ...ModalGroupMemberDetails
            ...GroupMember
          }
        }
      }
    }
  `);
</script>

<ModalGroupMemberDetails
  on:removeFromGroup={async () => {
    PageGroupMembers.fetch({ variables: { uid: $page.params.uid } });
  }}
  membership={editingMember ?? null}
/>

<MaybeError result={$PageGroupMembers} let:data={{ group }}>
  <ModalSearchUser
    queryPlaceholder="Ajouter un membre"
    statebound="NAVTOP_CREATING_GROUP_MEMBER"
    on:pick={async ({ detail }) => {
      await mutateAndToast(AddGroupMember, {
        group: group.uid,
        user: detail,
      });
      await PageGroupMembers.fetch({ variables: { uid: $page.params.uid } });
    }}
  />

  <div class="content">
    <search>
      <InputSearchQuery
        placeholder="Rechercher un membre"
        q={$searchQuery}
        on:debouncedInput={async ({ detail }) => {
          if (detail)
            {await SearchResults.fetch({
              variables: {
                group: $page.params.uid,
                q: detail,
              },
            });}
          $searchQuery = detail;
        }}
      />
    </search>
    <p class="count">
      {#if $searchQuery}
        <LoadingText value={$SearchResults.data?.group.searchMembers.length} /> résultats
      {:else}
        <LoadingText value={group.membersCount} /> membres
      {/if}
    </p>
    <div
      class="infinite-scroll-wrapper"
      use:infinitescroll={async () => {
        await PageGroupMembers.loadNextPage();
      }}
    >
      <Submenu>
        <SubmenuItem
          icon={IconAdd}
          clickable
          on:click={() => {
            pushState('', {
              NAVTOP_CREATING_GROUP_MEMBER: true,
            });
          }}
        >
          Ajouter un membre
        </SubmenuItem>
        {#each withPrevious($searchQuery && $SearchResults.data ? $SearchResults.data?.group.searchMembers.map((r) => r.membership) : group.members.edges.map((e) => e.node)) as [membership, previous]}
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
          <GroupMember
            on:click={() => {
              if (!loaded(membership.user.uid)) return;
              pushState('', {
                EDITING_GROUP_MEMBER: membership.user.uid,
              });
            }}
            side="user"
            {membership}
          />
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
