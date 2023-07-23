<script lang="ts">
  import AvatarGroups from '$lib/components/AvatarGroups.svelte';
  import { me } from '$lib/session';

  const asstring = (x: unknown) => x as string;
</script>

<div class="content">
  <h1>Écrire un article pour</h1>

  <AvatarGroups
    groups={$me?.groups.map(({ group }) => group) ?? []}
    go={(uid) => `/club/${asstring(uid)}/write`}
  />
</div>

<style>
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
  }

  h1 {
    text-align: center;
  }
</style>
