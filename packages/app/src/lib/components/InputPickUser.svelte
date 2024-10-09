<script lang="ts">
  import { graphql } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import ModalSearchUser from '$lib/components/ModalSearchUser.svelte';
  import { LoadingText, type MaybeLoading } from '$lib/loading';

  export let uid: string | null = null;
  export let label: MaybeLoading<string> = 'Choisir un·e utilisateur·rice…';

  let open: () => undefined;

  const pickedUser = graphql(`
    query InputPickUser_PickedUser($uid: String!) @loading {
      user(uid: $uid) {
        ...AvatarUser
      }
    }
  `);

  $: if (uid) pickedUser.fetch({ variables: { uid } });
</script>

<ModalSearchUser
  bind:open
  on:pick={({ detail }) => {
    uid = detail;
  }}
/>
<ButtonSecondary on:click={open}>
  {#if uid && $pickedUser.data?.user}
    <AvatarUser name user={$pickedUser.data.user} />
  {:else}
    <LoadingText value={label} />
  {/if}
</ButtonSecondary>
