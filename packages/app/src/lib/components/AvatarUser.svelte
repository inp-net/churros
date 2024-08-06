<script lang="ts">
  import { fragment, graphql, PendingValue, type AvatarUser } from '$houdini';
  import Avatar from '$lib/components/Avatar.svelte';
  import { mapLoading, type MaybeLoading } from '$lib/loading';
  import { route } from '$lib/ROUTES';

  export let user: AvatarUser | null;
  $: data = fragment(
    user,
    graphql(`
      fragment AvatarUser on User @loading {
        uid
        pictureURL
      }
    `),
  );

  export let href: MaybeLoading<string> | undefined = undefined;
  $: href ??= mapLoading($data?.uid, (uid) => (uid ? route('/users/[uid]', uid) : PendingValue));
</script>

<Avatar
  {...$$restProps}
  src={$data?.pictureURL}
  {href}
  alt={mapLoading($data?.uid ?? PendingValue, (n) => `Photo de ${n}`)}
  help={$data?.uid}
/>
