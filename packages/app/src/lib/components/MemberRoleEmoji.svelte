<script lang="ts">
  import { fragment, graphql, PendingValue, type MemberRoleEmoji } from '$houdini';
  import { LoadingText, mapAllLoading } from '$lib/loading';
  export let membership: MemberRoleEmoji | null;
  $: data = fragment(
    membership,
    graphql(`
      fragment MemberRoleEmoji on GroupMember @loading {
        president
        treasurer
        vicePresident
        secretary
      }
    `),
  );
</script>

<span class="role-emoji">
  <LoadingText
    value={$data
      ? mapAllLoading(
          [$data.president, $data.treasurer, $data.vicePresident, $data.secretary],
          (prez, trez, vp, secr) => {
            let result = '';
            if (prez) result += '👑';
            if (trez) result += '💰';
            if (vp) result += '🌟';
            if (secr) result += '📜';
            return result;
          },
        )
      : PendingValue}>..</LoadingText
  >
</span>

<style>
  .role-emoji {
    display: inline-flex;
    width: 1.2em;
  }
</style>
