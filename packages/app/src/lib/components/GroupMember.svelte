<script lang="ts">
  import { fragment, graphql, PendingValue, type GroupMember } from '$houdini';
  import Avatar from '$lib/components/Avatar.svelte';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { allLoaded, mapAllLoading } from '$lib/loading';

  /**
   * 'group' to show the group name (to be used on a user's profile, for example)
   * 'user' to show the user's name (to be used on a group's members list, for example)
   */
  export let side: 'group' | 'user' = 'user';

  export let href: string | undefined = undefined;

  export let membership: GroupMember | null;
  $: data = fragment(
    membership,
    graphql(`
      fragment GroupMember on GroupMember @loading {
        canEditArticles
        canScanEvents
        canEditMembers
        secretary
        treasurer
        vicePresident
        president
        roleEmojis
        title
        user {
          fullName
          uid
          ...AvatarUser
        }
        group {
          name
          uid
          ...AvatarGroup
        }
      }
    `),
  );
</script>

<SubmenuItem overflow icon={null} clickable={!href} {href} on:click subtext={$data?.title}>
  <div class="picture" slot="icon">
    <span class="rolemojis">
      <LoadingText value={$data?.roleEmojis ?? ''} />
    </span>
    {#if !$data || !allLoaded($data)}
      <Avatar href="" help="" src={PendingValue} />
    {:else if side === 'group'}
      <AvatarGroup href="" group={$data.group} />
    {:else}
      <AvatarUser href="" user={$data.user} />
    {/if}
  </div>
  <div class="text">
    <span>
      <LoadingText
        value={$data
          ? mapAllLoading([$data.user, $data.group], (user, group) =>
              side === 'group' ? group.name : user.fullName,
            )
          : PendingValue}
      />
    </span>
  </div>
</SubmenuItem>

<style>
  .picture {
    --avatar-size: 2.5rem;

    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rolemojis {
    position: absolute;
    top: -1ch;
    right: -0.25ch;
    z-index: 10;
    font-size: 1.25rem;
    rotate: 20deg;
  }
</style>
