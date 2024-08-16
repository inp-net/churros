<script lang="ts">
  import { fragment, graphql, PendingValue, type AvatarStudentAssociation } from '$houdini';
  import Avatar from '$lib/components/Avatar.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { loading, mapLoading, type MaybeLoading } from '$lib/loading';
  import { refroute } from '$lib/navigation';

  /** Show name next to picture*/
  export let name = false;

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
  $: href ??= mapLoading($data?.uid, (uid) => (uid ? refroute('/[uid=uid]', uid) : PendingValue));
</script>

{#if name}
  <a href={loading(href, '')} class="avatar-student-association">
    <Avatar
      {...$$restProps}
      src={$data?.pictureURL ?? ''}
      href=""
      alt={mapLoading($data?.name ?? PendingValue, (n) => `Logo de ${n}`)}
      help={$data?.name}
    />
    <LoadingText value={$data?.name} />
  </a>
{:else}
  <Avatar
    {...$$restProps}
    src={$data?.pictureURL ?? ''}
    {href}
    alt={mapLoading($data?.name ?? PendingValue, (n) => `Logo de ${n}`)}
    help={$data?.name}
  />
{/if}

<style>
  .avatar-student-association {
    display: inline-flex;
    align-items: center;
    gap: 0.5ch;
  }
</style>
