<script lang="ts">
  import { fragment, graphql, type AvatarSchool } from '$houdini';
  import Avatar from '$lib/components/Avatar.svelte';
  import { mapLoading } from '$lib/loading';
  import { route } from '$lib/ROUTES';

  export let notooltip = false;
  export let school: AvatarSchool;
  $: data = fragment(
    school,
    graphql(`
      fragment AvatarSchool on School {
        pictureURL
        name
        uid
      }
    `),
  );
</script>

<Avatar
  src={$data.pictureURL}
  href={mapLoading($data.uid, (uid) => route('/schools/[uid]', uid))}
  help={notooltip ? '' : $data.name}
  alt={mapLoading($data.name, (name) => `Logo de ${name}`)}
/>
