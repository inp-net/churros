<script lang="ts">
  import { fragment, graphql, PendingValue, type AvatarStudentAssociation } from '$houdini';
  import Avatar from '$lib/components/Avatar.svelte';
  import { mapLoading, type MaybeLoading } from '$lib/loading';
  import { refroute } from '$lib/navigation';

  export let studentAssociation: AvatarStudentAssociation | null;
  $: data = fragment(
    studentAssociation,
    graphql(`
      fragment AvatarStudentAssociation on StudentAssociation @loading {
        name
        uid
        pictureURL
      }
    `),
  );

  export let href: MaybeLoading<string> | undefined = undefined;
  $: href ??= mapLoading($data?.uid, (uid) =>
    uid ? refroute('/student-associations/[uid]', uid) : PendingValue,
  );
</script>

<Avatar
  {...$$restProps}
  src={$data?.pictureURL ?? ''}
  {href}
  alt={mapLoading($data?.name ?? PendingValue, (n) => `Logo de ${n}`)}
  help={$data?.name}
/>
