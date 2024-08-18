<script lang="ts">
  import { fragment, graphql, type AvatarMajor } from '$houdini';
  import Avatar from '$lib/components/Avatar.svelte';
  import { mapLoading } from '$lib/loading';
  import { route } from '$lib/ROUTES';

  export let notooltip = false;
  export let major: AvatarMajor | null;
  $: data = fragment(
    major,
    graphql(`
      fragment AvatarMajor on Major {
        pictureURL
        name
        uid
      }
    `),
  );
</script>

{#if $data}
  <Avatar
    --avatar-radius="0.25em"
    src={$data.pictureURL}
    href={mapLoading($data.uid, (uid) => route('/[uid=uid]', uid))}
    help={notooltip ? '' : $data.name}
    alt={mapLoading($data.name, (name) => `Logo de ${name}`)}
  />
{/if}
