<script lang="ts">
  import { fragment, graphql, PendingValue, type AvatarUser } from '$houdini';
  import Avatar from '$lib/components/Avatar.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { loading, mapLoading, type MaybeLoading } from '$lib/loading';
  import { refroute } from '$lib/navigation';

  /** Include user name next to picture */
  export let name = false;

  export let user: AvatarUser | null | undefined;
  $: data = fragment(
    user,
    graphql(`
      fragment AvatarUser on User @loading {
        fullName
        uid
        pictureURL
      }
    `),
  );

  export let href: MaybeLoading<string> | undefined = undefined;
  $: href ??= mapLoading($data?.uid, (uid) => (uid ? refroute('/[uid=uid]', uid) : PendingValue));
</script>

{#if name}
  <a class="avatar-user" href={loading(href, '')}>
    <Avatar
      {...$$restProps}
      src={$data?.pictureURL}
      href=""
      alt={mapLoading($data?.uid ?? PendingValue, (n) => `Photo de ${n}`)}
      help={$data?.uid}
    />
    <LoadingText value={$data?.fullName} />
  </a>
{:else}
  <Avatar
    {...$$restProps}
    src={$data?.pictureURL}
    {href}
    alt={mapLoading($data?.uid ?? PendingValue, (n) => `Photo de ${n}`)}
    help={$data?.uid}
  />
{/if}

<style>
  .avatar-user {
    display: inline-flex;
    gap: 0.5ch;
    align-items: center;
  }
</style>
