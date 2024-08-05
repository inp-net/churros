<script lang="ts">
  import { fragment, graphql, PendingValue, type AvatarGroup } from '$houdini';
  import Avatar from '$lib/components/Avatar.svelte';
  import { mapLoading, type MaybeLoading } from '$lib/loading';
  import { route } from '$lib/ROUTES';
  import { isDark } from '$lib/theme';

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
  $: href ??= mapLoading($data?.uid, (uid) => (uid ? route('/groups/[uid]', uid) : PendingValue));

  $: src = $isDark ? $data?.pictureURLDark : $data?.pictureURL;
</script>

<Avatar
  {...$$restProps}
  {src}
  {href}
  alt={mapLoading($data?.name ?? PendingValue, (n) => `Photo de ${n}`)}
  help={$data?.name}
/>
