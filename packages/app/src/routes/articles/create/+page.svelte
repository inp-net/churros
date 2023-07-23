<script lang="ts">
  import AvatarGroups from '$lib/components/AvatarGroups.svelte';
  import { me } from '$lib/session';

  const go = (uid: string) => `/club/${uid}/write`;
</script>

<div class="content">
  <h1>Écrire un article pour</h1>

  <AvatarGroups groups={$me?.groups.map(({ group }) => group) ?? []} {go} />
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
