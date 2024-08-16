<script lang="ts">
  import { fragment, graphql, PendingValue, type AvatarGroup } from '$houdini';
  import Avatar from '$lib/components/Avatar.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { loading, mapLoading, type MaybeLoading } from '$lib/loading';
  import { refroute } from '$lib/navigation';
  import { isDark } from '$lib/theme';

  /** Include group name next to picture */
  export let name = false;

  export let group: AvatarGroup | null;
  $: data = fragment(
    group,
    graphql(`
      fragment AvatarGroup on Group @loading {
        name
        uid
        pictureURL
        pictureURLDark: pictureURL(dark: true)
      }
    `),
  );

  export let href: MaybeLoading<string> | undefined = undefined;
  $: href ??= mapLoading($data?.uid, (uid) =>
    uid ? refroute('/[uid=uid]', uid) : PendingValue,
  );

  $: src = $isDark ? $data?.pictureURLDark : $data?.pictureURL;
</script>

{#if name}
  <a class="avatar-group" href={loading(href, '')}>
    <Avatar
      {...$$restProps}
      {src}
      href=""
      alt={mapLoading($data?.name ?? PendingValue, (n) => `Logo de ${n}`)}
      help={$data?.name}
    />
    <LoadingText value={$data?.name} />
  </a>
{:else}
  <Avatar
    {...$$restProps}
    {src}
    {href}
    alt={mapLoading($data?.name ?? PendingValue, (n) => `Logo de ${n}`)}
    help={$data?.name}
  />
{/if}

<style>
  .avatar-group {
    display: inline-flex;
    gap: 0.5ch;
    align-items: center;
  }
</style>
