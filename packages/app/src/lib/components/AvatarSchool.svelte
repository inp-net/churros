<script lang="ts">
  import { fragment, graphql, type AvatarSchool } from '$houdini';
  import Avatar from '$lib/components/Avatar.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { mapLoading, onceLoaded } from '$lib/loading';
  import { route } from '$lib/ROUTES';

  export let notooltip = false;

  /** Include school name next to picture */
  export let name = false;

  export let school: AvatarSchool | null;
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

{#if $data}
  {#if name}
    <a
      class="avatar-school"
      href={onceLoaded($data.uid, (uid) => route('/[uid=uid]', uid), '')}
    >
      <Avatar
        --avatar-radius="0.25em"
        src={$data.pictureURL}
        help={notooltip ? '' : $data.name}
        href=""
        alt={mapLoading($data.name, (name) => `Logo de ${name}`)}
      />
      <LoadingText value={$data.name} />
    </a>
  {:else}
    <Avatar
      --avatar-radius="0.25em"
      src={$data.pictureURL}
      help={notooltip ? '' : $data.name}
      href={mapLoading($data.uid, (uid) => route('/[uid=uid]', uid))}
      alt={mapLoading($data.name, (name) => `Logo de ${name}`)}
    />
  {/if}
{/if}

<style>
  .avatar-school {
    display: inline-flex;
    gap: 0.5ch;
    align-items: center;
  }
</style>
